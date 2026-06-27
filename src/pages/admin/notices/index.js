import { useEffect, useState } from 'react';
import { useNoticeStore } from '../../../stores/noticeStore';
import { formatDate } from '../../../utils/format';
import DocumentTemplate from '../../../components/pdf/DocumentTemplate';
import { buildDocumentConfig } from '../../../utils/documentSchemas';
import { useDocumentDownload } from '../../../hooks/useDocumentDownload';

const initialForm = {
  title: '',
  description: '',
  date: '',
  type: 'NOTICE',
  isActive: true,
};

export default function NoticesPage() {
  const { downloadDocument } = useDocumentDownload();
  const { notices, fetchNotices, createNotice, updateNotice, deleteNotice, isLoading } = useNoticeStore();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const handleDownloadNotices = async () => {
    try {
      await downloadDocument('notices-document-area', 'notice-board.pdf');
    } catch (error) {
      alert(error.message || 'Unable to download notices PDF');
    }
  };

  const noticesDocument = buildDocumentConfig('notice-report', { items: notices, formatDate });

  useEffect(() => {
    fetchNotices().catch(() => {});
  }, [fetchNotices]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateNotice(editingId, form);
      } else {
        await createNotice(form);
      }
      setForm(initialForm);
      setEditingId(null);
    } catch (error) {
      alert(error.message || 'Unable to save notice');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.8fr]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Notice / Event' : 'Publish Notice / Event'}</h1>
          <p className="mt-1 text-sm text-slate-500">Control what appears on the public website and homepage.</p>
        </div>
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full rounded-xl border border-slate-200 px-4 py-3" rows="5" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <select className="rounded-xl border border-slate-200 px-4 py-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="NOTICE">Notice</option>
            <option value="EVENT">Event</option>
          </select>
        </div>
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Visible on website
        </label>
        <div className="flex gap-3">
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">{editingId ? 'Update' : 'Publish'}</button>
          {editingId && <button type="button" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button>}
        </div>
      </form>

      <div id="notices-table-area" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Notice Board</h2>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white" onClick={handleDownloadNotices}>
              Download Notices
            </button>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {isLoading && <p className="text-sm text-slate-500">Loading notices...</p>}
          {!isLoading && notices.map((notice) => (
            <div key={notice.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${notice.type === 'EVENT' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {notice.type}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${notice.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {notice.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{notice.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{notice.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{formatDate(notice.date)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold" onClick={() => {
                    setEditingId(notice.id);
                    setForm({
                      title: notice.title || '',
                      description: notice.description || '',
                      date: notice.date || '',
                      type: notice.type || 'NOTICE',
                      isActive: notice.isActive,
                    });
                  }}>
                    Edit
                  </button>
                  <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => deleteNotice(notice.id).catch((error) => alert(error.message || 'Delete failed'))}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="notices-document-area" className="fixed left-[-99999px] top-0">
        <DocumentTemplate
          title={noticesDocument.title}
          generatedAt={noticesDocument.generatedAt}
          metadata={noticesDocument.metadata}
          columns={noticesDocument.columns}
          rows={noticesDocument.rows}
          footerNote={noticesDocument.footerNote}
          headerClassName={noticesDocument.headerClassName}
          logoClassName={noticesDocument.logoClassName}
        />
      </div>
    </div>
  );
}
