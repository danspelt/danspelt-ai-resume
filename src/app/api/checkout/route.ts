import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

const PLANS: Record<string, { priceId: string; name: string }> = {
  quick: {
    priceId: process.env.STRIPE_PRICE_QUICK || "",
    name: "Quick Fix",
  },
  full: {
    priceId: process.env.STRIPE_PRICE_FULL || "",
    name: "Full Optimize",
  },
  career: {
    priceId: process.env.STRIPE_PRICE_CAREER || "",
    name: "Career Package",
  },
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const selectedPlan = PLANS[plan];

    // If no price IDs configured, use inline price data for MVP
    const lineItems = selectedPlan.priceId
      ? [{ price: selectedPlan.priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: selectedPlan.name,
                description: getPlanDescription(plan),
              },
              unit_amount: getPlanAmount(plan),
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${appUrl}/fix?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: { plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}

function getPlanAmount(plan: string): number {
  const amounts: Record<string, number> = { quick: 1900, full: 4900, career: 9900 };
  return amounts[plan] ?? 1900;
}

function getPlanDescription(plan: string): string {
  const descriptions: Record<string, string> = {
    quick: "Resume review + ATS optimization + improvement suggestions",
    full: "Complete rewrite with ATS optimization and keyword matching",
    career: "Resume + cover letter + LinkedIn optimization",
  };
  return descriptions[plan] ?? "";
}
