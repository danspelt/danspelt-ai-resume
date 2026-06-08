"use client";

import { useState } from "react";

export default function FixPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const response = await fetch("/api/fix-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resumeText, jobDescription }),
    });

    const data = await response.json();

    if (!response.ok) {
      setResult(data.error || "Something went wrong.");
    } else {
      setResult(data.optimizedResume);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">Fix Your Resume</h1>

        <p className="mt-4 text-slate-300">
          Paste your resume and target job description to get an AI-optimized version.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <label className="block text-sm font-medium">Your Resume (copy & paste)</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your current resume here..."
              rows={8}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Target Job Description (optional)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description to optimize for specific keywords..."
              rows={6}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-400 disabled:opacity-60"
          >
            {loading ? "Optimizing..." : "Optimize My Resume"}
          </button>
        </form>

        {result && (
          <div className="mt-8 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
