import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { buildTestSeriesTestsPath } from '../../utils/testRoutes';
import api from '../../services/api';
import { pushToast } from '../../stores/toastStore';
import { formatCurrency } from '../../utils/format';

function formatEventTime(value) {
  if (!value) {
    return '';
  }

  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return '';
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders/my'),
      api.get('/orders/my/refunds').catch(() => ({ data: [] })),
    ])
      .then(([ordersResponse, refundsResponse]) => {
        setOrders(ordersResponse.data || []);
        setRefunds(refundsResponse.data || []);
      })
      .catch(() => {
        setOrders([]);
        setRefunds([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') {
      return orders;
    }

    return orders.filter((order) => (order.OrderItems || []).some((item) => item.itemType === activeTab));
  }, [orders, activeTab]);

  const refundByOrderId = useMemo(() => {
    const map = {};
    for (const refund of refunds) {
      if (!map[refund.orderId]) {
        map[refund.orderId] = refund;
      }
    }
    return map;
  }, [refunds]);

  const requestRefund = async (orderId) => {
    const reason = window.prompt('Please enter the reason for this refund request (minimum 10 characters).');
    if (!reason) {
      return;
    }

    try {
      await api.post(`/orders/my/${orderId}/refund`, { reason });
      const refundsResponse = await api.get('/orders/my/refunds');
      setRefunds(refundsResponse.data || []);
      pushToast({
        title: 'Refund requested',
        description: 'Your refund request has been submitted for review.',
        type: 'success',
      });
    } catch (error) {
      pushToast({
        title: 'Refund request failed',
        description: error.message || 'Unable to request refund.',
        type: 'error',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">My Orders</h1>
          <p className="mt-2 text-slate-600">Track your books, digital access, and payment progress in one place.</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'PRODUCT', 'TEST_SERIES'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'ALL' ? 'All' : tab === 'PRODUCT' ? 'Books' : 'Tests'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading your orders...
        </div>
      ) : null}

      {!isLoading && filteredOrders.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg text-slate-600">No orders found.</p>
          <Link href="/store" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            Continue Shopping
          </Link>
        </div>
      ) : null}

      <div className="mt-8 space-y-6">
        {filteredOrders.map((order) => {
          const trackingEvents = [...(order.trackingEvents || [])].sort(
            (left, right) => new Date(left.timestamp || left.createdAt || 0) - new Date(right.timestamp || right.createdAt || 0)
          );
          const hasPhysicalItems = (order.OrderItems || []).some((item) => item.itemType === 'PRODUCT');
          const refund = refundByOrderId[order.id];

          return (
            <div key={order.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order ID</p>
                  <p className="font-bold text-slate-900">{order.id}</p>
                  <p className="mt-1 text-sm text-slate-500">{order.orderType || 'PRODUCT'} order</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{order.status}</span>
                  {order.shipment?.status ? (
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{order.shipment.status}</span>
                  ) : null}
                  {refund ? (
                    <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Refund {refund.status}</span>
                  ) : null}
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                {(order.OrderItems || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.itemType === 'PRODUCT' ? `Book order | Qty ${item.quantity}` : `Test series purchase | Qty ${item.quantity}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}</p>
                      {item.itemType === 'TEST_SERIES' && buildTestSeriesTestsPath(item.testSeriesId) ? (
                        <Link href={buildTestSeriesTestsPath(item.testSeriesId)} className="text-sm font-semibold text-blue-600">
                          Open Series
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {hasPhysicalItems && order.deliveryAddress ? (
                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery Address</p>
                  <p className="mt-2 font-semibold text-slate-900">{order.deliveryAddress.name} | {order.deliveryAddress.phone}</p>
                  <p className="text-sm text-slate-600">
                    {order.deliveryAddress.addressLine1}
                    {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
                  </p>
                  <p className="text-sm text-slate-500">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                  {order.deliveryAddress.landmark ? <p className="text-sm text-slate-500">Landmark: {order.deliveryAddress.landmark}</p> : null}
                  {order.whatsappUpdates ? <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">WhatsApp updates enabled</p> : null}
                </div>
              ) : null}

              {order.shipment ? (
                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Shipment</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>Tracking ID: <strong className="text-slate-900">{order.shipment.trackingId}</strong></span>
                    <span>Courier: <strong className="text-slate-900">{order.shipment.courier || 'Pending assignment'}</strong></span>
                    <span>Status: <strong className="text-slate-900">{order.shipment.status}</strong></span>
                  </div>
                </div>
              ) : null}

              {trackingEvents.length ? (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tracking Timeline</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {trackingEvents.map((event) => (
                      <div key={event.id} className="rounded-2xl border border-slate-100 px-4 py-3">
                        <p className="font-semibold text-slate-900">{event.status}</p>
                        <p className="mt-1 text-sm text-slate-600">{event.message || 'Status updated'}</p>
                        <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{formatEventTime(event.timestamp || event.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/orders/${order.id}/invoice`} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  View Invoice
                </Link>
                {order.status === 'SUCCESS' && !refund ? (
                  <button type="button" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" onClick={() => requestRefund(order.id)}>
                    Request Refund
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
