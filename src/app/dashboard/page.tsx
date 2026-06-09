import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Resumes</h1>
            <p className="mt-1 text-slate-400">
              View and manage your optimized resumes
            </p>
          </div>
          <Link
            href="/fix"
            className="rounded-xl bg-purple-500 px-4 py-2 font-semibold text-white hover:bg-purple-400"
          >
            + New Resume
          </Link>
        </div>

        {/* Empty State */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">No resumes yet</h2>
          <p className="mt-2 text-slate-400">
            Upload your resume and get AI-powered optimization to land more
            interviews.
          </p>
          <Link
            href="/fix"
            className="mt-6 inline-block rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-400"
          >
            Fix My First Resume
          </Link>
        </div>

        {/* Feature Preview */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <svg
                className="h-5 w-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold">Save History</h3>
            <p className="mt-1 text-sm text-slate-400">
              All your optimizations are saved for future reference
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <svg
                className="h-5 w-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 className="font-semibold">Easy Export</h3>
            <p className="mt-1 text-sm text-slate-400">
              Download your optimized resumes in DOCX format
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <svg
                className="h-5 w-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-semibold">Multiple Versions</h3>
            <p className="mt-1 text-sm text-slate-400">
              Create tailored versions for different job applications
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
