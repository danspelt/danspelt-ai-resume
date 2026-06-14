"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    id: "quick",
    name: "Quick Fix",
    price: "$19",
    description: "Perfect for a fast resume tune-up before applying.",
    features: [
      "AI-powered resume review",
      "ATS keyword optimization",
      "Bullet point improvements",
      "Improvement summary",
      "Copy & download DOCX",
    ],
    cta: "Get Quick Fix",
    popular: false,
  },
  {
    id: "full",
    name: "Full Optimize",
    price: "$49",
    description: "Complete resume rewrite tailored to your target job.",
    features: [
      "Everything in Quick Fix",
      "Full resume rewrite",
      "Job description matching",
      "Professional summary rewrite",
      "Skills section optimization",
      "Next steps coaching",
    ],
    cta: "Get Full Optimize",
    popular: true,
  },
  {
    id: "career",
    name: "Career Package",
    price: "$99",
    description: "Full career toolkit to maximize your job search.",
    features: [
      "Everything in Full Optimize",
      "Cover letter optimization",
      "LinkedIn profile tips",
      "Interview talking points",
      "Priority processing",
      "Email support",
    ],
    cta: "Get Career Package",
    popular: false,
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Simple Pricing</h1>
          <p className="mt-4 text-lg text-slate-300">
            One-time payment. No subscriptions. Get hired faster.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure checkout powered by Stripe
          </div>
        </div>

        {checkoutError && (
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {checkoutError}
          </div>
        )}

        {/* Plans */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                plan.popular
                  ? "border-purple-500 bg-slate-900 shadow-xl shadow-purple-500/10"
                  : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-purple-500 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="mb-1 text-sm text-slate-500">one-time</span>
                </div>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan !== null}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  plan.popular
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25 hover:bg-purple-400"
                    : "border border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Redirecting...
                  </>
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust section */}
        <div className="mt-16 border-t border-slate-800 pt-12">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
                title: "Secure Payment",
                desc: "256-bit SSL encryption. Your card info never touches our servers.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                ),
                title: "Instant Results",
                desc: "AI optimizes your resume in under 60 seconds.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                ),
                title: "Satisfaction Guarantee",
                desc: "Not happy? Contact us within 7 days for a full refund.",
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                  <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Free option callout */}
        <div className="mt-12 rounded-2xl border border-slate-700 bg-slate-900/50 p-6 text-center">
          <p className="text-slate-300">
            Want to try before you buy?{" "}
            <Link href="/fix" className="font-semibold text-purple-400 hover:text-purple-300">
              Use the free optimizer →
            </Link>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Free tier gives you a full optimization — paid plans unlock premium prompts and export options.
          </p>
        </div>
      </div>
    </main>
  );
}
