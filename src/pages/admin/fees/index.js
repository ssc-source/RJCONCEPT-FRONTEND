import { useEffect, useState } from 'react';
import { useFeeStore } from '../../../stores/feeStore';

export default function FeesPage() {
  const { fees, isLoading, fetchFees, collectPayment } = useFeeStore();
  const [collectionAmount, setCollectionAmount] = useState('');
  const [activeFeeId, setActiveFeeId] = useState(null);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const totalCollected = fees.reduce((acc, f) => acc + (f.amountPaid || 0), 0);
  const totalPending = fees.reduce((acc, f) => acc + (f.amountDue || 0), 0);
  const overdueCount = fees.filter(f => f.status === 'OVERDUE').length;

  const handleCollect = (e, feeId) => {
    e.preventDefault();
    if (collectionAmount) {
       collectPayment(feeId, collectionAmount);
       setCollectionAmount('');
       setActiveFeeId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track payments, issue receipts, and send reminders</p>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">
          + Invoice Options
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Total Collected</p>
              <p className="text-2xl font-extrabold text-gray-900">₹{(totalCollected/1000).toFixed(0)}k</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-xl">💰</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Pending Dues</p>
              <p className="text-2xl font-extrabold text-gray-900">₹{(totalPending/1000).toFixed(0)}k</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center text-xl">⏳</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Overdue Accounts</p>
              <p className="text-2xl font-extrabold text-gray-900">{overdueCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center text-xl">⚠️</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
            <div className="p-8 text-center text-gray-500 font-medium">Loading finance records...</div>
        ) : fees.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">No fee records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Due</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date & Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{fee.Student?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{fee.Course?.title || 'No Course'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">₹{fee.amountTotal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">₹{fee.amountPaid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">₹{fee.amountDue}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-semibold text-gray-500 mb-1">{fee.dueDate || 'N/A'}</div>
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded border 
                        ${fee.status === 'PAID' ? 'bg-green-100 text-green-800 border-green-200' : 
                          fee.status === 'OVERDUE' ? 'bg-red-100 text-red-800 border-red-200' : 
                          'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       {fee.status !== 'PAID' && (
                         activeFeeId === fee.id ? (
                           <form onSubmit={(e) => handleCollect(e, fee.id)} className="flex items-center justify-end gap-2">
                             <input 
                               type="number" 
                               value={collectionAmount} 
                               onChange={e => setCollectionAmount(e.target.value)}
                               placeholder="Amt" 
                               className="w-20 px-2 py-1 border rounded text-xs"
                               required 
                             />
                             <button type="submit" className="text-white bg-green-600 hover:bg-green-700 px-2 py-1 flex items-center rounded text-xs transition">Pay</button>
                             <button type="button" onClick={() => setActiveFeeId(null)} className="text-gray-500 hover:bg-gray-200 px-2 py-1 rounded text-xs transition">X</button>
                           </form>
                         ) : (
                           <button onClick={() => setActiveFeeId(fee.id)} className="text-green-700 bg-green-50 hover:bg-green-100 font-bold border border-green-200 px-3 py-1.5 rounded inline-block mr-2 transition">Collect</button>
                         )
                       )}
                      {fee.status === 'OVERDUE' && <button className="text-red-700 hover:bg-red-100 bg-red-50 font-bold border border-red-200 px-3 py-1.5 rounded inline-block transition">Remind</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
