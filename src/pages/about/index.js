export default function AboutPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-[80vh] py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            About <span className="text-blue-700">R J Concept</span>
          </h1>
          <div className="h-1 w-24 bg-yellow-500 mx-auto rounded"></div>
          <p className="text-gray-600 mt-6 text-lg max-w-3xl mx-auto leading-relaxed">
            Building careers through concept based learning and structured preparation.
          </p>
        </div>
        {/* About Content */}
        <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 mb-10">
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Established in{" "}
            <span className="font-semibold text-blue-700">2020</span>,{" "}
            <span className="font-bold text-blue-700">R J Concept</span>{" "}
            has emerged as one of the most trusted coaching institutes in
            Purnia for competitive exam preparation. With a strong focus on
            concept-based learning and student-centric teaching methods, we
            ensure that every student receives the attention and guidance
            required to succeed.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our experienced faculty, structured courses, and regular
            performance evaluation system help students build strong
            fundamentals and confidence to crack top exams like UPSC, BPSC,
            STET, DAROGA, SSC, CTET, RAILWAY, BANK, NAVY, AIR FORCE, NDA, CDS,
            CLAT and CUET.
          </p>
        </div>
        {/* Leadership Section */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-10 mb-12 shadow-sm">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-10">
            Our Leadership
          </h2>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Director */}
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md border overflow-hidden mb-4">
                <img 
                  src="assets/image/rahul_jha.jpeg" 
                  alt="Rahul Jha"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Rahul Jha
              </h3>
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-3">
                Founder & Director
              </p>
              <p className="text-gray-600 italic text-sm leading-relaxed max-w-md">
                "Success in competitive exams is not about studying more,
                it is about studying right. At RJ Concept we build strong
                fundamentals, disciplined mindset and exam confidence.
                Our goal is simple — every serious student deserves
                the right guidance and the right environment to succeed."
              </p>
            </div>
            {/* CEO */}
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-md border overflow-hidden mb-4">
                <img 
                  src="assets/image/varsha_jha.jpeg" 
                  alt="Varsha Jha"
                  className="w-full h-full object-cover "
                />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Varsha Jha
              </h3>
              <p className="text-xs text-blue-700 font-semibold uppercase tracking-wider mb-3">
                CEO, RJ Concept
              </p>
              <p className="text-gray-600 italic text-sm leading-relaxed max-w-md">
                "Education is the strongest investment a student can make
                for their future. Our vision is to create an ecosystem where
                dedication meets the right mentorship. We believe every
                student has potential — our responsibility is to help
                them realise it."
              </p>
            </div>
          </div>
        </div>
        {/* Mission Vision Values */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border hover:shadow-xl transition duration-300 text-center">
            <div className="text-4xl mb-3">
              🎯
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              Our Mission
            </h3>
            <p className="text-gray-600 mt-3">
              To provide high-quality competitive coaching with
              strong concept clarity and personal attention.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md border hover:shadow-xl transition duration-300 text-center">
            <div className="text-4xl mb-3">
              👁️
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              Our Vision
            </h3>
            <p className="text-gray-600 mt-3">
              To become Bihar's most trusted institute for
              government job preparation.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md border hover:shadow-xl transition duration-300 text-center">
            <div className="text-4xl mb-3">
              ⭐
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              Our Values
            </h3>
            <p className="text-gray-600 mt-3">
              Integrity, affordability, excellence and
              student success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}