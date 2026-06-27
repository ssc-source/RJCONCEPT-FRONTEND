import { useEffect, useState } from 'react';
import { useProductStore } from '../../../stores/productStore';
import { fileToBase64 } from '../../../utils/file';
import { formatCurrency } from '../../../utils/format';
import { handleMediaError, resolveMediaUrl } from '../../../utils/media';
import DocumentTemplate from '../../../components/pdf/DocumentTemplate';
import { buildDocumentConfig } from '../../../utils/documentSchemas';
import { useDocumentDownload } from '../../../hooks/useDocumentDownload';

const initialForm = {
  name: '',
  sku: '',
  description: '',
  price: '',
  category: 'BOOK',
  type: 'BOOK',
  stock: 0,
  isActive: true,
};

export default function ProductsPage() {
  const { downloadDocument } = useDocumentDownload();
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct, isLoading } = useProductStore();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [imageBase64, setImageBase64] = useState('');

  const handleDownloadInventory = async () => {
    try {
      await downloadDocument('inventory-document-area', 'book-inventory.pdf');
    } catch (error) {
      alert(error.message || 'Unable to download inventory PDF');
    }
  };

  const inventoryDocument = buildDocumentConfig('inventory-report', { items: products, formatCurrency });

  useEffect(() => {
    fetchProducts({ type: 'BOOK' }).catch(() => {});
  }, [fetchProducts]);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      imageBase64,
    };
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setForm(initialForm);
      setEditingId(null);
      setImageBase64('');
    } catch (error) {
      alert(error.message || 'Unable to save product');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.8fr]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Product' : 'Add Book / Product'}</h1>
          <p className="mt-1 text-sm text-slate-500">Manage stock, catalog details, pricing, and cover images.</p>
        </div>
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <textarea className="w-full rounded-xl border border-slate-200 px-4 py-3" rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <select className="rounded-xl border border-slate-200 px-4 py-3" value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => setImageBase64(await fileToBase64(e.target.files?.[0]))} />
        <div className="flex gap-3">
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">{editingId ? 'Update Product' : 'Save Product'}</button>
          {editingId && <button type="button" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" onClick={() => { setEditingId(null); setForm(initialForm); setImageBase64(''); }}>Cancel</button>}
        </div>
      </form>

      <div id="inventory-table-area" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Book Inventory</h2>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white" onClick={handleDownloadInventory}>
              Download Inventory
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading products...</td></tr>}
              {!isLoading && products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                        {product.imageUrl ? <img src={resolveMediaUrl(product.imageUrl)} onError={handleMediaError} alt={product.name} className="h-full w-full object-cover" /> : null}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.sku || 'No SKU'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{product.stock}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{product.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold" onClick={() => {
                        setEditingId(product.id);
                        setForm({
                          name: product.name || '',
                          sku: product.sku || '',
                          description: product.description || '',
                          price: product.price || '',
                          category: product.category || 'BOOK',
                          type: product.type || 'BOOK',
                          stock: product.stock || 0,
                          isActive: product.isActive,
                        });
                      }}>
                        Edit
                      </button>
                      <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => deleteProduct(product.id).catch((error) => alert(error.message || 'Delete failed'))}>
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

      <div id="inventory-document-area" className="fixed left-[-99999px] top-0">
        <DocumentTemplate
          title={inventoryDocument.title}
          generatedAt={inventoryDocument.generatedAt}
          metadata={inventoryDocument.metadata}
          columns={inventoryDocument.columns}
          rows={inventoryDocument.rows}
          footerNote={inventoryDocument.footerNote}
          headerClassName={inventoryDocument.headerClassName}
          logoClassName={inventoryDocument.logoClassName}
        />
      </div>
    </div>
  );
}
