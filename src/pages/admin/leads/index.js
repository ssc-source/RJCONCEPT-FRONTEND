import { useEffect } from 'react';
import { useLeadStore } from '../../../stores/leadStore';

export default function LeadsPage() {
  const { leads, isLoading, fetchLeads, updateLeadStatus } = useLeadStore();

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const statusColors = {
    'NEW': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'CONTACTED': 'bg-blue-100 text-blue-800 border-blue-200',
    'INTERESTED': 'bg-purple-100 text-purple-800 border-purple-200',
    'CONVERTED': 'bg-green-100 text-green-800 border-green-200',
    'LOST': 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads & Enquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pipeline and convert prospective students</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            🤖 Auto WhatsApp Follow-up
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-medium">No leads currently in the pipeline.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prospect Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Interest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Pipeline</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Smart Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{lead.name}</div>
                    <div className="text-xs text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {lead.courseInterest || lead.interest}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${statusColors[lead.status] || 'bg-gray-100'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-green-600 bg-gray-100 hover:bg-green-50 p-2 rounded-full transition" title="WhatsApp">
                        💬
                      </a>
                      <a href={`tel:${lead.phone}`} className="text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 p-2 rounded-full transition" title="Call Now">
                        📞
                      </a>
                      {lead.status !== 'CONVERTED' && (
                        <button onClick={() => updateLeadStatus(lead.id, 'CONVERTED')} className="text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold px-3 py-1.5 rounded transition shadow-sm border border-blue-100">
                          Convert ✓
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
