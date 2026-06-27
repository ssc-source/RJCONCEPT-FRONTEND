import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import api from '../../../stores/authStore';
import { fileToBase64 } from '../../../utils/file';
import { handleMediaError, resolveMediaUrl } from '../../../utils/media';

const initialForm = {
  title: '',
  description: '',
  category: '',
  examTag: '',
  materialType: 'NOTES',
  sortOrder: 0,
  isPublished: true,
};

const materialTypeOptions = ['PYQ', 'NOTES', 'PRACTICE_SET', 'SYLLABUS', 'OTHER'];

export default function StudyMaterialAdminPage() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');
  const [coverImageBase64, setCoverImageBase64] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const stats = useMemo(() => ({
    total: materials.length,
    published: materials.filter((item) => item.isPublished).length,
    drafts: materials.filter((item) => !item.isPublished).length,
    pdfs: materials.filter((item) => item.fileKind === 'PDF').length,
  }), [materials]);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/study-materials', { params: { limit: 100 } });
      setMaterials(Array.isArray(response?.data?.data) ? response.data.data : []);
      setError('');
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Unable to fetch study materials right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setFileBase64('');
    setFileName('');
    setCoverImageBase64('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder || 0),
        isPublished: Boolean(form.isPublished),
        ...(fileBase64 ? { fileBase64, fileName } : {}),
        ...(coverImageBase64 ? { coverImageBase64 } : {}),
      };

      if (!editingId && !fileBase64) {
        throw new Error('Please upload a PDF or image file for the study material.');
      }

      if (editingId) {
        await api.put(`/study-materials/${editingId}`, payload);
      } else {
        await api.post('/study-materials', payload);
      }

      resetForm();
      await loadMaterials();
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message || 'Unable to save study material.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (material) => {
    setEditingId(material.id);
    setForm({
      title: material.title || '',
      description: material.description || '',
      category: material.category || '',
      examTag: material.examTag || '',
      materialType: material.materialType || 'NOTES',
      sortOrder: material.sortOrder || 0,
      isPublished: Boolean(material.isPublished),
    });
    setFileBase64('');
    setFileName('');
    setCoverImageBase64('');
  };

  const removeMaterial = async (id) => {
    if (!window.confirm('Delete this study material?')) {
      return;
    }

    try {
      await api.delete(`/study-materials/${id}`);
      await loadMaterials();
    } catch (deleteError) {
      alert(deleteError.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Materials', value: stats.total },
          { label: 'Published', value: stats.published },
          { label: 'Drafts', value: stats.drafts },
          { label: 'PDF Library', value: stats.pdfs },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Study Material' : 'Add Study Material'}</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">Upload PYQs, notes, or exam PDFs. Files are served inline through a restricted viewer instead of direct public download links.</p>
          </div>

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />

          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Category (e.g. General Studies)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Exam Tag (e.g. UPSC, BPSC, SSC)" value={form.examTag} onChange={(e) => setForm({ ...form, examTag: e.target.value })} />
          </div>

          <textarea className="w-full rounded-2xl border border-slate-200 px-4 py-3" rows="4" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div className="grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-slate-200 px-4 py-3" value={form.materialType} onChange={(e) => setForm({ ...form, materialType: e.target.value })}>
              {materialTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Sort Order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <span className="mb-2 block font-semibold text-slate-900">Upload Material File</span>
              <span className="block text-xs text-slate-500">PDF, PNG, JPG, WEBP</span>
              <input
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="mt-3 block w-full text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  setFileBase64(await fileToBase64(file));
                  setFileName(file?.name || '');
                }}
              />
            </label>

            <label className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <span className="mb-2 block font-semibold text-slate-900">Optional Cover Image</span>
              <span className="block text-xs text-slate-500">Used on the public listing for PDFs</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="mt-3 block w-full text-xs"
                onChange={async (e) => setCoverImageBase64(await fileToBase64(e.target.files?.[0]))}
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
            Publish immediately on the public website
          </label>

          <div className="flex gap-3">
            <button disabled={isSaving} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {isSaving ? 'Saving...' : editingId ? 'Update Material' : 'Save Material'}
            </button>
            {editingId ? <button type="button" className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold" onClick={resetForm}>Cancel</button> : null}
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Material Library</h2>
            <p className="mt-1 text-sm text-slate-500">Students will only see published items from this list.</p>
          </div>

          <div className="mt-5 space-y-4">
            {isLoading ? <div className="rounded-2xl border border-slate-200 px-4 py-8 text-center text-slate-500">Loading study materials...</div> : null}
            {!isLoading && materials.length === 0 ? <div className="rounded-2xl border border-slate-200 px-4 py-8 text-center text-slate-500">No study materials uploaded yet.</div> : null}
            {!isLoading && materials.map((material) => (
              <div key={material.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                      {material.coverImageUrl ? (
                        <img src={resolveMediaUrl(material.coverImageUrl)} onError={handleMediaError} alt={material.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-bold text-slate-500">{material.fileKind}</div>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{material.title}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${material.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {material.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{material.materialType}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{material.examTag || 'General'}{material.category ? ` - ${material.category}` : ''}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{material.description || 'No description added.'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/study-material/${material.id}`} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">
                      Preview
                    </Link>
                    <button type="button" className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700" onClick={() => startEdit(material)}>
                      Edit
                    </button>
                    <button type="button" className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700" onClick={() => removeMaterial(material.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
