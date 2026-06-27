import { useEffect, useState } from 'react';
import api from '../../services/api';
import { handleMediaError, resolveMediaUrl } from '../../utils/media';

export default function PublicFacultyPage() {
  const [faculties, setFaculties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty', { params: { is_active: true } })
      .then((response) => setFaculties(response.data || []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Meet Our Faculty</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Subject experts, mentors, and experienced educators powering the institute.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-500">Loading faculty profiles...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {faculties.map((faculty) => (
              <div key={faculty.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                    {(() => {
                      const imagePath = faculty.image || faculty.profileImageUrl;
                      return <img src={resolveMediaUrl(imagePath)} onError={handleMediaError} alt={faculty.name} className="h-full w-full object-cover" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{faculty.name}</h2>
                    <p className="text-sm font-semibold text-blue-600">{faculty.subject}</p>
                    <p className="mt-1 text-sm text-slate-500">{faculty.experience || `${faculty.experienceYears} years experience`}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{faculty.bio || 'Full profile coming soon.'}</p>
                {faculty.achievements?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {faculty.achievements.map((achievement) => (
                      <span key={achievement} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{achievement}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
