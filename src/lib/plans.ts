export interface Plan {
  id: string;
  name: string;
  amount: number; // price in cents (USD)
  credits: number; // number of resume optimizations granted
  description: string;
}

// Single source of truth for plans, prices, and credit allowances.
export const PLANS: Record<string, Plan> = {
  quick: {
    id: "quick",
    name: "Quick Fix",
    amount: 1900,
    credits: 1,
    description: "Resume review + ATS optimization + improvement suggestions",
  },
  full: {
    id: "full",
    name: "Full Optimize",
    amount: 4900,
    credits: 3,
    description: "Complete rewrite with ATS optimization and keyword matching",
  },
  career: {
    id: "career",
    name: "Career Package",
    amount: 9900,
    credits: 5,
    description: "Resume + cover letter + LinkedIn optimization",
  },
};

export function getPlan(planId: string | null | undefined): Plan | null {
  if (!planId) return null;
  return PLANS[planId] ?? null;
}
