import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/format';
import { handleMediaError, resolveMediaUrl } from '../utils/media';

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    api.get('/notices', { params: { isActive: true, limit: 3 } })
      .then((response) => setNotices(response.data || []))
      .catch(() => {});

    api.get('/faculty', { params: { is_active: true } })
      .then((response) => setFaculties((response.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
      <div className="font-sans text-gray-900 bg-white">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-50 to-white text-gray-900 border-gray-100 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-3/5 mb-10 md:mb-0 pr-0 md:pr-10">
            <h1 className="text-2xl md:text-4xl font-extrabold mb-6 leading-tight text-slate-900">
              Bihar’s Most <span className="text-blue-600">Trusted</span> Coaching for Competitive Exams
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
              Prepare for UPSC, BPSC, SSC, Banking, Defence & More — With Expert Faculty, Regular Tests & Proven Results.
              <br/><br/>
              <span className="font-semibold text-blue-800 block italic">“Mass-level competitive coaching + personal attention + affordability”</span>
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="bg-white border text-blue-900 shadow-sm px-3 py-1 rounded-full text-sm font-semibold">⭐ 500+ Successful Students</span>
              <span className="bg-white border text-blue-900 shadow-sm px-3 py-1 rounded-full text-sm font-semibold">⭐ 4.9 Rating</span>
              <span className="bg-white border text-blue-900 shadow-sm px-3 py-1 rounded-full text-sm font-semibold">💰 Affordable Fees + EMI Available</span>
              <span className="bg-white border text-blue-900 shadow-sm px-3 py-1 rounded-full text-sm font-semibold">🎯 Personal Attention in Small Batches</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/admissions" className="bg-blue-600 text-white shadow-lg px-8 py-4 rounded-md font-bold text-lg hover:bg-blue-700 hover:-translate-y-1 transform transition-all">Book Free Demo Class</Link>
              <Link href="/courses" className="bg-white border border-gray-300 text-gray-800 shadow-lg px-8 py-4 rounded-md font-bold text-lg hover:bg-gray-50 hover:-translate-y-1 transform transition-all">Explore Courses</Link>
            </div>
          </div>
          <div className="md:w-2/5 flex justify-center w-full relative hidden lg:block">
            <div className="w-full max-w-sm aspect-square bg-white rounded-full shadow-2xl border border-gray-400 flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-blue-150 opacity-0"></div>
                <img src="/logo_rj.png" className="h-full w-auto p-2 rounded-full" alt="Logo" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-20 bg-white" id="about">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 relative inline-block">
            About RJ Concept
            <div className="h-1 w-20 bg-yellow-500 mx-auto mt-2 rounded"></div>
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Established in 2020, <span className="font-bold text-blue-700">RJ Concept</span> has emerged as one of the most trusted coaching institutes in Purnia for competitive exam preparation. With a focus on concept-based learning and student-centric teaching, we ensure that every student receives the attention and guidance required to succeed.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our experienced faculty, structured courses, and regular performance evaluation system help students build strong fundamentals and confidence to crack top exams.
          </p>

          <div className="text-center">
            <Link href="/about" className="inline-flex items-center text-blue-600 font-bold text-lg hover:text-blue-800 transition mt-8">
              View Full About Details
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </div>

      </section>

      {/* 3. WHY CHOOSE US (USP SECTION) */}
      <section className="py-20 bg-slate-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">Why Students Choose RJ Concept</h2>
            <p className="text-gray-500">Based on REAL REVIEWS from 500+ students</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-blue-500 hover:shadow-md transition">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Experienced & Supportive Faculty</h3>
              <p className="text-gray-600">Clear explanations, friendly approach, and deep concept clarity from subject matter experts.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-green-500 hover:shadow-md transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Regular Test Series & Evaluation</h3>
              <p className="text-gray-600">Track progress and improve performance with our competitive mock tests.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-yellow-500 hover:shadow-md transition">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Personal Attention</h3>
              <p className="text-gray-600">Small batches guarantee no overcrowding, leading to better focus and learning outcomes.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-red-500 hover:shadow-md transition">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Affordable Fees + EMI Options</h3>
              <p className="text-gray-600">Premium education made accessible for all backgrounds with easy installment choices.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-purple-500 hover:shadow-md transition">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Concept-Based Learning</h3>
              <p className="text-gray-600">Focus on fundamental understanding, not rote learning, to handle dynamic exam patterns.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-indigo-500 hover:shadow-md transition">
              <div className="text-4xl mb-4">🏫</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Modern Classrooms</h3>
              <p className="text-gray-600">Equipped with smartboards creating an interactive and structured learning environment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COURSES SECTION */}
      <section className="py-24 bg-white" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Courses We Offer</h2>
            <div className="h-1 w-20 bg-yellow-500 mx-auto rounded"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* UPSC / BPSC */}
            <div className="group border border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-colors relative overflow-hidden bg-slate-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">🏛️</span>
                <h3 className="text-2xl font-bold text-gray-900">UPSC / BPSC</h3>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Complete GS + Optional</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Prelims + Mains + Interview prep</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Dedicated Answer Writing practice</span></li>
              </ul>
            </div>

            {/* SSC / Banking */}
            <div className="group border border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-colors relative overflow-hidden bg-slate-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">🧾</span>
                <h3 className="text-2xl font-bold text-gray-900">SSC / Banking / Railway</h3>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Quant + Reasoning + English mastery</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Extensive Previous Year Questions</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Speed improvement techniques</span></li>
              </ul>
            </div>

            {/* Defence */}
            <div className="group border border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-colors relative overflow-hidden bg-slate-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">👮</span>
                <h3 className="text-2xl font-bold text-gray-900">Defence Exams</h3>
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-4 tracking-wide">NDA • CDS • AIR FORCE • NAVY</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Written + Physical guidance</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Mock tests & SSB prep</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Personality development</span></li>
              </ul>
            </div>

            {/* Teaching & Others */}
            <div className="group border border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-colors relative overflow-hidden bg-slate-50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">🎓</span>
                <h3 className="text-2xl font-bold text-gray-900">Teaching & Other Exams</h3>
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-4 tracking-wide">CTET • STET • BPSC TEACHER • CUET • CLAT</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Subject-wise preparation</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">Pedagogy focus</span></li>
                <li className="flex items-start"><span className="text-green-500 mr-2">✓</span> <span className="text-gray-700">State-level exam coverage</span></li>
              </ul>
            </div>
          </div>
          <div className="text-center">
            <Link href="/courses" className="inline-flex items-center text-blue-600 font-bold text-lg hover:text-blue-800 transition mt-8">
              View Full Course Details
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FACULTY MEMBERS SECTION & NAVIGATiON link TO FACULTY PAGE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Our Elite Faculty</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {faculties.length > 0 ? faculties.map((faculty) => (
              <div key={faculty.id} className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center hover:bg-blue-50 transition">
                <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                  {faculty.image || faculty.profileImageUrl ? (
                    <img className="h-full w-full object-cover" src={resolveMediaUrl(faculty.image || faculty.profileImageUrl)} onError={handleMediaError} alt={faculty.name} />
                  ) : (
                    <span className="text-2xl font-bold text-blue-700">
                      {(faculty.name || 'RJ')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() || '')
                        .join('')}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900">{faculty.name}</h4>
                <p className="text-sm text-gray-500 mt-2">{faculty.subject || 'Faculty Member'}</p>
              </div>
            )) : (
              <>
                <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center">
                  <div className="mb-4 h-24 w-24 rounded-full bg-slate-100" />
                  <h4 className="font-bold text-gray-900">Faculty profile</h4>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center">
                  <div className="mb-4 h-24 w-24 rounded-full bg-slate-100" />
                  <h4 className="font-bold text-gray-900">Faculty profile</h4>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
                <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center">
                  <div className="mb-4 h-24 w-24 rounded-full bg-slate-100" />
                  <h4 className="font-bold text-gray-900">Faculty profile</h4>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              </>
            )}
          </div>
          <div className="text-center">
            <Link href="/faculty" className="inline-flex items-center text-blue-600 font-bold text-lg hover:text-blue-800 transition mt-8">
              View Full Faculty Details
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Latest Notices & Events</h2>
              <p className="mt-2 text-slate-600">Stay current on exam schedules, admissions, batches, and institute updates.</p>
            </div>
            <Link href="/contact" className="text-sm font-semibold text-blue-600">Need help? Contact the office</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {notices.map((notice) => (
              <div key={notice.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${notice.type === 'EVENT' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {notice.type}
                </span>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{notice.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{notice.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{formatDate(notice.date)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      

      {/* 5. RESULTS / SUCCESS STORIES */}
      <section className="py-20 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Results Speak for Us</h2>
            <p className="text-xl text-emerald-100">
              Hundreds of students have successfully cleared competitive exams with our guidance. Our structured approach and consistent evaluation ensure measurable success.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="w-24 h-24 bg-emerald-700 rounded-full mx-auto mb-4 border-4 border-white overflow-hidden"></div>
              <p className="font-bold text-lg">Priya Singh</p>
              <p className="text-yellow-400 font-semibold mb-2">BPSC Rank 14</p>
              <span className="text-xs bg-emerald-800 px-2 py-1 rounded">2023 Batch</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="w-24 h-24 bg-emerald-700 rounded-full mx-auto mb-4 border-4 border-white overflow-hidden"></div>
              <p className="font-bold text-lg">Amit Kumar</p>
              <p className="text-yellow-400 font-semibold mb-2">SSC CGL Inspector</p>
              <span className="text-xs bg-emerald-800 px-2 py-1 rounded">2022 Batch</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="w-24 h-24 bg-emerald-700 rounded-full mx-auto mb-4 border-4 border-white overflow-hidden"></div>
              <p className="font-bold text-lg">Neha Verma</p>
              <p className="text-yellow-400 font-semibold mb-2">SBI PO Clear</p>
              <span className="text-xs bg-emerald-800 px-2 py-1 rounded">2023 Batch</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
              <div className="w-24 h-24 bg-emerald-700 rounded-full mx-auto mb-4 border-4 border-white overflow-hidden"></div>
              <p className="font-bold text-lg">Rahul D.</p>
              <p className="text-yellow-400 font-semibold mb-2">NDA Selected</p>
              <span className="text-xs bg-emerald-800 px-2 py-1 rounded">2022 Batch</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-20 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">What Our Students Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md relative text-left">
              <div className="text-yellow-400 text-xl mb-3 flex gap-1">★★★★★</div>
              <p className="text-gray-700 mb-6 font-medium">“Teachers explain concepts very clearly and give personal attention.”</p>
              <div className="flex items-center gap-3 border-t pt-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Vikash R.</p>
                  <p className="text-xs text-gray-500">SSC Aspirant</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md relative text-left">
              <div className="text-yellow-400 text-xl mb-3 flex gap-1">★★★★★</div>
              <p className="text-gray-700 mb-6 font-medium">“Regular tests and practice boosted my confidence a lot. Fees are also very reasonable.”</p>
              <div className="flex items-center gap-3 border-t pt-4">
                <div className="w-10 h-10 bg-green-100 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Sunita M.</p>
                  <p className="text-xs text-gray-500">BPSC Student</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md relative text-left">
              <div className="text-yellow-400 text-xl mb-3 flex gap-1">★★★★★</div>
              <p className="text-gray-700 mb-6 font-medium">“Best coaching in Purnia with affordable fees and great faculty.”</p>
              <div className="flex items-center gap-3 border-t pt-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Aman S.</p>
                  <p className="text-xs text-gray-500">Banking PO Aspirant</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/blog" className="inline-flex items-center text-blue-600 font-bold text-lg hover:text-blue-800 transition mt-8">
              View Latest Blogs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>

        </div>
      </section>

      {/* 7. FACILITIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">Our Facilities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center hover:bg-blue-50 transition">
              <span className="text-4xl mb-3">📚</span>
              <h4 className="font-bold text-gray-900">Study Material</h4>
              <p className="text-sm text-gray-500 mt-2">Updated & Structured</p>
            </div>
            <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center hover:bg-blue-50 transition">
              <span className="text-4xl mb-3">🧠</span>
              <h4 className="font-bold text-gray-900">Doubt Clearing</h4>
              <p className="text-sm text-gray-500 mt-2">Dedicated Sessions</p>
            </div>
            <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center hover:bg-blue-50 transition">
              <span className="text-4xl mb-3">📝</span>
              <h4 className="font-bold text-gray-900">Mock Tests</h4>
              <p className="text-sm text-gray-500 mt-2">Practice Sets & CBTs</p>
            </div>
            <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center hover:bg-blue-50 transition">
              <span className="text-4xl mb-3">📊</span>
              <h4 className="font-bold text-gray-900">Performance Analysis</h4>
              <p className="text-sm text-gray-500 mt-2">Personalized feedback</p>
            </div>
            <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center hover:bg-blue-50 transition">
              <span className="text-4xl mb-3">🏫</span>
              <h4 className="font-bold text-gray-900">Safe Environment</h4>
              <p className="text-sm text-gray-500 mt-2">Disciplined premises</p>
            </div>
            <div className="bg-slate-50 border border-gray-100 p-6 rounded-lg flex flex-col items-center text-center hover:bg-blue-50 transition">
              <span className="text-4xl mb-3">📖</span>
              <h4 className="font-bold text-gray-900">Library Access</h4>
              <p className="text-sm text-gray-500 mt-2">Quiet study areas</p>
            </div>
          </div>
        </div>
      </section>
      
        

      {/* 8. ADMISSION SECTION */}
      <section className="py-20 bg-blue-50" id="admissions">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-5/12 bg-blue-600 p-10 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Start Your Preparation Today</h2>
              <p className="text-blue-100 mb-8">
                Join RJ Concept and take the first step towards your dream career. Quality education is now at your fingertips.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center"><span className="mr-3 text-yellow-400">✓</span> Free Counseling Session</li>
                <li className="flex items-center"><span className="mr-3 text-yellow-400">✓</span> Scholarship on Entrance Test</li>
                <li className="flex items-center"><span className="mr-3 text-yellow-400">✓</span> 2 Days Free Demo Classes</li>
              </ul>
            </div>
            <div className="md:w-7/12 p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Request Callback</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Enter your name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="+91" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Interested</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white" required>
                      <option value="">Select Course...</option>
                      <option value="upsc">UPSC / BPSC</option>
                      <option value="ssc">SSC / Banking</option>
                      <option value="defence">Defence</option>
                      <option value="teaching">Teaching Exams</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. 12th Pass, Graduate" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-yellow-500 text-blue-900 font-bold py-4 rounded-md hover:bg-yellow-400 transition shadow-md mt-4 text-lg">
                  Apply Now
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

        

      {/* 9. STRONG CTA */}
      <section className="py-24 bg-gray-900 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Don’t Wait for Opportunities — Prepare for Them</h2>
          <p className="text-xl text-gray-300 mb-10">👉 Join the most trusted coaching institute in Purnia today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/admissions" className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg">Book Demo</Link>
            <a href="tel:+919234829905" className="bg-white text-gray-900 border border-gray-300 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg flex justify-center items-center gap-2">📞 Call Now</a>
            <a href="https://wa.me/919234829905" target="_blank" rel="noreferrer" className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition shadow-lg flex justify-center items-center gap-2">💬 WhatsApp Now</a>
          </div>
        </div>
      </section>

      </div>
  );
}
