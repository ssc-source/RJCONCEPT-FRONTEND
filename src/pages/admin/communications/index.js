export default function CommunicationsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Communication Panel</h1>
        <p className="text-sm text-gray-500 mt-1">Broadcast messages to students and parents</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
             <label className={`cursor-pointer border-2 p-4 rounded-xl text-center font-bold transition border-blue-500 bg-blue-50 text-blue-700 relative`}>
               <input type="radio" name="channel" className="hidden" defaultChecked />
               💬 WhatsApp
               <span className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></span>
             </label>
             <label className={`cursor-pointer border-2 border-gray-200 p-4 rounded-xl text-center font-bold text-gray-600 hover:bg-gray-50 transition`}>
               <input type="radio" name="channel" className="hidden" />
               📱 SMS
             </label>
             <label className={`cursor-pointer border-2 border-gray-200 p-4 rounded-xl text-center font-bold text-gray-600 hover:bg-gray-50 transition`}>
               <input type="radio" name="channel" className="hidden" />
               ✉️ Email
             </label>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block font-bold text-gray-700 mb-2">Select Audience</label>
            <select className="w-full border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-blue-500 outline-none border focus:border-blue-500 shadow-sm text-gray-700">
              <optgroup label="General">
                <option>All Active Students</option>
                <option>All Leads (Unconverted)</option>
              </optgroup>
              <optgroup label="By Batch">
                <option>UPSC Target (Morning)</option>
                <option>SSC Evening FastTrack</option>
              </optgroup>
            </select>
          </div>

          <div>
             <div className="flex justify-between items-end mb-2">
                <label className="block font-bold text-gray-700">Message Content</label>
                <select className="text-sm border border-gray-300 rounded px-2 py-1 text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 cursor-pointer outline-none">
                  <option>Use Template...</option>
                  <option>Fee Reminder</option>
                  <option>Exam Notification</option>
                  <option>Result Announcement</option>
                  <option>Holiday Alert</option>
                </select>
             </div>
             <textarea 
               className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800" 
               rows="6"
               placeholder="Type your message here... Use {name} to insert student name automatically."
             ></textarea>
             <p className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>Variables: {`{name}`}, {`{course}`}, {`{due_amount}`}</span>
                <span>0 / 1000 characters</span>
             </p>
          </div>

          <button className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2">
             <svg className="w-5 h-5 -mt-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
             Send Broadcast
          </button>
        </div>
      </div>
    </div>
  );
}
