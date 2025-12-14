import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    });

    return NextResponse.json({
      id: session.id,
      status: session.status,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      shipping: session.shipping_details,
      amount_total: session.amount_total,
      currency: session.currency,
      line_items: session.line_items?.data,
      metadata: session.metadata,
      payment_status: session.payment_status,
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
