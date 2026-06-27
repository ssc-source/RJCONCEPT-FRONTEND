import { useEffect, useState } from 'react';
import api from '../../../services/api';

export default function AdminRefundsPage() {
  const adminMeta = { meta: { scope: 'admin' } };
  const [refunds, setRefunds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const loadRefunds = async (status = statusFilter) => {
    try {
      const response = await api.get('/orders/admin/refunds', { params: status ? { status } : {}, ...adminMeta });
      setRefunds(response.data || []);
      setDrafts((current) => {
        const next = { ...current };
        for (const refund of response.data || []) {
          next[refund.id] = next[refund.id] || { status: refund.status, adminNote: refund.adminNote || '' };
        }
        return next;
      });
    } catch (error) {
      setRefunds([]);
    }
  };

  useEffect(() => {
    loadRefunds('').catch(() => {});
  }, []);

  const submitUpdate = async (refundId) => {
    const draft = drafts[refundId];
    setSavingId(refundId);
    try {
      await api.put(`/orders/admin/refunds/${refundId}`, draft, adminMeta);
      await loadRefunds(statusFilter);
    } catch (error) {
      alert(error.message || 'Unable to update refund');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Refund Requests</h1>
        <p className="mt-1 text-sm text-slate-500">Review refund claims, record decisions, and keep a clear audit trail.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <select
            className="rounded-xl border border-slate-200 px-4 py-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="PROCESSED">Processed</option>
          </select>
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white" onClick={() => loadRefunds(statusFilter)}>
            Apply Filter
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {refunds.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">No refund requests found.</div>
        ) : null}

        {refunds.map((refund) => {
          const draft = drafts[refund.id] || { status: refund.status, adminNote: refund.adminNote || '' };
          return (
            <div key={refund.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Refund Request</p>
                  <p className="font-bold text-slate-900">{refund.id}</p>
                  <p className="mt-1 text-sm text-slate-500">Order {refund.orderId}</p>
                </div>
                <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{refund.status}</span>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Customer Reason</p>
                    <p className="mt-2 text-sm text-slate-700">{refund.reason}</p>
                  </div>
                  {refund.order ? (
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order Summary</p>
                      <p className="mt-2 font-semibold text-slate-900">{refund.order.customerName || 'Customer'} | {refund.order.customerEmail || 'No email'}</p>
                      <div className="mt-3 space-y-2">
                        {(refund.order.OrderItems || []).map((item) => (
                          <div key={item.id} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <span className="font-semibold text-slate-900">{item.title}</span> | {item.itemType} | Qty {item.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin Decision</p>
                  <div className="mt-4 space-y-4">
                    <select
                      className="w-full rounded-xl border border-slate-200 px-4 py-3"
                      value={draft.status}
                      onChange={(e) => setDrafts((current) => ({ ...current, [refund.id]: { ...draft, status: e.target.value } }))}
                    >
                      <option value="REQUESTED">Requested</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="PROCESSED">Processed</option>
                    </select>
                    <textarea
                      className="w-full rounded-xl border border-slate-200 px-4 py-3"
                      rows="4"
                      placeholder="Internal note or customer-facing decision note"
                      value={draft.adminNote}
                      onChange={(e) => setDrafts((current) => ({ ...current, [refund.id]: { ...draft, adminNote: e.target.value } }))}
                    />
                    <button
                      type="button"
                      disabled={savingId === refund.id}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                      onClick={() => submitUpdate(refund.id)}
                    >
                      {savingId === refund.id ? 'Saving...' : 'Update Refund'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
