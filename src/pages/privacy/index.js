export const metadata = {
  title: 'Privacy Policy | RJ Concept',
  description: 'Overview of our privacy practices and how we handle your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-8 border-b-4 border-blue-600 inline-block pb-2">
          Privacy Policy
        </h1>
        <div className="prose prose-lg text-gray-700 space-y-6">
          <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p>
            At RJ Concept, we collect information to provide better services to our students. 
            This includes personal information such as your name, email address, phone number, and educational background 
            when you register for our courses or fill out an admission form. 
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process your enrollment and manage your academic profile.</li>
            <li>Communicate with you regarding schedules, course updates, and exam results.</li>
            <li>Improve our platform, application, and educational offerings.</li>
            <li>Comply with legal and regulatory requirements.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
          <p>
            We implement high-security standards to protect your personal information from unauthorized access, 
            alteration, disclosure, or destruction. However, please be aware that no transmission of data over 
            the internet is entirely secure.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Sharing Your Information</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share generic 
            aggregated demographic information not linked to any personal identification regarding visitors and 
            users with our business partners and trusted affiliates for the purposes outlined above.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at 
            <strong> support@rjconcept.in</strong> or visit our center.
          </p>
        </div>
      </div>
    </div>
  );
}
