import { useEffect, useState } from 'react';
import { useExamStore } from '../../../stores/examStore';
import { useBatchStore } from '../../../stores/batchStore';

export default function ExamsPage() {
  const { exams, isLoading, fetchExams, createExamStub, simulateMarksUpload } = useExamStore();
  const { batches, fetchBatches } = useBatchStore();
  const [showForm, setShowForm] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', date: '', batchId: '' });

  useEffect(() => {
    fetchExams();
    fetchBatches();
  }, [fetchExams, fetchBatches]);

  useEffect(() => {
    if (!newExam.batchId && batches.length > 0) {
      setNewExam((current) => ({ ...current, batchId: String(batches[0].id) }));
    }
  }, [batches, newExam.batchId]);

  const handleCreate = (e) => {
    e.preventDefault();
    createExamStub(newExam);
    setShowForm(false);
    setNewExam((current) => ({ ...current, name: '', date: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams & Tests</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule tests and manage student results dynamically</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">
          {showForm ? 'Close Form' : '+ Create Test'}
        </button>
      </div>

      {showForm && (
         <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
            <h3 className="font-bold text-gray-800 mb-4">Create New Examination</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Test Name</label>
                 <input type="text" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                 <input type="date" value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Batch</label>
                 <select value={newExam.batchId} onChange={e => setNewExam({...newExam, batchId: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" required>
                   <option value="">Select batch</option>
                   {batches.map((batch) => (
                     <option key={batch.id} value={batch.id}>
                       {batch.Course?.title ? `${batch.Course.title} - ` : ''}{batch.schedule || `Batch ${batch.id}`}
                     </option>
                   ))}
                 </select>
               </div>
               <div className="flex items-end">
                 <button type="submit" className="bg-green-600 w-full text-white font-bold py-2 rounded-lg hover:bg-green-700 transition">Save Test</button>
               </div>
            </div>
         </form>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between">
            <h2 className="font-bold text-gray-800 text-lg">Scheduled Tests</h2>
            {isLoading && <span className="text-sm text-blue-500 font-bold">Refreshing...</span>}
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
             {exams.length === 0 && !isLoading && <div className="p-8 text-gray-500 text-center text-sm font-medium">No exams tracked yet.</div>}
             {exams.map(exam => (
               <div key={exam.id} className="p-5 hover:bg-gray-50 transition border-l-4 border-l-blue-500">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{exam.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${exam.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {exam.status}
                    </span>
                 </div>
                 <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                   <span>🗓️ {exam.date ? exam.date.substring(0, 10) : 'TBD'}</span> | <span>👥 {exam.Batch?.schedule || 'Batch Array'}</span>
                 </p>
                 <div className="flex gap-2">
                    {exam.status === 'Completed' ? (
                       <button className="text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded text-sm font-semibold hover:bg-blue-100 transition shadow-sm">View Analytics</button>
                    ) : (
                       <button onClick={() => simulateMarksUpload(exam.id)} className="text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded text-sm font-bold hover:bg-green-100 transition flex items-center gap-1 shadow-sm">
                         <span>⬆️</span> Upload Marks
                       </button>
                    )}
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
             📈 Performance Analytics
          </h2>
          <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-gray-400 text-center px-8">
             Select a completed exam to view Top Performers, Class Averages, and Weak Subject Areas.
          </div>
        </div>
      </div>
    </div>
  );
}
