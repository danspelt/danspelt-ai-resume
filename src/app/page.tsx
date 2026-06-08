export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <p className="mb-4 rounded-full border border-purple-400/40 px-4 py-2 text-sm text-purple-200">
          AI Resume Fixer
        </p>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Get more interviews with an AI-optimized resume.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Upload your resume and get instant feedback. Fix weak bullet points, 
          optimize for ATS systems, and land your dream job faster.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/fix"
            className="rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-400"
          >
            Fix My Resume
          </a>

          <a
            href="/pricing"
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white hover:bg-slate-900"
          >
            See Pricing
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">ATS Optimization</h2>
          <p className="mt-3 text-slate-300">
            Pass automated resume screening systems every time.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Better Bullet Points</h2>
          <p className="mt-3 text-slate-300">
            Transform weak descriptions into achievement-focused statements.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Keyword Matching</h2>
          <p className="mt-3 text-slate-300">
            Tailor your resume to specific job descriptions.
          </p>
        </div>
      </section>
    </main>
  );
}
