import Head from "next/head";

export default function RefundPolicy() {
  return (
    <>
      <Head>
        <title>Refund Policy | R J Concept</title>
        <meta
          name="description"
          content="Refund Policy for R J Concept - Courses, Test Series, and Book Purchases"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-20">
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-md">

          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Refund Policy
          </h1>

          <p className="mb-4 text-gray-700">
            At <strong>R J Concept</strong>, we strive to provide high-quality
            educational services and digital products. Please read our refund
            policy carefully before making any purchase.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">1. General Policy</h2>
          <p className="text-gray-700 mb-4">
            All purchases made on our platform are <strong>final and non-refundable</strong>, unless explicitly stated otherwise.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            2. Courses & Test Series
          </h2>
          <p className="text-gray-700 mb-4">
            Once access to any course or test series is granted:
          </p>
          <ul className="list-disc ml-6 text-gray-700 mb-4">
            <li>No refund will be provided</li>
            <li>No cancellation is allowed</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            3. Duplicate / Failed Transactions
          </h2>
          <p className="text-gray-700 mb-4">
            If payment is deducted but access is not granted, refund will be processed within <strong>5–7 working days</strong> or access will be provided.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            4. Books & Physical Products
          </h2>
          <p className="text-gray-700 mb-4">
            Refund/replacement is applicable only if the product is damaged or incorrect. You must report within 48 hours of delivery.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            5. Technical Issues
          </h2>
          <p className="text-gray-700 mb-4">
            Refunds will not be provided for internet issues, device compatibility issues, or lack of usage.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            6. Payment Gateway Charges
          </h2>
          <p className="text-gray-700 mb-4">
            Payment gateway charges may be deducted during refund processing.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            7. Decision Authority
          </h2>
          <p className="text-gray-700 mb-4">
            All refund decisions are subject to approval by R J Concept management.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            8. Contact Us
          </h2>
          <p className="text-gray-700 mb-2">
            Email: rjconcept07@gmail.com
          </p>
          <p className="text-gray-700 mb-4">
            Phone: 9142546263 ,8409304102
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-2">
            9. Policy Updates
          </h2>
          <p className="text-gray-700">
            We reserve the right to update this policy at any time without prior notice.
          </p>

        </div>
      </div>
    </>
  );
}