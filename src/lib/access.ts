import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export interface SessionAccess {
  paid: boolean;
  plan: string | null;
  credits: number;
  used: number;
  remaining: number;
  paymentIntentId: string | null;
}

/**
 * Verify a Stripe Checkout Session and return its access/credit state.
 * Stripe is the source of truth: credits and usage are stored in the
 * PaymentIntent metadata (set at checkout creation).
 */
export async function getSessionAccess(sessionId: string): Promise<SessionAccess> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  const paid = session.payment_status === "paid";
  const pi = (session.payment_intent as Stripe.PaymentIntent | null) ?? null;

  const plan = pi?.metadata?.plan ?? session.metadata?.plan ?? null;
  const credits =
    parseInt(pi?.metadata?.credits ?? session.metadata?.credits ?? "0", 10) || 0;
  const used = parseInt(pi?.metadata?.used ?? "0", 10) || 0;

  return {
    paid,
    plan,
    credits,
    used,
    remaining: Math.max(0, credits - used),
    paymentIntentId: pi?.id ?? null,
  };
}

/**
 * Consume one credit by incrementing the `used` counter on the PaymentIntent.
 * Stripe merges metadata on update, so other keys (plan, credits) are preserved.
 */
export async function consumeCredit(
  paymentIntentId: string,
  currentUsed: number
): Promise<void> {
  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: { used: String(currentUsed + 1) },
  });
}
