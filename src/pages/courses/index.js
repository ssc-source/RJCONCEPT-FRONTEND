import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import Seo from '../../components/Seo';
import { getBreadcrumbSchema, getCourseSchema } from '../../utils/seoSchemas';

export default function PublicCoursesPage({ initialCourses = [] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [loading, setLoading] = useState(initialCourses.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialCourses.length > 0) return;
    
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
        setError(null);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [initialCourses]);

  const formatPrice = (price) => {
    if (!price) return '₹0';
    return typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : price;
  };

  const seoSchema = useMemo(() => {
    const breadcrumb = getBreadcrumbSchema([
      { name: 'Home', item: '/' },
      { name: 'Courses', item: '/courses' }
    ]);
    const courseList = courses.map(course => getCourseSchema(course)).filter(Boolean);
    return [breadcrumb, ...courseList];
  }, [courses]);

  return (
    <>
      <Seo
        title="Courses & Programs"
        description="Explore our elite preparation programs for UPSC, BPSC, SSC, Banking, Railway, and Defence exams. Dedicated batches, comprehensive study materials, and mock evaluations."
        schema={seoSchema}
      />

      <div className="py-16 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Explore Our Programs</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose the right course designed by expert faculties to help you clear competitive exams with flying colors.</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin" role="status">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="sr-only">Loading courses...</span>
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
    </>
  );
}

export async function getServerSideProps() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.rjconcept.in/api';
  
  try {
    const res = await fetch(`${apiBase.replace(/\/+$/, '')}/courses?isActive=true&limit=100`);
    if (res.ok) {
      const result = await res.json();
      const courses = result?.data || result || [];
      return {
        props: {
          initialCourses: Array.isArray(courses) ? courses : [],
        },
      };
    }
  } catch (error) {
    console.error('Error fetching courses for SSR:', error.message);
  }
  
  return {
    props: {
      initialCourses: [],
    },
  };
}
