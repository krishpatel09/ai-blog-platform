import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">

      {/* ================= NAVBAR ================= */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/WriteGen.svg"
            alt="WriteGen AI Logo"
            width={160}
            height={60} 
            className="mix-blend-multiply dark:mix-blend-screen"
            priority
          />
          <span className="sr-only">WriteGen AI</span>
        </Link>

        <div className="flex gap-3 items-center">
          <Link
            href="/sign-in"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Write Smarter.
            <br />
            Publish Faster with AI.
          </h1>

          <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
            WriteGen AI helps you turn ideas into high-quality blog posts.
            Generate content from text or images, improve clarity, and publish confidently — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            >
              Start Writing Free
            </Link>

            <Link
              href="/sign-in"
              className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-xl border border-gray-300 dark:border-slate-600 hover:border-indigo-500 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200">
            Why Choose WriteGen AI?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-linear-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                AI-Powered Writing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate complete blog posts from prompts or images using advanced AI models.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Smart Content Tools
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Improve SEO, readability, tone, and structure automatically with intelligent tools.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition">
              <div className="w-12 h-12 bg-linear-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
                Seamless Publishing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Draft, edit, schedule, and publish content without leaving the platform.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-14 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Turn Ideas into Impactful Content
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Join thousands of creators using AI to write better, faster.
          </p>

          <Link
            href="/sign-up"
            className="inline-block px-10 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transition shadow-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}  
      <footer className="container mx-auto px-4 py-10 border-t border-gray-200 dark:border-slate-700">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} <span className="font-semibold">WriteGen AI</span>. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
