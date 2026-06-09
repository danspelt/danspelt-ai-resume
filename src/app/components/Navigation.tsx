"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M12 18v-6" />
              <path d="M9 15l3 3 3-3" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">
            AI Resume<span className="text-purple-400">Fixer</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/fix"
            className="text-slate-300 hover:text-white"
          >
            Fix Resume
          </Link>
          <Link
            href="/pricing"
            className="text-slate-300 hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white"
          >
            My Resumes
          </Link>
          <Link
            href="/fix"
            className="rounded-xl bg-purple-500 px-4 py-2 font-semibold text-white hover:bg-purple-400"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-800 bg-slate-900 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/fix"
              className="text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fix Resume
            </Link>
            <Link
              href="/pricing"
              className="text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Resumes
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
