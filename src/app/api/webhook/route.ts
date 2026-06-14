import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/access";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan;
      const credits = session.metadata?.credits;
      const piId = session.payment_intent as string | null;

      // Grant access: ensure the PaymentIntent carries credit metadata.
      // Idempotent — only initializes if not already set (does not reset usage).
      if (piId && credits) {
        try {
          const pi = await stripe.paymentIntents.retrieve(piId);
          if (!pi.metadata?.credits) {
            await stripe.paymentIntents.update(piId, {
              metadata: { plan: plan ?? "", credits, used: pi.metadata?.used ?? "0" },
            });
          }
        } catch (err) {
          console.error("Failed to initialize credits on PaymentIntent:", err);
        }
      }

      console.log(
        `Payment completed: plan=${plan}, credits=${credits}, session=${session.id}`
      );
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error(`PaymentIntent failed: ${paymentIntent.id}`);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
