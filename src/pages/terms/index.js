import { useMemo } from 'react';
import Seo from '../../components/Seo';
import { getBreadcrumbSchema } from '../../utils/seoSchemas';

export default function TermsOfService() {
  const seoSchema = useMemo(() => {
    return getBreadcrumbSchema([
      { name: 'Home', item: '/' },
      { name: 'Terms of Service', item: '/terms' }
    ]);
  }, []);

  return (
    <>
      <Seo
        title="Terms of Service"
        description="Read the Terms and Conditions of RJ Concept. Understand rules governing student enrollment, fee payments, and online test platform policies."
        schema={seoSchema}
      />

      <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-sm rounded-2xl border border-gray-100">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-8 border-b-4 border-blue-600 inline-block pb-2">
            Terms of Service
          </h1>
          <div className="prose prose-lg text-gray-700 space-y-6">
            <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the RJ Concept platform and enrolling in our coaching programs, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account and enrollment.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Fee Payment & Refunds</h2>
            <p>
              All fee payments for courses, mock tests, and study materials must be completed by the specified deadlines. 
              Fee refunds will only be processed under specific circumstances as dictated by our internal refund policy. 
              RJ Concept reserves the right to modify fees at any subsequent academic cycle.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              The Service and its original content (including course materials, notes, test structures, and video lectures), features, and functionality are and will remain the exclusive property of RJ Concept and its licensors. You may not distribute, modify, or reproduce any material without explicit permission.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Code of Conduct</h2>
            <p>
              Students are expected to maintain strict discipline inside the institute and on our digital platforms. Misbehavior, harassment of staff or peers, and disruption of classes will lead to strict disciplinary action, including potential termination of admission without a refund.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. It is your responsibility to check these Terms periodically for changes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
