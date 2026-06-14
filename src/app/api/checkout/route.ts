import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/access";
import { getPlan } from "@/lib/plans";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    const selectedPlan = getPlan(plan);

    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const priceId = process.env[`STRIPE_PRICE_${plan.toUpperCase()}`];
    const credits = String(selectedPlan.credits);

    // Use a pre-created Price if configured, otherwise inline price data.
    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: selectedPlan.name,
                description: selectedPlan.description,
              },
              unit_amount: selectedPlan.amount,
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${appUrl}/fix?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: { plan, credits },
      // Credits + usage live on the PaymentIntent metadata (source of truth).
      payment_intent_data: {
        metadata: { plan, credits, used: "0" },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
