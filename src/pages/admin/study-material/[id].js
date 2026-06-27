import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import api from '../../../stores/authStore';
import { handleMediaError, resolveMediaUrl } from '../../../utils/media';

const blockedKeyActions = new Set(['p', 's']);

export default function AdminStudyMaterialViewerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [material, setMaterial] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    api.get(`/study-materials/admin/${id}`)
      .then((response) => {
        setMaterial(response?.data?.data || null);
        setError('');
      })
      .catch(() => setError('Study material not found.'));
  }, [id]);

  useEffect(() => {
    const preventContextMenu = (event) => event.preventDefault();
    const preventShortcuts = (event) => {
      if ((event.ctrlKey || event.metaKey) && blockedKeyActions.has(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };

    window.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('keydown', preventShortcuts);

    return () => {
      window.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('keydown', preventShortcuts);
    };
  }, []);

  const viewerUrl = useMemo(() => (
    material ? `${resolveMediaUrl(`/api/study-materials/admin/${material.id}/view`)}#toolbar=0&navpanes=0&scrollbar=1&view=FitH` : ''
  ), [material]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-slate-800">{error}</p>
        <Link href="/admin/study-material" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
          Back to Materials
        </Link>
      </div>
    );
  }

  if (!material) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">Loading study material...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/admin/study-material" className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">Back to Admin Library</Link>
          <h1 className="mt-3 text-3xl font-black text-slate-900">{material.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{material.description || 'Admin preview mode for the protected study-material viewer.'}</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">
          <p><span className="font-semibold text-slate-900">Exam:</span> {material.examTag || 'General'}</p>
          <p><span className="font-semibold text-slate-900">Category:</span> {material.category || 'Study Resource'}</p>
          <p><span className="font-semibold text-slate-900">Status:</span> {material.isPublished ? 'Published' : 'Draft'}</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-4 shadow-xl">
        <div className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          This preview stays inside the app viewer so the browser does not expose the raw PDF tab UI. Browser-level copy prevention still cannot be guaranteed.
        </div>

        {material.fileKind === 'PDF' ? (
          <iframe
            title={material.title}
            src={viewerUrl}
            className="h-[78vh] w-full rounded-[1.5rem] border border-white/10 bg-white"
          />
        ) : (
          <div className="overflow-auto rounded-[1.5rem] bg-slate-900 p-4">
            <img
              src={viewerUrl}
              onError={handleMediaError}
              alt={material.title}
              draggable="false"
              className="mx-auto max-h-[78vh] w-auto select-none rounded-xl object-contain"
              style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
