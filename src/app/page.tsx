import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-blue-900/10" />
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:py-32">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-200">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
            AI-Powered Resume Optimization
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Land your dream job with an{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-optimized resume
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
            Upload your resume and get instant AI feedback. Fix weak bullet points,
            optimize for ATS systems, and get more interviews in minutes.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/fix"
              className="group relative rounded-xl bg-purple-500 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-purple-400 hover:shadow-purple-500/40"
            >
              Fix My Resume Free
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/pricing"
              className="rounded-xl border border-slate-600 bg-slate-900/50 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-500 hover:bg-slate-800"
            >
              See Pricing
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No signup required
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant results
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ATS-friendly format
            </span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-800/50 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 md:text-4xl">10K+</div>
              <div className="mt-1 text-sm text-slate-400">Resumes Optimized</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 md:text-4xl">85%</div>
              <div className="mt-1 text-sm text-slate-400">More Interview Callbacks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 md:text-4xl">3x</div>
              <div className="mt-1 text-sm text-slate-400">Faster Job Search</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Everything you need to get hired</h2>
          <p className="mt-4 text-slate-400">Powerful AI tools to optimize every aspect of your resume</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon="ats"
            title="ATS Optimization"
            description="Pass automated resume screening systems every time with keyword-rich, properly formatted resumes."
          />
          <FeatureCard
            icon="bullet"
            title="Better Bullet Points"
            description="Transform weak descriptions into achievement-focused statements with quantified results."
          />
          <FeatureCard
            icon="keyword"
            title="Keyword Matching"
            description="Automatically match your resume to specific job descriptions for maximum relevance."
          />
          <FeatureCard
            icon="file"
            title="File Upload Support"
            description="Upload PDF, DOCX, or TXT files and get them parsed automatically for instant analysis."
          />
          <FeatureCard
            icon="download"
            title="Export to DOCX"
            description="Download your optimized resume in professional Microsoft Word format, ready to submit."
          />
          <FeatureCard
            icon="magic"
            title="AI Suggestions"
            description="Get specific improvement recommendations and actionable next steps for your job search."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="mt-4 text-slate-400">Get your optimized resume in 3 simple steps</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <StepCard
              number={1}
              title="Upload Your Resume"
              description="Paste your resume text or upload your PDF/DOCX file. Our AI reads and analyzes every detail."
            />
            <StepCard
              number={2}
              title="Add Job Description"
              description="Optionally paste the job description you're targeting for tailored keyword optimization."
            />
            <StepCard
              number={3}
              title="Get Instant Results"
              description="Receive your AI-optimized resume with improvement suggestions and ATS keywords."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/40" />
        <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-blue-600/30 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to get more interviews?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Join 10,000+ job seekers who optimized their resumes with AI. 
            Your dream job is just one click away.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/fix"
              className="rounded-xl bg-purple-500 px-8 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:bg-purple-400"
            >
              Optimize My Resume Now
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Start for free. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-xl font-bold">
              AI Resume<span className="text-purple-400">Fixer</span>
            </div>
            <div className="flex gap-8">
              <Link href="/fix" className="text-slate-400 hover:text-white">
                Fix Resume
              </Link>
              <Link href="/pricing" className="text-slate-400 hover:text-white">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-slate-400 hover:text-white">
                My Resumes
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-slate-500 md:text-left">
            © 2025 AI Resume Fixer. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  const icons: Record<string, React.ReactNode> = {
    ats: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bullet: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    keyword: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    file: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    download: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    magic: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  };

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-purple-500/30 hover:bg-slate-800/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 transition-colors group-hover:bg-purple-500/30">
        {icons[icon]}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="relative text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-2xl font-bold shadow-lg shadow-purple-500/25">
        {number}
      </div>
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-slate-400">{description}</p>
    </div>
  );
}

