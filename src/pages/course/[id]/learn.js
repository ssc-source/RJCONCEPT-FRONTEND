import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '../../../services/api';

export default function CourseLearn() {
  const router = useRouter();
  const { id } = router.query;
  const [curriculum, setCurriculum] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      api.get(`/lessons/course/${id}`)
        .then(res => {
          setCurriculum(res.data);
          if (res.data.length > 0 && res.data[0].Videos?.length > 0) {
            setActiveVideo(res.data[0].Videos[0]);
          }
        })
        .catch(err => {
          console.error(err);
          setError(err.message || 'Access Denied: You must purchase this course first.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-500 tracking-widest uppercase">Initializing Classroom...</div>;

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <h1 className="text-4xl font-extrabold text-red-600 mb-6">Access Restricted</h1>
        <p className="text-gray-700 mb-8 max-w-md mx-auto text-lg">{error}</p>
        <div className="flex gap-4">
          <Link href="/dashboard/student" className="bg-gray-200 text-gray-800 font-bold px-8 py-4 rounded-xl hover:bg-gray-300">
            Dashboard
          </Link>
          <Link href="/store" className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 shadow-md">
            Go to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black font-sans">
      <header className="bg-gray-950 text-white p-4 flex justify-between items-center shadow-lg z-10 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student" className="text-gray-400 hover:text-white transition p-2 bg-gray-900 rounded-lg border border-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="font-extrabold text-xl tracking-wide hidden md:block">EdTech LMS Viewer</h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        <main className="flex-1 bg-black flex flex-col items-center justify-center relative">
          {activeVideo ? (
            <div className="w-full h-full p-4 lg:p-8 flex flex-col">
              <div className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative">
                 {/* Video Player Emulation */}
                 {activeVideo.videoUrl.includes('youtube.com') ? (
                   <iframe 
                     className="w-full h-full aspect-video" 
                     src={activeVideo.videoUrl.replace('watch?v=', 'embed/')} 
                     frameBorder="0" 
                     allowFullScreen
                   ></iframe>
                 ) : (
                   <video controls className="w-full h-full object-contain bg-black" src={activeVideo.videoUrl}></video>
                 )}
              </div>
              <div className="w-full max-w-6xl mx-auto mt-6 px-2">
                <h2 className="text-white text-3xl font-bold tracking-tight">{activeVideo.title}</h2>
                <div className="flex items-center gap-4 mt-3">
                  <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{activeVideo.duration} mins</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 font-medium p-10 border border-dashed border-gray-800 rounded-2xl flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              Select a video from the sidebar to begin.
            </div>
          )}
        </main>

        <aside className="w-full lg:w-96 bg-gray-950 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col h-1/3 lg:h-auto">
          <div className="p-5 border-b border-gray-800 bg-gray-900 sticky top-0 shadow-sm z-10">
            <h3 className="text-gray-100 font-bold text-lg">Course Curriculum</h3>
            <p className="text-sm text-gray-500 mt-1">{curriculum.reduce((acc, l) => acc + (l.Videos?.length||0), 0)} lectures total</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-950">
            {curriculum.length === 0 ? (
              <p className="text-gray-600 text-sm italic p-4 text-center">No lessons added to this course yet.</p>
            ) : (
              curriculum.map((lesson, idx) => (
                <div key={lesson.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                  <div className="text-white font-bold p-4 text-sm flex items-center border-b border-gray-800 bg-gray-800/50">
                    <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-2 py-1 rounded mr-3">Sec {idx + 1}</span>
                    <span className="flex-1 truncate" title={lesson.title}>{lesson.title}</span>
                  </div>
                  <div className="bg-gray-900">
                    {lesson.Videos?.map((video, vIdx) => {
                      const isActive = activeVideo?.id === video.id;
                      return (
                        <button
                          key={video.id}
                          onClick={() => setActiveVideo(video)}
                          className={`w-full text-left p-3 text-sm flex items-start gap-4 transition border-l-4 ${
                            isActive 
                              ? 'bg-blue-900/10 text-blue-400 border-blue-500' 
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white border-transparent'
                          }`}
                        >
                          <div className={`mt-0.5 rounded-full p-1 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
                          </div>
                          <span className="flex-1 font-medium leading-snug">{video.title}</span>
                          <span className="opacity-50 text-xs mt-1 w-10 text-right">{video.duration}m</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
