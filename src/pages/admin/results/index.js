import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import { useResultStore } from '../../../stores/resultStore';
import { fileToBase64 } from '../../../utils/file';
import { handleMediaError, resolveMediaUrl } from '../../../utils/media';
import DocumentTemplate from '../../../components/pdf/DocumentTemplate';
import { buildDocumentConfig } from '../../../utils/documentSchemas';
import { useDocumentDownload } from '../../../hooks/useDocumentDownload';

const initialForm = {
  studentId: '',
  studentName: '',
  examName: '',
  achievementTitle: '',
  rank: '',
  yearLabel: '',
  batchLabel: '',
  note: '',
  displayOrder: 0,
  isActive: true,
};

export default function AdminResultsPage() {
  const { downloadDocument } = useDocumentDownload();
  const adminMeta = { meta: { scope: 'admin' } };
  const { results, isLoading, fetchResults, createResult, updateResult, deleteResult } = useResultStore();
  const [studentsState, setStudentsState] = useState({ items: [], isLoading: true });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [search, setSearch] = useState('');

  const handleDownloadResults = async () => {
    try {
      await downloadDocument('results-document-area', 'results-report.pdf');
    } catch (error) {
      alert(error.message || 'Unable to download results PDF');
    }
  };

  useEffect(() => {
    fetchResults().catch(() => {});
    api.get('/students', { params: { limit: 200 }, ...adminMeta })
      .then((response) => setStudentsState({ items: response.data || [], isLoading: false }))
      .catch(() => setStudentsState({ items: [], isLoading: false }));
  }, [fetchResults]);

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return results;
    return results.filter((item) => (
      [item.displayName, item.examName, item.achievementTitle, item.rank, item.batchLabel]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    ));
  }, [results, search]);

  const resultsDocument = useMemo(
    () => buildDocumentConfig('result-report', { items: filteredResults }),
    [filteredResults]
  );

  const linkedStudent = useMemo(
    () => studentsState.items.find((student) => student.id === form.studentId) || null,
    [form.studentId, studentsState.items]
  );

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setImageBase64('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      studentId: form.studentId || null,
      studentName: form.studentName.trim() || null,
      examName: form.examName.trim(),
      achievementTitle: form.achievementTitle.trim(),
      rank: form.rank.trim() || null,
      yearLabel: form.yearLabel.trim() || null,
      batchLabel: form.batchLabel.trim() || null,
      note: form.note.trim() || null,
      displayOrder: Number(form.displayOrder || 0),
      imageBase64,
    };

    try {
      if (editingId) {
        await updateResult(editingId, payload);
      } else {
        await createResult(payload);
      }
      resetForm();
    } catch (error) {
      alert(error.message || 'Unable to save result');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_1.7fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Result Entry' : 'Add Result Entry'}</h1>
          <p className="mt-1 text-sm text-slate-500">Showcase successful students for the public Hall of Fame page.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Link Existing Student</label>
            <select
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              value={form.studentId}
              onChange={(e) => setForm((current) => ({ ...current, studentId: e.target.value }))}
            >
              <option value="">Custom entry only</option>
              {studentsState.items.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.phone ? `- ${student.phone}` : ''}
                </option>
              ))}
            </select>
            {studentsState.isLoading ? <p className="mt-1 text-xs text-slate-400">Loading students...</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Displayed Student Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              placeholder={linkedStudent?.name || 'Leave blank to use linked student name'}
              value={form.studentName}
              onChange={(e) => setForm((current) => ({ ...current, studentName: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Exam / Category</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              placeholder="BPSC, SSC CGL, SBI PO, NDA..."
              value={form.examName}
              onChange={(e) => setForm((current) => ({ ...current, examName: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Achievement Title</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              placeholder="Rank 14, Inspector, Selected..."
              value={form.achievementTitle}
              onChange={(e) => setForm((current) => ({ ...current, achievementTitle: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Rank label"
            value={form.rank}
            onChange={(e) => setForm((current) => ({ ...current, rank: e.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Year label"
            value={form.yearLabel}
            onChange={(e) => setForm((current) => ({ ...current, yearLabel: e.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-4 py-3"
            placeholder="Batch label"
            value={form.batchLabel}
            onChange={(e) => setForm((current) => ({ ...current, batchLabel: e.target.value }))}
          />
        </div>

        <textarea
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          rows="4"
          placeholder="Short note or highlight"
          value={form.note}
          onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
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

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Student Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => setImageBase64(await fileToBase64(e.target.files?.[0]))}
          />
        </div>

        <div className="flex gap-3">
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
            {editingId ? 'Update Entry' : 'Save Entry'}
          </button>
          {editingId ? (
            <button type="button" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div id="results-table-area" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Hall of Fame Entries</h2>
            <p className="text-sm text-slate-500">Manage all website-visible achiever cards from one place.</p>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 md:max-w-xs"
              placeholder="Search results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white" onClick={handleDownloadResults}>
              Download Results
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Exam</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Achievement</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">Loading result entries...</td>
                </tr>
              ) : null}

              {!isLoading && filteredResults.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">No result entries found.</td>
                </tr>
              ) : null}

              {!isLoading && filteredResults.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                        {item.image || item.displayPhotoUrl ? (
                          <img src={resolveMediaUrl(item.image || item.displayPhotoUrl)} onError={handleMediaError} alt={item.displayName} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.displayName}</p>
                        <p className="text-sm text-slate-500">{item.sourceType === 'LINKED_STUDENT' ? 'Linked student' : 'Custom entry'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{item.examName}</p>
                    <p className="text-slate-500">{item.batchLabel || item.yearLabel || 'No batch/year label'}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{item.achievementTitle}</p>
                    <p className="text-slate-500">{item.rank || item.note || 'No extra details'}</p>
                  </td>
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
                            studentId: item.studentId || '',
                            studentName: item.studentName || '',
                            examName: item.examName || '',
                            achievementTitle: item.achievementTitle || '',
                            rank: item.rank || '',
                            yearLabel: item.yearLabel || '',
                            batchLabel: item.batchLabel || '',
                            note: item.note || '',
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
                        onClick={() => deleteResult(item.id).catch((error) => alert(error.message || 'Delete failed'))}
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

      <div id="results-document-area" className="fixed left-[-99999px] top-0">
        <DocumentTemplate
          title={resultsDocument.title}
          generatedAt={resultsDocument.generatedAt}
          metadata={resultsDocument.metadata}
          columns={resultsDocument.columns}
          rows={resultsDocument.rows}
          footerNote={resultsDocument.footerNote}
          headerClassName={resultsDocument.headerClassName}
          logoClassName={resultsDocument.logoClassName}
        />
      </div>
    </div>
  );
}
