import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useStudentStore } from '../../../stores/studentStore';

export default function StudentProfile(){

const router = useRouter();
const { id } = router.query;

const { students } = useStudentStore();

const [student,setStudent]=useState(null);

useEffect(()=>{

if(id && students.length){

const found = students.find(s=>s.id===id);

setStudent(found);

}

},[id,students]);

if(!student){

return(
<div className="p-10 text-center font-semibold">
Loading student profile...
</div>
);

}

const feeColor = student.feeStatus === 'PAID'
? 'bg-green-100 text-green-700'
: student.feeStatus === 'OVERDUE'
? 'bg-red-100 text-red-700'
: 'bg-yellow-100 text-yellow-700';

return(

<div className="bg-gray-100 min-h-screen p-6">

<button
onClick={()=>router.back()}
className="mb-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow"
>
← Back
</button>

<div className="max-w-4xl mx-auto">

{/* PROFILE HEADER */}

<div className="bg-white rounded-xl shadow p-6 mb-5 flex items-center gap-5">

<div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
{student.name.charAt(0)}
</div>

<div className="flex-1">

<h1 className="text-2xl font-bold">
{student.name}
</h1>

<div className="text-gray-500 text-sm mt-1">
{student.phone || 'No Phone'}
</div>

<div className="flex gap-3 mt-3">

<span className={`px-3 py-1 text-xs font-bold rounded ${feeColor}`}>
{student.feeStatus}
</span>

<span className="px-3 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700">
{student.Course?.title || 'No Course'}
</span>

<span className="px-3 py-1 text-xs font-bold rounded bg-purple-100 text-purple-700">
{student.Batch?.schedule || 'No Batch'}
</span>

</div>

</div>

<button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
Edit
</button>

</div>

{/* PROFILE DETAILS */}

<div className="bg-white rounded-xl shadow p-6 h-[65vh] overflow-y-auto">

<h2 className="text-lg font-bold mb-4 border-b pb-2">
Personal Information
</h2>

<div className="grid grid-cols-2 gap-5 text-sm">

<div>
<div className="text-gray-500">Email</div>
<div className="font-semibold">
{student.email || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">Father Name</div>
<div className="font-semibold">
{student.fatherName || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">Parent Name</div>
<div className="font-semibold">
{student.parentName || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">Gender</div>
<div className="font-semibold">
{student.gender || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">Admission Date</div>
<div className="font-semibold">
{student.admissionDate || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">Date of Birth</div>
<div className="font-semibold">
{student.dateOfBirth || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">City</div>
<div className="font-semibold">
{student.city || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">Zip Code</div>
<div className="font-semibold">
{student.zipCode || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">Qualification</div>
<div className="font-semibold">
{student.qualification || 'NA'}
</div>
</div>

<div>
<div className="text-gray-500">Source</div>
<div className="font-semibold">
{student.sourceOfInformation || 'NA'}
</div>
</div>

</div>

<div className="mt-6">

<div className="text-gray-500">
Address
</div>

<div className="font-semibold mt-1">
{student.address || 'NA'}
</div>

</div>

{/* FUTURE MODULES */}

<div className="mt-8 border-t pt-5">

<h2 className="font-bold mb-3">
Academic Info
</h2>

<div className="grid grid-cols-2 gap-5 text-sm">

<div>

<div className="text-gray-500">
Course
</div>

<div className="font-semibold">
{student.Course?.title || 'NA'}
</div>

</div>

<div>

<div className="text-gray-500">
Batch
</div>

<div className="font-semibold">
{student.Batch?.schedule || 'NA'}
</div>

</div>

<div>

<div className="text-gray-500">
Attendance
</div>

<div className="font-semibold">
{student.attendanceStatus || 'NA'}
</div>

</div>

<div>

<div className="text-gray-500">
Fee Status
</div>

<div className="font-semibold">
{student.feeStatus}
</div>

</div>

</div>

</div>

</div>

</div>

</div>

);

}