import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { handleMediaError, resolveMediaUrl } from '../../utils/media';
import Seo from '../../components/Seo';
import { getBreadcrumbSchema } from '../../utils/seoSchemas';

const typeLabels = {
  PYQ: 'Previous Year Questions',
  NOTES: 'Notes',
  PRACTICE_SET: 'Practice Set',
  SYLLABUS: 'Syllabus',
  OTHER: 'Other',
};

export default function StudyMaterialPage({ initialMaterials = [] }) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('ALL');

  useEffect(() => {
    if (initialMaterials.length > 0) return;
    
    api.get('/study-materials/public', { params: { limit: 100 } })
      .then((response) => setMaterials(Array.isArray(response?.data) ? response.data : []))
      .catch(() => setMaterials([]));
  }, [initialMaterials]);

  const filteredMaterials = useMemo(() => (
    materials.filter((item) => {
      const matchesType = activeType === 'ALL' || item.materialType === activeType;
      const haystack = `${item.title} ${item.description || ''} ${item.examTag || ''} ${item.category || ''}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      return matchesType && matchesSearch;
    })
  ), [activeType, materials, search]);

  const typeFilters = ['ALL', 'PYQ', 'NOTES', 'PRACTICE_SET', 'SYLLABUS', 'OTHER'];

  const seoSchema = useMemo(() => {
    return getBreadcrumbSchema([
      { name: 'Home', item: '/' },
      { name: 'Study Material', item: '/study-material' }
    ]);
  }, []);

  return (
    <>
      <Seo
        title="Free Study Material & PYQs"
        description="Download free preparation materials, syllabus sheets, previous year question papers (PYQs), and mock worksheets compiled by expert educators at RJ Concept."
        schema={seoSchema}
      />

      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#ffffff_100%)]">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,#93c5fd_0%,transparent_55%),radial-gradient(circle_at_top_right,#fde68a_0%,transparent_45%)] opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <p className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-700">Free Resource Library</p>
                <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Study material curated by RJ Concept faculty for serious exam preparation.</h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Explore free PYQs, handwritten notes, quick revision sheets, and practice sets for the exams we teach. Materials open inside the site viewer for focused reading.</p>
              </div>
              <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Access Policy</p>
                <p className="mt-3 text-2xl font-bold">Inline viewing only</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">We hide print and download actions where possible and serve files through a controlled viewer, though browsers still cannot guarantee absolute copy prevention.</p>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <input
                type="text"
                placeholder="Search by title, exam, or category"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm text-slate-700 outline-none transition focus:border-blue-400"
              />
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveType(filter)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${activeType === filter ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {filter === 'ALL' ? 'All' : typeLabels[filter]}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredMaterials.map((material) => (
              <article key={material.id} className="group rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-56 overflow-hidden rounded-[1.5rem] bg-slate-100">
                  {material.coverImageUrl ? (
                    <img
                      src={resolveMediaUrl(material.coverImageUrl)}
                      onError={handleMediaError}
                      alt={material.title}
                      title={material.title}
                      width={400}
                      height={250}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : material.fileKind === 'IMAGE' ? (
                    <img
                      src={resolveMediaUrl(`/api/study-materials/public/${material.id}/view`)}
                      onError={handleMediaError}
                      alt={material.title}
                      title={material.title}
                      width={400}
                      height={250}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] text-center text-white">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-200">{material.fileKind}</p>
                        <p className="mt-3 text-2xl font-black">{typeLabels[material.materialType] || material.materialType}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{material.examTag || 'General'}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{typeLabels[material.materialType] || material.materialType}</span>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">{material.title}</h2>
                <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-600">{material.description || 'Faculty-curated material for revision, practice, and exam familiarity.'}</p>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{material.category || 'Study Resource'}</p>
                  <Link href={`/study-material/${material.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Open Viewer
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {filteredMaterials.length === 0 ? (
            <div className="mt-10 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500">
              No materials matched your search yet.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.rjconcept.in/api';
  
  try {
    const res = await fetch(`${apiBase.replace(/\/+$/, '')}/study-materials/public?limit=100`);
    if (res.ok) {
      const result = await res.json();
      const materials = result?.data || result || [];
      return {
        props: {
          initialMaterials: Array.isArray(materials) ? materials : [],
        },
      };
    }
  } catch (error) {
    console.error('Error fetching study materials for SSR:', error.message);
  }
  
  return {
    props: {
      initialMaterials: [],
    },
  };
}
