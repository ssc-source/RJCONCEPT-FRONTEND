export default function BlogPage() {
  return (
    <div className="bg-slate-50 min-h-[80vh] py-20 flex flex-col items-center justify-center">
      <div className="text-center">
        <span className="text-6xl mb-6 block">📝</span>
        <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Exam Updates & Blog</h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
          We are currently curating the best preparation strategies, exam notifications, and current affairs materials for you.
        </p>
        <div className="inline-block bg-white p-4 rounded-xl shadow-sm border border-gray-200">
           <p className="font-bold text-blue-600 flex items-center gap-2">
             <span className="animate-pulse bg-blue-600 w-3 h-3 rounded-full block"></span>
             New content dropping soon!
           </p>
        </div>
      </div>
    </div>
  );
}
