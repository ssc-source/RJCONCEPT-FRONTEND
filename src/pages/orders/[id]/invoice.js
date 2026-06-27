import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/format';
import DocumentTemplate from '../../../components/pdf/DocumentTemplate';
import { buildDocumentConfig } from '../../../utils/documentSchemas';
import { useDocumentDownload } from '../../../hooks/useDocumentDownload';

export default function InvoicePage() {
  const { downloadDocument } = useDocumentDownload();
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownloadInvoice = async () => {
    if (!invoice?.order) return;
    try {
      await downloadDocument('customer-invoice-document-area', `invoice-${invoice.order.id}.pdf`);
    } catch (error) {
      alert(error.message || 'Unable to download invoice PDF');
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    api.get(`/orders/my/${id}/invoice`)
      .then((response) => setInvoice(response.data || null))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading invoice...</div>;
  }

  if (!invoice?.order) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Invoice not available.</div>;
  }

  const { order, payment, invoiceNumber, issuedAt, seller } = invoice;

  const customerInvoiceDocument = buildDocumentConfig('invoice', {
    order: {
      ...order,
      id: invoiceNumber || order.id,
      createdAt: issuedAt,
      status: order.status,
      totalAmount: order.totalAmount,
    },
    formatCurrency,
  });

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Invoice</h1>
            <p className="mt-2 text-sm text-slate-500">{invoiceNumber}</p>
            <p className="text-sm text-slate-500">Issued on {new Date(issuedAt).toLocaleString()}</p>
          </div>
          <button type="button" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white" onClick={handleDownloadInvoice}>
            Download Invoice
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Seller</p>
            <p className="mt-3 font-semibold text-slate-900">{seller.name}</p>
            <p className="text-sm text-slate-600">{seller.email}</p>
            <p className="text-sm text-slate-600">{seller.phone}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer</p>
            <p className="mt-3 font-semibold text-slate-900">{order.customerName || 'Customer'}</p>
            <p className="text-sm text-slate-600">{order.customerEmail || 'No email'}</p>
            <p className="text-sm text-slate-600">{order.customerPhone || 'No phone'}</p>
            {order.deliveryAddress ? (
              <p className="mt-2 text-sm text-slate-600">
                {order.deliveryAddress.addressLine1}
                {order.deliveryAddress.addressLine2 ? `, ${order.deliveryAddress.addressLine2}` : ''}
                <br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(order.OrderItems || []).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">{item.title}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.itemType === 'PRODUCT' ? 'Book' : 'Test Series'}</td>
                  <td className="px-4 py-4 text-right text-sm text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payment</p>
            <p className="mt-3 text-sm text-slate-600">Method: <span className="font-semibold text-slate-900">{payment?.method || 'Razorpay'}</span></p>
            <p className="text-sm text-slate-600">Payment ID: <span className="font-semibold text-slate-900">{payment?.razorpayPaymentId || payment?.transactionId || order.paymentId || 'Pending'}</span></p>
            <p className="text-sm text-slate-600">Status: <span className="font-semibold text-slate-900">{order.status}</span></p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</p>
            <p className="mt-3 text-3xl font-extrabold text-emerald-600">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>
      </div>

      <div id="customer-invoice-document-area" className="fixed left-[-99999px] top-0">
        <DocumentTemplate
          title={customerInvoiceDocument.title}
          generatedAt={customerInvoiceDocument.generatedAt}
          metadata={[
            ...customerInvoiceDocument.metadata,
            { label: 'Payment ID', value: payment?.razorpayPaymentId || payment?.transactionId || order.paymentId || 'Pending' },
            { label: 'Payment Method', value: payment?.method || 'Razorpay' },
          ]}
          columns={customerInvoiceDocument.columns}
          rows={customerInvoiceDocument.rows}
          headerClassName={customerInvoiceDocument.headerClassName}
          logoClassName={customerInvoiceDocument.logoClassName}
          institution={{
            name: seller?.name || 'RJ Concept',
            email: seller?.email || 'support@rjconcept.in',
            phone: seller?.phone || '+91-00000-00000',
          }}
          footerNote={customerInvoiceDocument.footerNote}
        />
      </div>
    </div>
  );
}
