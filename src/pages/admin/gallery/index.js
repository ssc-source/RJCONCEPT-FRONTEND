import { useEffect, useMemo, useState } from 'react';
import { useGalleryStore } from '../../../stores/galleryStore';
import { fileToBase64 } from '../../../utils/file';
import { handleMediaError, resolveMediaUrl } from '../../../utils/media';

const initialForm = {
  title: '',
  category: '',
  description: '',
  displayOrder: 0,
  isActive: true,
};

export default function AdminGalleryPage() {
  const { items, isLoading, fetchGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } = useGalleryStore();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchGallery().catch(() => {});
  }, [fetchGallery]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.title, item.category, item.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [items, search]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setImageBase64('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      title: form.title.trim(),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      displayOrder: Number(form.displayOrder || 0),
      imageBase64,
    };

    try {
      if (editingId) {
        await updateGalleryItem(editingId, payload);
      } else {
        await createGalleryItem(payload);
      }
      resetForm();
    } catch (error) {
      alert(error.message || 'Unable to save gallery item');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.7fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}</h1>
          <p className="mt-1 text-sm text-slate-500">Control every gallery image shown on the public website.</p>
        </div>

        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
          required
        />
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="Category or album"
          value={form.category}
          onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
        />
        <textarea
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          rows="4"
          placeholder="Short description"
          value={form.description}
          onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            type="number"
            min="0"
            placeholder="Display order"
            value={form.displayOrder}
            onChange={(e) => setForm((current) => ({ ...current, displayOrder: e.target.value }))}
          />
          <select
            className="rounded-xl border border-slate-200 px-4 py-3"
            value={form.isActive ? 'active' : 'inactive'}
            onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.value === 'active' }))}
          >
            <option value="active">Active on website</option>
            <option value="inactive">Hidden</option>
          </select>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => setImageBase64(await fileToBase64(e.target.files?.[0]))}
        />

        <div className="flex gap-3">
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
            {editingId ? 'Update Image' : 'Save Image'}
          </button>
          {editingId ? (
            <button type="button" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gallery Library</h2>
            <p className="text-sm text-slate-500">Upload, reorder, and hide gallery items anytime.</p>
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 md:max-w-xs"
            placeholder="Search gallery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading gallery items...</td>
                </tr>
              ) : null}
              {!isLoading && filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No gallery items found.</td>
                </tr>
              ) : null}
              {!isLoading && filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <div className="h-16 w-24 overflow-hidden rounded-xl bg-slate-100">
                      {item.imageUrl ? <img src={resolveMediaUrl(item.imageUrl)} onError={handleMediaError} alt={item.title} className="h-full w-full object-cover" /> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.description || 'No description'}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">{item.category || 'Uncategorized'}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{item.isActive ? 'Active' : 'Hidden'}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold"
                        onClick={() => {
                          setEditingId(item.id);
                          setImageBase64('');
                          setForm({
                            title: item.title || '',
                            category: item.category || '',
                            description: item.description || '',
                            displayOrder: item.displayOrder || 0,
                            isActive: Boolean(item.isActive),
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                        onClick={() => deleteGalleryItem(item.id).catch((error) => alert(error.message || 'Delete failed'))}
                      >
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
