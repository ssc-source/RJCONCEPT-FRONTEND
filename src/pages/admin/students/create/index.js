import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../../../stores/authStore';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  parentName: '',
  fatherName: '',
  admissionDate: '',
  dateOfBirth: '',
  gender: '',
  city: '',
  zipCode: '',
  address: '',
  qualification: '',
  sourceOfInformation: '',
  courseId: '',
  batchId: '',
  feeStatus: 'PARTIAL',
  attendanceStatus: 'PENDING'
};

export default function CreateStudent() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [coursesResponse, batchesResponse] = await Promise.all([
          api.get('/courses', { params: { limit: 100 } }),
          api.get('/batches', { params: { limit: 100 } })
        ]);

        setCourses(Array.isArray(coursesResponse?.data?.data) ? coursesResponse.data.data : []);
        setBatches(Array.isArray(batchesResponse?.data?.data) ? batchesResponse.data.data : []);
      } catch (err) {
        setError('Unable to load courses and batches right now.');
      } finally {
        setIsFetching(false);
      }
    };

    loadOptions();
  }, []);

  const filteredBatches = (Array.isArray(batches) ? batches : []).filter((batch) => (
    !formData.courseId || String(batch.courseId) === String(formData.courseId)
  ));

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
      ...(field === 'courseId' ? { batchId: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/students', {
        ...formData,
        parentName: formData.parentName || formData.fatherName || null,
        courseId: formData.courseId || null,
        batchId: formData.batchId || null
      });
      router.push('/admin/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save the student record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
        <p className="text-sm text-gray-500 mt-1">Create a real student record and map it to the current course structure.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admission Date</label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={(e) => handleChange('admissionDate', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Name</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Father&apos;s Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleChange('fatherName', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select gender</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="NB">NB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => handleChange('qualification', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source of Information</label>
              <input
                type="text"
                value={formData.sourceOfInformation}
                onChange={(e) => handleChange('sourceOfInformation', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                disabled={isFetching}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select course</option>
                {(Array.isArray(courses) ? courses : []).map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch</label>
              <select
                value={formData.batchId}
                onChange={(e) => handleChange('batchId', e.target.value)}
                disabled={isFetching || filteredBatches.length === 0}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select batch</option>
                {filteredBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.schedule || `Batch ${batch.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              rows="3"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fee Status</label>
              <select
                value={formData.feeStatus}
                onChange={(e) => handleChange('feeStatus', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="PAID">PAID</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Attendance Status</label>
              <select
                value={formData.attendanceStatus}
                onChange={(e) => handleChange('attendanceStatus', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="PENDING">PENDING</option>
                <option value="REGULAR">REGULAR</option>
                <option value="IRREGULAR">IRREGULAR</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/students')}
              className="bg-white border border-gray-300 px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isFetching}
              className="bg-blue-600 border border-transparent px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
