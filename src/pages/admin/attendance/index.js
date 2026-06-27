import { useState } from 'react';
import { useAttendanceStore } from '../../../stores/attendanceStore';
import { useBatchStore } from '../../../stores/batchStore';
import { useEffect } from 'react';

export default function AttendancePage() {
  const { attendanceList, isLoading, fetchBatchAttendance, updateLocalStatus, saveAttendance } = useAttendanceStore();
  const { batches, fetchBatches } = useBatchStore();
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    if (!batchId && batches.length > 0) {
      setBatchId(String(batches[0].id));
    }
  }, [batches, batchId]);

  const handleFetch = (e) => {
    e.preventDefault();
    fetchBatchAttendance(batchId, date);
  };

  const handleSave = () => {
    saveAttendance(batchId, date);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Record daily attendance for batches natively</p>
      </div>

      <form onSubmit={handleFetch} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Select Batch</label>
          <select value={batchId} onChange={e => setBatchId(e.target.value)} className="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-blue-500 bg-gray-50 outline-none">
            {batches.length === 0 && <option value="">No batches available</option>}
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.Course?.title ? `${batch.Course.title} - ` : ''}{batch.schedule || `Batch ${batch.id}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border-gray-300 border rounded-lg px-4 py-2 focus:ring-blue-500 bg-gray-50 outline-none" required />
        </div>
        <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition h-[42px] disabled:opacity-50">
          {isLoading ? '...' : 'Fetch List'}
        </button>
      </form>

      {attendanceList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
             <h2 className="font-bold text-gray-800">Batch Record - {date}</h2>
             <div className="flex gap-2 text-sm font-medium pr-4">
               Status Actions
             </div>
          </div>
          <div className="divide-y divide-gray-100">
            {attendanceList.map(student => (
              <div key={student.studentId} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                <div>
                  <p className="font-bold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.phone}</p>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                  <button 
                    onClick={() => updateLocalStatus(student.studentId, 'PRESENT')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${student.status === 'PRESENT' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
                    Present
                  </button>
                  <button 
                    onClick={() => updateLocalStatus(student.studentId, 'ABSENT')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${student.status === 'ABSENT' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t flex justify-end">
             <button onClick={handleSave} disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition flex gap-2 disabled:opacity-50">
               {isLoading ? 'Saving...' : '💾 Save Attendance'}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
