import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/format';

const initialQuery = {
  status: '',
  search: '',
  failedOnly: false,
};

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return 'N/A';
  }
};

export default function AdminPaymentsPage() {
  const adminMeta = { meta: { scope: 'admin' } };
  const [query, setQuery] = useState(initialQuery);
  const [paymentState, setPaymentState] = useState({
    payments: [],
    total: 0,
    summary: null,
  });
  const [loading, setLoading] = useState(true);

  const loadPayments = async (activeQuery = query) => {
    setLoading(true);
    try {
      const response = await api.get('/payment/admin', {
        params: {
          ...activeQuery,
          failedOnly: activeQuery.failedOnly ? 'true' : 'false',
        },
        ...adminMeta,
      });

      const payload = response?.data || {};
      setPaymentState({
        payments: Array.isArray(payload.payments) ? payload.payments : [],
        total: Number(payload.total || 0),
        summary: payload.summary || null,
      });
    } catch (error) {
      setPaymentState({ payments: [], total: 0, summary: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(initialQuery).catch(() => {});
  }, []);

  const cards = useMemo(() => {
    const summary = paymentState.summary || {};
    return [
      { label: 'Visible Logs', value: paymentState.total || 0, tone: 'text-slate-900' },
      { label: 'Successful', value: Number(summary.successCount || 0), tone: 'text-emerald-600' },
      { label: 'Failed / Closed', value: Number(summary.failedCount || 0), tone: 'text-rose-600' },
      { label: 'Pending', value: Number(summary.pendingCount || 0), tone: 'text-amber-600' },
      { label: 'Visible Amount', value: formatCurrency(Number(summary.totalAmount || 0)), tone: 'text-blue-600' },
    ];
  }, [paymentState]);

  const visiblePayments = paymentState.payments || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Payment Logs</h1>
        <p className="mt-1 text-sm text-slate-500">Review gateway activity, inspect failed payments, and trace each order-backed transaction.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            <p className={`mt-3 text-3xl font-extrabold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <form
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1.2fr_0.7fr_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          loadPayments(query).catch(() => {});
        }}
      >
        <input
          className="rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Search payment ID, order ID, Razorpay IDs, gateway status"
          value={query.search}
          onChange={(event) => setQuery((current) => ({ ...current, search: event.target.value }))}
        />
        <select
          className="rounded-xl border border-slate-200 px-4 py-3"
          value={query.status}
          onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={query.failedOnly}
            onChange={(event) => setQuery((current) => ({ ...current, failedOnly: event.target.checked }))}
          />
          Failed payments only
        </label>
        <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Apply Filters</button>
      </form>

      <div className="space-y-5">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">Loading payment logs...</div>
        ) : null}

        {!loading && visiblePayments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">No payment logs matched the current filters.</div>
        ) : null}

        {!loading && visiblePayments.map((payment) => (
          <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Payment ID</p>
                <p className="font-bold text-slate-900">{payment.id}</p>
                <p className="mt-1 text-sm text-slate-500">Order {payment.orderId || 'N/A'} | Method {payment.method || 'N/A'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{payment.status || 'UNKNOWN'}</span>
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{formatCurrency(payment.amount)}</span>
                {payment.gatewayStatus ? (
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{payment.gatewayStatus}</span>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gateway References</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Razorpay Order</p>
                      <p className="mt-2 font-semibold text-slate-900 break-all">{payment.razorpayOrderId || payment.paymentId || 'N/A'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Gateway Payment</p>
                      <p className="mt-2 font-semibold text-slate-900 break-all">{payment.razorpayPaymentId || payment.transactionId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer / Order</p>
                  <p className="mt-2 font-semibold text-slate-900">{payment.Order?.customerName || payment.User?.name || 'Unknown customer'}</p>
                  <p className="text-sm text-slate-600">{payment.Order?.customerEmail || payment.User?.email || 'No email available'}</p>
                  <p className="text-sm text-slate-500">{payment.Order?.customerPhone || 'No phone available'}</p>
                  <p className="mt-3 text-sm text-slate-600">Order Type: <span className="font-semibold text-slate-900">{payment.Order?.orderType || 'N/A'}</span></p>
                  <p className="text-sm text-slate-600">Order Status: <span className="font-semibold text-slate-900">{payment.Order?.status || 'N/A'}</span></p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lifecycle</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-600">
                    <p>Created: <span className="font-semibold text-slate-900">{formatDateTime(payment.createdAt)}</span></p>
                    <p>Verified: <span className="font-semibold text-slate-900">{formatDateTime(payment.verifiedAt)}</span></p>
                    <p>Expires: <span className="font-semibold text-slate-900">{formatDateTime(payment.expiresAt)}</span></p>
                    <p>Cancelled: <span className="font-semibold text-slate-900">{formatDateTime(payment.cancelledAt)}</span></p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Failure / Recovery Notes</p>
                  <p className="mt-2 text-sm text-slate-700">{payment.failureReason || 'No failure recorded for this payment.'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}