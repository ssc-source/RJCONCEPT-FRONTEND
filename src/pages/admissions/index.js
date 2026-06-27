import { useState } from 'react';
import axios from 'axios';

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    courseInterest: ''
  });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      await axios.post(`${API_URL}/leads`, {
        ...formData,
        source: 'Website Admission Form'
      });
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', courseInterest: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Admissions Request</h1>
          <p className="text-lg text-gray-600">Fill out this form and our academic counselors will reach out to you within 24 hours.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          {status === 'success' ? (
            <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center border border-green-200">
               <h3 className="text-xl font-bold mb-2">Thank you! 🎉</h3>
               <p>Your admission request has been recorded. Our team will contact you shortly.</p>
               <button onClick={() => setStatus('idle')} className="mt-4 text-green-700 underline font-semibold">Submit another request</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course of Interest</label>
                  <select value={formData.courseInterest} onChange={e => setFormData({...formData, courseInterest: e.target.value})} className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white" required>
                    <option value="">Select a course</option>
                    <option value="UPSC / BPSC Target">UPSC / BPSC Target</option>
                    <option value="SSC / Banking">SSC / Banking</option>
                    <option value="Defence Exams">Defence Exams (NDA/CDS)</option>
                    <option value="Teaching Exams">Teaching Exams</option>
                  </select>
                </div>
              </div>

              {status === 'error' && (
                <div className="text-red-600 text-sm font-semibold">An error occurred while submitting. Please try again or call us.</div>
              )}

              <button disabled={status === 'loading'} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center">
                {status === 'loading' ? 'Submitting...' : 'Submit Request'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-4">By submitting this form, you agree to our Terms of Service and Privacy Policy.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
