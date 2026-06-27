import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="bg-slate-50 min-h-[80vh] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-12 text-center">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-10 bg-blue-900 text-white">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="text-blue-100 mb-8">Have questions about our courses or batches? Our team is here to help you make the right career choice.</p>
              
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <span className="text-2xl">📍</span>
                    <div>
                      <h4 className="font-bold text-yellow-400 text-sm tracking-wider uppercase mb-1">Campus Address</h4>
                      <p className="text-blue-50">Line Bazar, Near Medical College Road<br/>Purnia, Bihar - 854301</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <span className="text-2xl">📞</span>
                    <div>
                      <h4 className="font-bold text-yellow-400 text-sm tracking-wider uppercase mb-1">Phone Box</h4>
                      <p className="text-blue-50">+91 98765 43210<br/>+91 87654 32109</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <span className="text-2xl">✉️</span>
                    <div>
                      <h4 className="font-bold text-yellow-400 text-sm tracking-wider uppercase mb-1">Email Support</h4>
                      <p className="text-blue-50">info@rjconcept.com</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                   <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none" placeholder="Enter your name" required />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                   <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none" placeholder="+91" required />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                   <textarea rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none" placeholder="How can we help you?" required></textarea>
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-md mt-4">
                   Send Inquiry
                 </button>
              </form>
           </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[400px] w-full relative">
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.11326442657!2d87.47940277626966!3d25.766810212497184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eff91689255ddb%3A0xc3ce1eec9562479e!2sR%20J%20Concept!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             allowFullScreen="" 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
           ></iframe>
        </div>
      </div>
    </div>
  );
}
