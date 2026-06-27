import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../services/api';

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/courses', {
          params: { isActive: 'true', limit: 100 },
        });
        const coursesData = response?.data || [];
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError(null); // Gracefully fail without showing error
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price;
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Explore Our Programs</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose the right course designed by expert faculties to help you clear competitive exams with flying colors.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No courses available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{course.description}</p>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg text-blue-600">{formatPrice(course.price)}</span>
                  <Link href="/admissions" className="bg-gray-900 text-white px-4 py-2 rounded font-medium hover:bg-gray-800 transition">
                    Enroll Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
