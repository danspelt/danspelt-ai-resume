"use client";

import { useState, useCallback } from "react";
import FileUpload from "../components/FileUpload";

interface OptimizationResult {
  optimizedResume: string;
  keywordsAdded?: string[];
  improvements?: string[];
  nextSteps?: string[];
}

export default function FixPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"optimized" | "keywords" | "improvements" | "nextSteps">("optimized");
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileContent = useCallback((content: string, name: string) => {
    setResumeText(content);
    setFileName(name);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/fix-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch (error) {
      alert("Failed to optimize resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.optimizedResume) return;
    await navigator.clipboard.writeText(result.optimizedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadDocx() {
    if (!result?.optimizedResume) return;

    try {
      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result.optimizedResume }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized-resume.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Failed to download. Please copy and paste manually.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Fix Your Resume</h1>
          <p className="mt-4 text-slate-300">
            Upload your resume or paste the text, then add a target job description for tailored optimization.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          {/* File Upload */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">
              Upload Resume (optional)
            </label>
            <FileUpload onFileContent={handleFileContent} />
            {fileName && (
              <p className="mt-2 text-sm text-green-400">
                Loaded: {fileName}
              </p>
            )}
          </div>

          {/* Resume Text */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Your Resume {fileName ? "(uploaded)" : "(copy & paste)"}
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your current resume here, or upload a file above..."
              rows={10}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
              required
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {resumeText.length} characters
            </p>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Target Job Description <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description to optimize for specific keywords and requirements..."
              rows={6}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !resumeText.trim()}
            className="w-full rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Optimizing...
              </span>
            ) : (
              "Optimize My Resume"
            )}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900">
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              {[
                { id: "optimized", label: "Optimized Resume" },
                { id: "keywords", label: "Keywords" },
                { id: "improvements", label: "Improvements" },
                { id: "nextSteps", label: "Next Steps" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-purple-500 text-purple-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "optimized" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
                    >
                      {copied ? (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadDocx}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm hover:bg-purple-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download DOCX
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-slate-100">
                    {result.optimizedResume}
                  </div>
                </div>
              )}

              {activeTab === "keywords" && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">ATS Keywords Added</h3>
                  {result.keywordsAdded && result.keywordsAdded.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.keywordsAdded.map((keyword, i) => (
                        <span key={i} className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-300">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">No specific keywords extracted.</p>
                  )}
                </div>
              )}

              {activeTab === "improvements" && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Key Improvements Made</h3>
                  {result.improvements && result.improvements.length > 0 ? (
                    <ul className="space-y-2">
                      {result.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-slate-200">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">No specific improvements listed.</p>
                  )}
                </div>
              )}

              {activeTab === "nextSteps" && (
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Recommended Next Steps</h3>
                  {result.nextSteps && result.nextSteps.length > 0 ? (
                    <ul className="space-y-3">
                      {result.nextSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-sm font-semibold text-purple-400">
                            {i + 1}
                          </span>
                          <span className="text-slate-200">{step}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">No next steps available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
