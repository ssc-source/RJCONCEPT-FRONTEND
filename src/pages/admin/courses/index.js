import { useEffect, useMemo, useState } from 'react';
import { useCourseStore } from '../../../stores/courseStore';
import { formatCurrency } from '../../../utils/format';

const initialForm = {
  title: '',
  description: '',
  price: '',
  category: '',
  duration: '',
  isActive: true,
};

export default function CoursesPage() {
  const { courses, meta, isLoading, fetchCourses, createCourse, updateCourse, deleteCourse } = useCourseStore();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses().catch(() => {});
  }, [fetchCourses]);

  const stats = useMemo(() => ([
    { label: 'Active Courses', value: courses.filter((course) => course.isActive).length },
    { label: 'Total Batches', value: courses.reduce((sum, course) => sum + (course.batches?.length || 0), 0) },
    { label: 'Average Price', value: courses.length ? formatCurrency(courses.reduce((sum, course) => sum + Number(course.price || 0), 0) / courses.length) : formatCurrency(0) },
  ]), [courses]);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    return courses.filter((course) =>
      [course.title, course.category, course.description].filter(Boolean).some((value) => value.toLowerCase().includes(search.toLowerCase()))
    );
  }, [courses, search]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, price: Number(form.price || 0) };
      if (editingId) {
        await updateCourse(editingId, payload);
      } else {
        await createCourse(payload);
      }
      resetForm();
    } catch (error) {
      alert(error.message || 'Unable to save course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_2fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Course' : 'Create Course'}</h1>
            <p className="mt-1 text-sm text-slate-500">Create academic offerings and keep them synced with batches and pricing.</p>
          </div>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Description" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Price" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input className="rounded-xl border border-slate-200 px-4 py-3" placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <input className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active and visible on the platform
          </label>
          <div className="flex gap-3">
            <button disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Course Catalog</h2>
              <p className="text-sm text-slate-500">{meta?.total || filteredCourses.length} total entries</p>
            </div>
            <input className="w-full rounded-xl border border-slate-200 px-4 py-3 md:max-w-xs" placeholder="Search course..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Batches</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr><td className="px-4 py-8 text-center text-slate-500" colSpan="5">Loading courses...</td></tr>
                )}
                {!isLoading && filteredCourses.length === 0 && (
                  <tr><td className="px-4 py-8 text-center text-slate-500" colSpan="5">No courses found.</td></tr>
                )}
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-slate-900">{course.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{course.category || 'Uncategorized'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{formatCurrency(course.price)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{course.batches?.length || 0}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${course.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700" onClick={() => setForm({
                          title: course.title || '',
                          description: course.description || '',
                          price: course.price || '',
                          category: course.category || '',
                          duration: course.duration || '',
                          isActive: course.isActive,
                        }) || setEditingId(course.id)}>
                          Edit
                        </button>
                        <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => deleteCourse(course.id).catch((error) => alert(error.message || 'Delete failed'))}>
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
    </div>
  );
}
