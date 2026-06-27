import { useEffect, useState } from 'react';
import { useFacultyStore } from '../../../stores/facultyStore';
import { fileToBase64 } from '../../../utils/file';
import { handleMediaError, resolveMediaUrl } from '../../../utils/media';

const initialForm = {
  name: '',
  subject: '',
  subjects: '',
  qualification: '',
  experience: '',
  experienceYears: 0,
  bio: '',
  specialization: '',
  achievements: '',
  is_active: true,
  displayOrder: 0,
};

export default function FacultyPage() {
  const { faculties, isLoading, fetchFaculties, addFaculty, updateFaculty, deleteFaculty } = useFacultyStore();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [imageBase64, setImageBase64] = useState('');

  useEffect(() => {
    fetchFaculties().catch(() => {});
  }, [fetchFaculties]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      imageBase64,
      experienceYears: Number(form.experienceYears || 0),
      displayOrder: Number(form.displayOrder || 0),
      subjects: form.subjects.split(',').map((item) => item.trim()).filter(Boolean),
      achievements: form.achievements.split('\n').map((item) => item.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updateFaculty(editingId, payload);
      } else {
        await addFaculty(payload);
      }
      setForm(initialForm);
      setEditingId(null);
      setImageBase64('');
    } catch (error) {
      alert(error.message || 'Unable to save faculty');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.8fr]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Faculty Profile' : 'Add Faculty Profile'}</h1>
          <p className="mt-1 text-sm text-slate-500">Capture a complete public-facing faculty profile with rich metadata.</p>
        </div>
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Primary subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Subjects (comma separated)" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} />
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Experience summary" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Years" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
        </div>
        <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
        <textarea className="w-full rounded-xl border border-slate-200 px-4 py-3" rows="4" placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <textarea className="w-full rounded-xl border border-slate-200 px-4 py-3" rows="4" placeholder="Achievements (one per line)" value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} />
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => setImageBase64(await fileToBase64(e.target.files?.[0]))} />
        <div className="grid gap-4 md:grid-cols-2">
          <input className="rounded-xl border border-slate-200 px-4 py-3" type="number" min="0" placeholder="Display order" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Visible on website
          </label>
        </div>
        <div className="flex gap-3">
          <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">{editingId ? 'Update Faculty' : 'Save Faculty'}</button>
          {editingId && <button type="button" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold" onClick={() => { setEditingId(null); setForm(initialForm); setImageBase64(''); }}>Cancel</button>}
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Faculty Directory</h2>
        {isLoading && <div className="mt-4 text-sm text-slate-500">Loading faculty...</div>}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {faculties.map((faculty) => (
            <div key={faculty.id} className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                  {(() => {
                    const imagePath = faculty.image || faculty.profileImageUrl;
                    return <img src={resolveMediaUrl(imagePath)} onError={handleMediaError} alt={faculty.name} className="h-full w-full object-cover" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{faculty.name}</h3>
                      <p className="text-sm text-blue-600">{faculty.subject}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${faculty.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {faculty.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{faculty.qualification || 'Qualification not added'}</p>
                  <p className="mt-2 text-sm text-slate-500">{faculty.specialization || faculty.experience || 'Profile still being enriched.'}</p>
                  {faculty.achievements?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {faculty.achievements.slice(0, 3).map((achievement) => (
                        <span key={achievement} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{achievement}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold" onClick={() => {
                  setEditingId(faculty.id);
                  setForm({
                    name: faculty.name || '',
                    subject: faculty.subject || '',
                    subjects: (faculty.subjects || []).join(', '),
                    qualification: faculty.qualification || '',
                    experience: faculty.experience || '',
                    experienceYears: faculty.experienceYears || 0,
                    bio: faculty.bio || '',
                    specialization: faculty.specialization || '',
                    achievements: (faculty.achievements || []).join('\n'),
                    is_active: faculty.is_active,
                    displayOrder: faculty.displayOrder || 0,
                  });
                }}>
                  Edit
                </button>
                <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => deleteFaculty(faculty.id).catch((error) => alert(error.message || 'Delete failed'))}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
