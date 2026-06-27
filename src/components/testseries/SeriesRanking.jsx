import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function SeriesRanking({ seriesId }) {
  const [summary, setSummary] = useState({ studentCount: 0, students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!seriesId) return;

    setLoading(true);
    setError(null);

    api
      .get(`/test-attempts/series/${seriesId}/students`, {
        meta: { scope: 'public' },
      })
      .then((response) => {
        setSummary({
          studentCount: Number(response?.data?.studentCount || 0),
          students: Array.isArray(response?.data?.students) ? response.data.students : [],
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Unable to load registered students');
        setLoading(false);
      });
  }, [seriesId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Registered Students</h2>
        <div className="text-center py-8 text-slate-500">Loading students...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Registered Students</h2>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  if (!summary.students || summary.students.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Registered Students</h2>
        <div className="text-center py-8 text-slate-500">No attempts yet</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Registered Students</h2>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {summary.studentCount}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summary.students.map((student) => (
          <div key={student.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            {student.name}
          </div>
        ))}
      </div>
    </div>
  );
}
