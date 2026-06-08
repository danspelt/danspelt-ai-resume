export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-center text-4xl font-bold">Simple Pricing</h1>
        <p className="mt-4 text-center text-slate-300">
          Get your resume optimized and land more interviews.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold">Quick Fix</h2>
            <p className="mt-2 text-slate-300">Resume review + improvement suggestions.</p>
            <p className="mt-6 text-4xl font-bold">$19</p>
            <a href="/fix" className="mt-6 block rounded-xl bg-purple-500 px-5 py-3 text-center font-semibold">
              Get Started
            </a>
          </div>

          <div className="rounded-2xl border border-purple-500 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold">Full Optimize</h2>
            <p className="mt-2 text-slate-300">Complete rewrite with ATS optimization.</p>
            <p className="mt-6 text-4xl font-bold">$49</p>
            <a href="/fix" className="mt-6 block rounded-xl bg-purple-500 px-5 py-3 text-center font-semibold">
              Get Started
            </a>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold">Career Package</h2>
            <p className="mt-2 text-slate-300">Resume + cover letter + LinkedIn optimization.</p>
            <p className="mt-6 text-4xl font-bold">$99</p>
            <a href="/fix" className="mt-6 block rounded-xl bg-purple-500 px-5 py-3 text-center font-semibold">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
