"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SavedOptimization {
  id: string;
  fileName: string | null;
  jobDescription: string | null;
  optimizedResume: string;
  keywordsAdded: string[];
  improvements: string[];
  createdAt: string;
}

export const STORAGE_KEY = "ai_resume_history";

export default function DashboardPage() {
  const [history, setHistory] = useState<SavedOptimization[]>([]);
  const [selected, setSelected] = useState<SavedOptimization | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  function deleteEntry(id: string) {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
  }

  function clearAll() {
    if (!confirm("Delete all saved resumes? This cannot be undone.")) return;
    setHistory([]);
    setSelected(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(text: string, fileName: string) {
    try {
      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Download failed. Please copy and paste manually.");
    }
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Resumes</h1>
            <p className="mt-1 text-slate-400">
              {history.length > 0
                ? `${history.length} optimization${history.length === 1 ? "" : "s"} saved in this browser`
                : "Your optimization history will appear here"}
            </p>
          </div>
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={clearAll}
                className="rounded-xl border border-red-800 bg-red-900/20 px-3 py-2 text-sm text-red-400 hover:bg-red-900/40"
              >
                Clear All
              </button>
            )}
            <Link
              href="/fix"
              className="rounded-xl bg-purple-500 px-4 py-2 font-semibold text-white hover:bg-purple-400"
            >
              + New Resume
            </Link>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">No resumes yet</h2>
            <p className="mt-2 text-slate-400">
              Optimize your first resume and it will be saved here automatically.
            </p>
            <Link
              href="/fix"
              className="mt-6 inline-block rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white hover:bg-purple-400"
            >
              Fix My First Resume
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* Sidebar list */}
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`group cursor-pointer rounded-xl border p-4 transition-all ${
                    selected?.id === item.id
                      ? "border-purple-500 bg-slate-800"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">
                        {item.fileName ?? "Pasted Resume"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {item.jobDescription && (
                        <p className="mt-1.5 truncate text-xs text-purple-400">
                          Targeted: {item.jobDescription.slice(0, 40)}...
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntry(item.id);
                      }}
                      className="flex-shrink-0 rounded p-1 text-slate-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {item.keywordsAdded.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.keywordsAdded.slice(0, 3).map((kw, i) => (
                        <span key={i} className="rounded-full bg-purple-500/15 px-2 py-0.5 text-xs text-purple-400">
                          {kw}
                        </span>
                      ))}
                      {item.keywordsAdded.length > 3 && (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
                          +{item.keywordsAdded.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selected ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                  <div>
                    <h2 className="font-semibold">{selected.fileName ?? "Pasted Resume"}</h2>
                    <p className="text-xs text-slate-500">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(selected.optimizedResume)}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-700"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(
                          selected.optimizedResume,
                          `${(selected.fileName ?? "resume").replace(/\.[^.]+$/, "")}-optimized.docx`
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs hover:bg-purple-500"
                    >
                      Download DOCX
                    </button>
                  </div>
                </div>
                <div className="max-h-[70vh] overflow-y-auto p-6">
                  {selected.improvements.length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-semibold text-slate-300">Improvements Made</h3>
                      <ul className="space-y-1.5">
                        {selected.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100">
                    {selected.optimizedResume}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center text-slate-500">
                Select a resume from the list to view it
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
