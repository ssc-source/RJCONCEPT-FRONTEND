import { useEffect, useState } from 'react';
import api from '../../../services/api';

const initialForm = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '0',
  maxDiscountAmount: '',
  usageLimit: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

export default function AdminCouponsPage() {
  const adminMeta = { meta: { scope: 'admin' } };
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/coupons/admin', adminMeta);
      setCoupons(response.data || []);
    } catch (error) {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons().catch(() => {});
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();

    const payload = {
      code: String(form.code || '').trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue || 0),
      minOrderAmount: Number(form.minOrderAmount || 0),
      maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: Boolean(form.isActive),
    };

    try {
      if (editingId) {
        await api.put(`/coupons/admin/${editingId}`, payload, adminMeta);
      } else {
        await api.post('/coupons/admin', payload, adminMeta);
      }
      resetForm();
      await loadCoupons();
    } catch (error) {
      alert(error.message || 'Unable to save coupon');
    }
  };

  const removeCoupon = async (id) => {
    try {
      await api.delete(`/coupons/admin/${id}`, adminMeta);
      await loadCoupons();
    } catch (error) {
      alert(error.message || 'Unable to delete coupon');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.8fr]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h1>
          <p className="mt-1 text-sm text-slate-500">Configure discount rules used during checkout.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Code" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} required />
          <select className="rounded-xl border border-slate-200 px-4 py-3" value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value })}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat</option>
          </select>
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0.01" step="0.01" placeholder="Discount Value" value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" step="0.01" placeholder="Min Order Amount" value={form.minOrderAmount} onChange={(event) => setForm({ ...form, minOrderAmount: event.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" step="0.01" placeholder="Max Discount (optional)" value={form.maxDiscountAmount} onChange={(event) => setForm({ ...form, maxDiscountAmount: event.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="1" step="1" placeholder="Usage Limit (optional)" value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: event.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="datetime-local" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} />
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          Coupon is active
        </label>

        <div className="flex gap-3">
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">{editingId ? 'Update Coupon' : 'Save Coupon'}</button>
          {editingId ? (
            <button type="button" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Coupon Rules</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Usage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading coupons...</td></tr> : null}
              {!loading && coupons.length === 0 ? <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">No coupons created yet.</td></tr> : null}
              {!loading && coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">{coupon.code}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{coupon.usedCount || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{coupon.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold" onClick={() => {
                        setEditingId(coupon.id);
                        setForm({
                          code: coupon.code || '',
                          discountType: coupon.discountType || 'PERCENTAGE',
                          discountValue: String(coupon.discountValue || ''),
                          minOrderAmount: String(coupon.minOrderAmount || '0'),
                          maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
                          usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
                          startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : '',
                          expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '',
                          isActive: Boolean(coupon.isActive),
                        });
                      }}>
                        Edit
                      </button>
                      <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => removeCoupon(coupon.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}