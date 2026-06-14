import { NextRequest, NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/access";

// Verifies a Stripe Checkout Session and returns remaining credits.
// Used by the /fix page to unlock the optimizer after payment.
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 500 });
  }

  try {
    const access = await getSessionAccess(sessionId);
    return NextResponse.json({
      paid: access.paid,
      plan: access.plan,
      credits: access.credits,
      used: access.used,
      remaining: access.remaining,
    });
  } catch (error) {
    console.error("verify-session error:", error);
    return NextResponse.json(
      { error: "Could not verify this payment session." },
      { status: 400 }
    );
  }
}
