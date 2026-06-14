"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import FileUpload from "../components/FileUpload";
import { STORAGE_KEY } from "../dashboard/page";

interface OptimizationResult {
  optimizedResume: string;
  keywordsAdded?: string[];
  improvements?: string[];
  nextSteps?: string[];
}

interface SessionAccess {
  paid: boolean;
  plan: string | null;
  credits: number;
  used: number;
  remaining: number;
}

export const SESSION_KEY = "ai_resume_session_id";

const PROGRESS_STEPS = [
  "Reading your resume...",
  "Analyzing structure and content...",
  "Matching keywords to job description...",
  "Rewriting bullet points with impact...",
  "Optimizing for ATS systems...",
  "Finalizing your optimized resume...",
];

function FixPageContent() {
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("success") === "true";
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobInputMode, setJobInputMode] = useState<"text" | "url">("text");
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"optimized" | "keywords" | "improvements" | "nextSteps">("optimized");
  const [fileName, setFileName] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [access, setAccess] = useState<SessionAccess | null>(null);
  const [verifying, setVerifying] = useState(true);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Resolve and verify the paid Stripe session on mount.
  useEffect(() => {
    const urlSession = searchParams.get("session_id");
    let active: string | null = urlSession;
    if (!active) {
      try {
        active = localStorage.getItem(SESSION_KEY);
      } catch {
        active = null;
      }
    }

    if (!active) {
      setVerifying(false);
      return;
    }

    setSessionId(active);
    try {
      localStorage.setItem(SESSION_KEY, active);
    } catch {
      /* ignore storage errors */
    }

    (async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${encodeURIComponent(active!)}`);
        const data = await res.json();
        if (res.ok && data.paid) {
          setAccess(data as SessionAccess);
        } else {
          setAccess(null);
        }
      } catch {
        setAccess(null);
      } finally {
        setVerifying(false);
      }
    })();
  }, [searchParams]);

  const handleFileContent = useCallback((content: string, name: string) => {
    setResumeText(content);
    setFileName(name);
    setFileError(null);
  }, []);

  const handleFileError = useCallback((message: string) => {
    setFileError(message);
  }, []);

  useEffect(() => {
    if (loading) {
      setProgressStep(0);
      progressInterval.current = setInterval(() => {
        setProgressStep((prev) =>
          prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev
        );
      }, 2200);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/fix-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        // Sync remaining credits if the server reports a paywall.
        if (data.paywall) {
          setAccess((prev) => (prev ? { ...prev, remaining: 0 } : prev));
        }
      } else {
        if (typeof data.remaining === "number") {
          setAccess((prev) => (prev ? { ...prev, remaining: data.remaining } : prev));
        }
        setResult(data);
        // Save to localStorage history
        try {
          const entry = {
            id: Date.now().toString(),
            fileName: fileName,
            jobDescription: jobDescription.trim() || null,
            optimizedResume: data.optimizedResume,
            keywordsAdded: data.keywordsAdded ?? [],
            improvements: data.improvements ?? [],
            createdAt: new Date().toISOString(),
          };
          const stored = localStorage.getItem(STORAGE_KEY);
          const history = stored ? JSON.parse(stored) : [];
          history.unshift(entry);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
        } catch { /* ignore storage errors */ }
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchJobDescriptionFromUrl() {
    if (!jobUrl.trim()) return;
    setFetchingUrl(true);
    setError(null);
    try {
      const response = await fetch("/api/fetch-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403 || data.blocked) {
          setError(`${data.error} Click "Paste Text" above to manually copy the job description.`);
        } else {
          setError(data.error || "Failed to fetch job description from URL.");
        }
      } else {
        setJobDescription(data.jobDescription);
      }
    } catch {
      setError("Network error. Could not fetch job description from URL.");
    } finally {
      setFetchingUrl(false);
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
      setError("Failed to download. Please copy and paste manually.");
    }
  }

  const hasAccess = !!access && access.remaining > 0;
  const planName = access?.plan
    ? access.plan.charAt(0).toUpperCase() + access.plan.slice(1)
    : null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        {paymentSuccess && (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-300">Payment successful!</p>
              <p className="text-sm text-green-400/80">
                Thank you for your purchase. Paste your resume below to get started.
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <h1 className="text-4xl font-bold">Fix Your Resume</h1>
          <p className="mt-4 text-slate-300">
            Upload your resume or paste the text, then add a target job
            description for tailored optimization.
          </p>
        </div>

        {/* Access status */}
        {verifying ? (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm text-slate-400">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Checking your access...
          </div>
        ) : hasAccess ? (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-purple-200">
              <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {planName ? `${planName} plan active · ` : ""}
                <strong className="font-semibold text-white">{access!.remaining}</strong> optimization{access!.remaining === 1 ? "" : "s"} remaining
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-5 text-center">
            <p className="font-semibold text-amber-200">
              {access && access.remaining <= 0
                ? "You've used all optimizations for this purchase."
                : "A plan is required to optimize your resume."}
            </p>
            <p className="mt-1 text-sm text-amber-300/80">
              Choose a plan to unlock AI optimization — results in under 60 seconds.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-purple-400"
            >
              View Plans &amp; Pricing
            </Link>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8"
        >
          {/* File Upload */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-200">
              Upload Resume{" "}
              <span className="text-slate-500">(PDF, DOCX, TXT)</span>
            </label>
            <FileUpload
              onFileContent={handleFileContent}
              onError={handleFileError}
            />
            {fileError && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-red-400">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {fileError}
              </p>
            )}
            {fileName && !fileError && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-green-400">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Loaded: {fileName}
              </p>
            )}
          </div>

          {/* Resume Text */}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Your Resume{" "}
              <span className="text-slate-500">
                {fileName ? "(from uploaded file)" : "(paste or type)"}
              </span>
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your current resume here, or upload a file above..."
              rows={10}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {resumeText.length.toLocaleString()} characters
            </p>
          </div>

          {/* Job Description */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <label className="block text-sm font-medium text-slate-200">
                Target Job Description{" "}
                <span className="text-slate-500">(optional but recommended)</span>
              </label>
              <div className="flex rounded-lg border border-slate-700 bg-slate-950 p-0.5">
                <button
                  type="button"
                  onClick={() => setJobInputMode("text")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    jobInputMode === "text"
                      ? "bg-purple-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => setJobInputMode("url")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    jobInputMode === "url"
                      ? "bg-purple-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Job URL
                </button>
              </div>
            </div>

            {jobInputMode === "text" ? (
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to optimize for specific keywords and requirements..."
                rows={5}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://example.com/job-posting..."
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={fetchJobDescriptionFromUrl}
                    disabled={fetchingUrl || !jobUrl.trim()}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {fetchingUrl ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Fetching...
                      </span>
                    ) : (
                      "Fetch Job"
                    )}
                  </button>
                </div>
                {jobDescription && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                    <p className="text-sm text-green-400">
                      Job description loaded! ({jobDescription.length.toLocaleString()} characters)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !resumeText.trim() || !hasAccess}
            className="w-full rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Optimizing...
              </span>
            ) : hasAccess ? (
              "Optimize My Resume →"
            ) : (
              "Purchase a plan to optimize"
            )}
          </button>
        </form>

        {/* Progress */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="mb-4 text-sm font-medium text-slate-300">
              AI is working on your resume...
            </p>
            <div className="space-y-2">
              {PROGRESS_STEPS.map((step, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm transition-opacity duration-500 ${i <= progressStep ? "opacity-100" : "opacity-25"}`}>
                  {i < progressStep ? (
                    <svg className="h-4 w-4 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : i === progressStep ? (
                    <svg className="h-4 w-4 flex-shrink-0 animate-spin text-purple-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <div className="h-4 w-4 flex-shrink-0 rounded-full border border-slate-600" />
                  )}
                  <span className={i === progressStep ? "text-purple-300" : i < progressStep ? "text-slate-300" : "text-slate-600"}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef} className="mt-10 rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <h2 className="font-semibold text-green-400">Resume Optimized!</h2>
                </div>
                <Link
                  href="/dashboard"
                  className="text-xs text-slate-400 hover:text-purple-400"
                >
                  View in Dashboard →
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-800">
              {[
                { id: "optimized", label: "Optimized Resume" },
                { id: "keywords", label: `Keywords${result.keywordsAdded?.length ? ` (${result.keywordsAdded.length})` : ""}` },
                { id: "improvements", label: `Improvements${result.improvements?.length ? ` (${result.improvements.length})` : ""}` },
                { id: "nextSteps", label: "Next Steps" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors ${
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
                      className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm transition-colors hover:bg-slate-700"
                    >
                      {copied ? (
                        <>
                          <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm transition-colors hover:bg-purple-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download DOCX
                    </button>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100">
                    {result.optimizedResume}
                  </div>
                </div>
              )}

              {activeTab === "keywords" && (
                <div>
                  <p className="mb-4 text-sm text-slate-400">
                    These ATS keywords were added or emphasized in your resume to help you pass automated screening.
                  </p>
                  {result.keywordsAdded && result.keywordsAdded.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.keywordsAdded.map((keyword, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-300 ring-1 ring-purple-500/30"
                        >
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
                  <p className="mb-4 text-sm text-slate-400">
                    Key changes made to strengthen your resume.
                  </p>
                  {result.improvements && result.improvements.length > 0 ? (
                    <ul className="space-y-3">
                      {result.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-3 rounded-lg bg-slate-800/50 px-4 py-3">
                          <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-slate-200">{improvement}</span>
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
                  <p className="mb-4 text-sm text-slate-400">
                    Actionable steps to maximize your job search success.
                  </p>
                  {result.nextSteps && result.nextSteps.length > 0 ? (
                    <ul className="space-y-3">
                      {result.nextSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 rounded-lg bg-slate-800/50 px-4 py-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/30 text-sm font-bold text-purple-300">
                            {i + 1}
                          </span>
                          <span className="text-sm text-slate-200">{step}</span>
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

export default function FixPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-950" />}>
      <FixPageContent />
    </Suspense>
  );
}
