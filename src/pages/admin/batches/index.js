import { useEffect, useMemo, useState } from 'react';
import api from '../../../services/api';
import { useBatchStore } from '../../../stores/batchStore';
import { useCourseStore } from '../../../stores/courseStore';

const initialForm = {
  name: '',
  courseId: '',
  teachers: [],
  schedule: '',
  mode: 'OFFLINE',
  startDate: '',
  endDate: '',
  capacity: 0,
  status: 'ACTIVE',
};

const fieldClass = 'w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const labelClass = 'block text-sm font-semibold text-slate-700';

const getBatchTeacherIds = (batch) => {
  const teachers = Array.isArray(batch?.teachers) ? batch.teachers : [];
  if (teachers.length) {
    return teachers.map((teacher) => teacher.id);
  }
  return batch?.teacherId ? [batch.teacherId] : [];
};

const getBatchTeacherNames = (batch) => {
  const teachers = Array.isArray(batch?.teachers) ? batch.teachers : [];
  if (teachers.length) {
    return teachers.map((teacher) => teacher.name).filter(Boolean).join(', ');
  }
  return batch?.teacher?.name || 'Unassigned';
};

export default function BatchesPage() {
  const adminMeta = { meta: { scope: 'admin' } };
  const { batches, fetchBatches, createBatch, updateBatch, assignStudents, deleteBatch, isLoading } = useBatchStore();
  const { courses, fetchCourses } = useCourseStore();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchBatches().catch(() => {});
    fetchCourses().catch(() => {});
    api.get('/faculty')
      .then((response) => {
        setTeachers(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => setTeachers([]));
    api.get('/students', adminMeta)
      .then((response) => setStudents(Array.isArray(response.data) ? response.data : []))
      .catch(() => setStudents([]));
  }, [fetchBatches, fetchCourses]);

  const batchOptions = useMemo(() => batches.map((batch) => ({
    id: batch.id,
    label: `${batch.name} (${batch.course?.title || 'No course'})`,
  })), [batches]);

  const selectedTeacherSet = useMemo(() => new Set(form.teachers), [form.teachers]);
  const selectedStudentSet = useMemo(() => new Set(selectedStudents), [selectedStudents]);

  const toggleTeacher = (teacherId) => {
    setForm((current) => {
      const selected = new Set(current.teachers);
      if (selected.has(teacherId)) {
        selected.delete(teacherId);
      } else {
        selected.add(teacherId);
      }
      return { ...current, teachers: Array.from(selected) };
    });
  };

  const toggleStudent = (studentId) => {
    setSelectedStudents((current) => {
      const selected = new Set(current);
      if (selected.has(studentId)) {
        selected.delete(studentId);
      } else {
        selected.add(studentId);
      }
      return Array.from(selected);
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setFormError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return 'Batch name required';
    }
    if (!form.courseId) {
      return 'Select a course';
    }
    if (!form.teachers.length) {
      return 'Select at least one teacher';
    }
    if (new Set(form.teachers).size !== form.teachers.length) {
      return 'Duplicate teachers are not allowed';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      ...form,
      teacherId: form.teachers[0],
      capacity: Number(form.capacity || 0),
    };

    try {
      if (editingId) {
        await updateBatch(editingId, payload);
      } else {
        await createBatch(payload);
      }
      resetForm();
    } catch (error) {
      setFormError(error.message || 'Unable to save batch');
    }
  };

  const handleAssign = async (batchId) => {
    try {
      await assignStudents(batchId, selectedStudents);
      setSelectedStudents([]);
    } catch (error) {
      alert(error.message || 'Unable to assign students');
    }
  };

  const startEdit = (batch) => {
    setEditingId(batch.id);
    setForm({
      name: batch.name || '',
      courseId: batch.courseId || '',
      teachers: getBatchTeacherIds(batch),
      schedule: batch.schedule || '',
      mode: batch.mode || 'OFFLINE',
      startDate: batch.startDate || '',
      endDate: batch.endDate || '',
      capacity: batch.capacity || 0,
      status: batch.status || 'ACTIVE',
    });
    setFormError('');
  };

  return (
    <div className="min-h-screen overflow-visible">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.7fr]">
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{editingId ? 'Edit Batch' : 'Create Batch'}</h1>
              <p className="mt-1 text-sm text-slate-500">Map each batch to a course, teachers, and class schedule.</p>
            </div>

            {formError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {formError}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="batch-name">Batch Name</label>
                <input id="batch-name" className={fieldClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="course">Course</label>
                <select id="course" className={fieldClass} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
                  <option value="">Select course</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClass}>Select Teachers</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {teachers.map((teacher) => (
                  <label key={teacher.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedTeacherSet.has(teacher.id)}
                      onChange={() => toggleTeacher(teacher.id)}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{teacher.name}</span>
                      <span className="block truncate text-xs text-slate-500">{teacher.subject || teacher.specialization || 'Faculty'}</span>
                    </span>
                  </label>
                ))}
                {!teachers.length && <p className="text-sm text-slate-500">No teachers found.</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass} htmlFor="schedule">Schedule</label>
              <textarea id="schedule" className={fieldClass} rows="3" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="mode">Mode</label>
                <select id="mode" className={fieldClass} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                  <option value="OFFLINE">Offline</option>
                  <option value="ONLINE">Online</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="capacity">Capacity</label>
                <input id="capacity" className={fieldClass} type="number" min="0" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="start-date">Start Date</label>
                <input id="start-date" className={fieldClass} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="end-date">End Date</label>
                <input id="end-date" className={fieldClass} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass} htmlFor="status">Status</label>
              <select id="status" className={fieldClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="PLANNED">Planned</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                {editingId ? 'Update Batch' : 'Create Batch'}
              </button>
              {editingId && (
                <button type="button" className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Assign Students</h2>
            <p className="mt-1 text-sm text-slate-500">Select a batch and map multiple students in one action.</p>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="student-batch">Batch</label>
                <select id="student-batch" className={fieldClass} value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
                  <option value="">Select batch</option>
                  {batchOptions.map((batch) => <option key={batch.id} value={batch.id}>{batch.label}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className={labelClass}>Students</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {students.map((student) => (
                    <label key={student.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                        checked={selectedStudentSet.has(student.id)}
                        onChange={() => toggleStudent(student.id)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{student.name}</span>
                        <span className="block truncate text-xs text-slate-500">{student.phone || 'No phone'}</span>
                      </span>
                    </label>
                  ))}
                  {!students.length && <p className="text-sm text-slate-500">No students found.</p>}
                </div>
              </div>
              <button type="button" className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!selectedBatchId} onClick={() => handleAssign(selectedBatchId)}>
                Assign Selected Students
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-900">Batch Operations</h2>

          <div className="mt-4 grid gap-4 md:hidden">
            {isLoading && <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Loading batches...</p>}
            {!isLoading && batches.map((batch) => (
              <div key={batch.id} className="rounded-lg border border-slate-200 p-4">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{batch.name}</p>
                  <p className="text-sm text-slate-500">{batch.course?.title || 'No course assigned'}</p>
                  <p className="text-sm text-slate-600">Teachers: {getBatchTeacherNames(batch)}</p>
                  <p className="text-sm text-slate-600">Students: {batch.enrollments?.length || 0}</p>
                  <p className="text-sm text-slate-600">Schedule: {batch.schedule || 'Not set'}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold" onClick={() => startEdit(batch)}>
                    Edit
                  </button>
                  <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => deleteBatch(batch.id).catch((error) => alert(error.message || 'Delete failed'))}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden md:block">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Teachers</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Students</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Schedule</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && <tr><td className="px-4 py-8 text-center text-slate-500" colSpan="5">Loading batches...</td></tr>}
                {!isLoading && batches.map((batch) => (
                  <tr key={batch.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{batch.name}</p>
                      <p className="text-sm text-slate-500">{batch.course?.title || 'No course assigned'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{getBatchTeacherNames(batch)}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{batch.enrollments?.length || 0}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{batch.schedule || 'Not set'}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold" onClick={() => startEdit(batch)}>
                          Edit
                        </button>
                        <button type="button" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700" onClick={() => deleteBatch(batch.id).catch((error) => alert(error.message || 'Delete failed'))}>
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
