import { useMemo } from 'react';
import Link from "next/link";
import Seo from "../../components/Seo";
import { getBreadcrumbSchema, getLocalBusinessSchema } from "../../utils/seoSchemas";

export default function ContactPage() {
  const seoSchema = useMemo(() => {
    return [
      getBreadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: 'Contact Us', item: '/contact' }
      ]),
      getLocalBusinessSchema()
    ];
  }, []);

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with RJ Concept coaching institute in Purnia, Bihar. Find our phone numbers, email support, campus address, and Google Maps direction."
        schema={seoSchema}
      />

      <div className="bg-slate-50 min-h-[80vh] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-12 text-center">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 bg-blue-900 text-white">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="text-blue-100 mb-8">Have questions about our courses or batches? Our team is here to help you make the right career choice.</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl" role="img" aria-label="Address Icon">📍</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 text-sm tracking-wider uppercase mb-1">Campus Address</h4>
                    <p className="text-blue-50">DIG Chowk, Line Bazar<br/>Purnia, Bihar - 854301</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl" role="img" aria-label="Phone Icon">📞</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 text-sm tracking-wider uppercase mb-1">Phone Box</h4>
                    <p className="text-blue-50">
                      <a href="tel:+919234829905" className="hover:underline">+91 92348 29905</a><br/>
                      <a href="tel:+919142546263" className="hover:underline">+91 91425 46263</a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl" role="img" aria-label="Email Icon">✉️</span>
                  <div>
                    <h4 className="font-bold text-yellow-400 text-sm tracking-wider uppercase mb-1">Email Support</h4>
                    <p className="text-blue-50">
                      <a href="mailto:info@rjconcept.in" className="hover:underline">info@rjconcept.in</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="fullName">Full Name</label>
                  <input id="fullName" type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none text-slate-800" placeholder="Enter your name" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="mobileNumber">Mobile Number</label>
                  <input id="mobileNumber" type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none text-slate-800" placeholder="+91" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="messageText">Message</label>
                  <textarea id="messageText" rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none text-slate-800" placeholder="How can we help you?" required></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-md mt-4">
                  Send Inquiry
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[400px] w-full relative">
            <iframe 
              title="RJ Concept Campus Google Map Location"
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
    </>
  );
}
