import Link from 'next/link';
import { useEffect } from 'react';
import { useStudentStore } from '../../../stores/studentStore';
import { useRouter } from 'next/router';
import DocumentTemplate from '../../../components/pdf/DocumentTemplate';
import { buildDocumentConfig } from '../../../utils/documentSchemas';
import { useDocumentDownload } from '../../../hooks/useDocumentDownload';

export default function StudentsPage() {
  const { downloadDocument } = useDocumentDownload();
  const { students, isLoading, fetchStudents, updateFeeStatus } = useStudentStore();

  const router = useRouter();

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDownloadStudents = async () => {
    try {
      await downloadDocument('students-document-area', 'students-report.pdf');
    } catch (error) {
      alert(error.message || 'Unable to download students PDF');
    }
  };

  const studentsDocument = buildDocumentConfig('student-report', { items: students });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Students <span className="text-gray-400 text-lg font-normal ml-2">({students.length})</span></h1>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input type="text" placeholder="Search by name / phone..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <span className="absolute left-3 top-2 text-gray-400">🔍</span>
          </div>
          <button type="button" className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium" onClick={handleDownloadStudents}>
            Download Students
          </button>
          <select className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-blue-500 outline-none">
            <option>All Courses</option>
            <option>UPSC / BPSC</option>
            <option>SSC / Banking</option>
            <option>Defence</option>
          </select>
          <Link href="/admin/students/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 shrink-0 shadow-sm transition">
            + Add New
          </Link>
        </div>
      </div>

      <div id="students-table-area" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
           <div className="p-8 text-center text-gray-500 font-medium">Fetching students database...</div>
        ) : students.length === 0 ? (
           <div className="p-8 text-center text-gray-500 font-medium">No active students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name & Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course / Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attend. %</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{student.Course?.title || student.courseId || 'No Course'}</div>
                      <div className="text-xs text-gray-500">{student.Batch?.schedule || student.batchId || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                       <select 
                          value={student.feeStatus || 'PARTIAL'} 
                          onChange={(e) => updateFeeStatus(student.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg border px-2 py-1 outline-none cursor-pointer focus:ring-2
                            ${student.feeStatus === 'PAID' ? 'bg-green-100 text-green-800 border-green-200 focus:ring-green-400' : 
                              student.feeStatus === 'OVERDUE' ? 'bg-red-100 text-red-800 border-red-200 focus:ring-red-400' : 
                              'bg-yellow-100 text-yellow-800 border-yellow-200 focus:ring-yellow-400'}`}
                       >
                         <option value="PAID">PAID</option>
                         <option value="PARTIAL">PARTIAL</option>
                         <option value="OVERDUE">OVERDUE</option>
                       </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                       {student.attendanceStatus || 'NA'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={()=>router.push(`/admin/students/${student.id}`)} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded inline-block mr-2 font-bold shadow-sm transition">Profile</button>
                      {student.feeStatus === 'OVERDUE' && <button className="text-red-700 hover:bg-red-100 bg-red-50 border border-red-200 px-3 py-1 rounded inline-block font-bold transition shadow-sm">Remind</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div id="students-document-area" className="fixed left-[-99999px] top-0">
        <DocumentTemplate
          title={studentsDocument.title}
          generatedAt={studentsDocument.generatedAt}
          metadata={studentsDocument.metadata}
          columns={studentsDocument.columns}
          rows={studentsDocument.rows}
          footerNote={studentsDocument.footerNote}
          headerClassName={studentsDocument.headerClassName}
          logoClassName={studentsDocument.logoClassName}
        />
      </div>
    </div>
  );
}
