import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/format';
import DocumentTemplate from '../../../components/pdf/DocumentTemplate';
import { buildDocumentConfig } from '../../../utils/documentSchemas';
import { useDocumentDownload } from '../../../hooks/useDocumentDownload';

const filters = {
  status: '',
  orderType: '',
  search: '',
};

const shipmentDraftDefaults = {
  status: 'PROCESSING',
  courier: '',
  trackingId: '',
  message: '',
};

export default function AdminOrdersPage() {
  const { downloadDocument } = useDocumentDownload();
  const adminMeta = { meta: { scope: 'admin' } };
  const [orders, setOrders] = useState([]);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [shipmentDrafts, setShipmentDrafts] = useState({});

  const loadOrders = async (activeQuery = query) => {
    setLoading(true);
    try {
      const [ordersResponse, statsResponse] = await Promise.all([
        api.get('/orders/admin', { params: activeQuery, ...adminMeta }),
        api.get('/orders/admin/stats', adminMeta),
      ]);

      const ordersPayload = ordersResponse?.data;
      const safeOrders = Array.isArray(ordersPayload)
        ? ordersPayload
        : Array.isArray(ordersPayload?.orders)
          ? ordersPayload.orders
          : [];

      setOrders(safeOrders);
      setStats(statsResponse.data || null);
      setShipmentDrafts((current) => {
        const next = { ...(current || {}) };
        for (const order of safeOrders) {
          next[order.id] = next[order.id] || {
            status: order.shipment?.status || 'PROCESSING',
            courier: order.shipment?.courier || '',
            trackingId: order.shipment?.trackingId || '',
            message: '',
          };
        }
        return next;
      });
    } catch (error) {
      setOrders([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(filters).catch(() => {});
  }, []);

  const visibleOrders = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);

  const handleFilterSubmit = async (event) => {
    event.preventDefault();
    await loadOrders(query);
  };

  const handleShipmentUpdate = async (orderId) => {
    const draft = shipmentDrafts[orderId] || shipmentDraftDefaults;
    setSavingId(orderId);
    try {
      await api.put(`/orders/admin/${orderId}/shipment`, draft, adminMeta);
      await loadOrders(query);
    } catch (error) {
      alert(error.message || 'Unable to update shipment');
    } finally {
      setSavingId(null);
    }
  };

  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders ?? 0 },
    { label: 'Paid Orders', value: stats?.paidOrders ?? 0 },
    { label: 'Revenue', value: formatCurrency(stats?.revenue ?? 0) },
    { label: 'Books Sold', value: stats?.booksSold ?? 0 },
    { label: 'Tests Sold', value: stats?.testsSold ?? 0 },
  ];

  const handleDownloadInvoice = async (order) => {
    try {
      setInvoiceOrder(order);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await downloadDocument('invoice-document-area', `invoice-${order.id}.pdf`);
    } catch (error) {
      alert(error.message || 'Unable to download invoice PDF');
    }
  };

  const invoiceDocument = useMemo(
    () => buildDocumentConfig('invoice', { order: invoiceOrder, formatCurrency }),
    [invoiceOrder]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Commerce Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Review paid orders, monitor shipping, and keep customers updated from one admin view.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleFilterSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1.2fr_0.7fr_0.7fr_auto]">
        <input
          className="rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Search by order ID, customer, email, phone"
          value={query.search}
          onChange={(e) => setQuery((current) => ({ ...(current || {}), search: e.target.value }))}
        />
        <select
          className="rounded-xl border border-slate-200 px-4 py-3"
          value={query.orderType}
          onChange={(e) => setQuery((current) => ({ ...(current || {}), orderType: e.target.value }))}
        >
          <option value="">All order types</option>
          <option value="PRODUCT">Books</option>
          <option value="TEST_SERIES">Tests</option>
          <option value="MIXED">Mixed</option>
        </select>
        <select
          className="rounded-xl border border-slate-200 px-4 py-3"
          value={query.status}
          onChange={(e) => setQuery((current) => ({ ...(current || {}), status: e.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
        </select>
        <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Apply Filters</button>
      </form>

      <div className="space-y-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">Loading orders...</div>
        ) : null}

        {!loading && visibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">No orders matched the current filters.</div>
        ) : null}

        {!loading && visibleOrders.map((order) => {
          const draft = (shipmentDrafts?.[order.id]) || shipmentDraftDefaults;
          const hasPhysicalItems = (order.OrderItems || []).some((item) => item.itemType === 'PRODUCT');

          return (
            <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order ID</p>
                  <p className="font-bold text-slate-900">{order.id}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.customerName || 'Unknown customer'} | {order.customerEmail || 'No email'} | {order.customerPhone || 'No phone'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{order.status}</span>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.orderType}</span>
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{formatCurrency(order.totalAmount)}</span>
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                    onClick={() => handleDownloadInvoice(order)}
                  >
                    Download Invoice
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Items</p>
                    <div className="mt-3 space-y-3">
                      {(order.OrderItems || []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="text-sm text-slate-500">{item.itemType === 'PRODUCT' ? 'Book order' : 'Test purchase'} | Qty {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-slate-900">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.deliveryAddress ? (
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery Address</p>
                      <p className="mt-2 font-semibold text-slate-900">{order.deliveryAddress.name} | {order.deliveryAddress.phone}</p>
                      <p className="text-sm text-slate-600">
                        {order.deliveryAddress.addressLine1}
                        {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
                      </p>
                      <p className="text-sm text-slate-500">{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                      {order.whatsappUpdates ? <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">WhatsApp updates enabled</p> : null}
                    </div>
                  ) : null}

                  {order.trackingEvents?.length ? (
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tracking Timeline</p>
                      <div className="mt-3 space-y-3">
                        {order.trackingEvents.map((event) => (
                          <div key={event.id} className="rounded-xl bg-slate-50 px-4 py-3">
                            <p className="font-semibold text-slate-900">{event.status}</p>
                            <p className="text-sm text-slate-600">{event.message || 'Status updated'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Shipment Controls</p>
                  {hasPhysicalItems ? (
                    <div className="mt-4 space-y-4">
                      <select
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        value={draft.status}
                        onChange={(e) => setShipmentDrafts((current) => ({ ...(current || {}), [order.id]: { ...draft, status: e.target.value } }))}
                      >
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        placeholder="Courier"
                        value={draft.courier}
                        onChange={(e) => setShipmentDrafts((current) => ({ ...(current || {}), [order.id]: { ...draft, courier: e.target.value } }))}
                      />
                      <input
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        placeholder="Tracking ID"
                        value={draft.trackingId}
                        onChange={(e) => setShipmentDrafts((current) => ({ ...(current || {}), [order.id]: { ...draft, trackingId: e.target.value } }))}
                      />
                      <textarea
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        rows="4"
                        placeholder="Internal note / customer-facing tracking message"
                        value={draft.message}
                        onChange={(e) => setShipmentDrafts((current) => ({ ...(current || {}), [order.id]: { ...draft, message: e.target.value } }))}
                      />
                      <button
                        type="button"
                        disabled={savingId === order.id}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        onClick={() => handleShipmentUpdate(order.id)}
                      >
                        {savingId === order.id ? 'Saving...' : 'Update Shipment'}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No shipment controls are needed for test-only orders.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div id="invoice-document-area" className="fixed left-[-99999px] top-0">
        {invoiceOrder ? (
          <DocumentTemplate
            title={invoiceDocument.title}
            generatedAt={invoiceDocument.generatedAt}
            metadata={invoiceDocument.metadata}
            columns={invoiceDocument.columns}
            rows={invoiceDocument.rows}
            footerNote={invoiceDocument.footerNote}
            headerClassName={invoiceDocument.headerClassName}
            logoClassName={invoiceDocument.logoClassName}
          />
        ) : null}
      </div>
    </div>
  );
}
