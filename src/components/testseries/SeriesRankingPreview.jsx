import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../services/api';

export default function SeriesRankingPreview({ seriesId }) {
  const [summary, setSummary] = useState({ studentCount: 0, students: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesId) return;

    api
      .get(`/test-attempts/series/${seriesId}/students`, {
        meta: { scope: 'public' },
      })
      .then((response) => {
        setSummary({
          studentCount: Number(response?.data?.studentCount || 0),
          students: Array.isArray(response?.data?.students) ? response.data.students.slice(0, 4) : [],
        });
        setLoading(false);
      })
      .catch(() => {
        setSummary({ studentCount: 0, students: [] });
        setLoading(false);
      });
  }, [seriesId]);

  if (loading) {
    return null;
  }

  return (
    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Registered Students ({summary.studentCount})</h3>
        <Link href={`/test-series/${seriesId}`} className="text-xs font-medium text-blue-600 hover:underline">
          View all →
        </Link>
      </div>
      {summary.students.length > 0 ? (
        <div className="space-y-2">
          {summary.students.map((student) => (
            <div key={student.id} className="text-xs text-slate-700 truncate">
              {student.name}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-500">No students have attempted this series yet.</div>
      )}
    </div>
  );
}