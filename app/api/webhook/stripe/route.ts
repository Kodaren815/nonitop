import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { deductProductStock } from '@/lib/db/products';

// Disable body parsing - we need raw body for signature verification
export const dynamic = 'force-dynamic';

/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed events to deduct stock after successful payments
 */
export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Only process if payment is successful
        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session);
        }
        break;
      }
      
      case 'checkout.session.async_payment_succeeded': {
        // Handle delayed payment methods (like bank transfers)
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }
      
      default:
        // Log other events for debugging
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment - deduct stock for all items in the order
 */
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  console.log(`Processing successful payment for session: ${session.id}`);
  
  try {
    // Extract product info from session metadata
    const metadata = session.metadata || {};
    
    // Parse the order items from metadata
    // Metadata format: item_0_productSlug, item_0_quantity, item_1_productSlug, etc.
    const itemIndices = new Set<number>();
    
    // Find all item indices from metadata keys
    Object.keys(metadata).forEach(key => {
      const match = key.match(/^item_(\d+)_/);
      if (match) {
        itemIndices.add(parseInt(match[1], 10));
      }
    });
    
    // Process each item
    for (const i of Array.from(itemIndices).sort((a, b) => a - b)) {
      const productSlug = metadata[`item_${i}_productSlug`];
      const quantityStr = metadata[`item_${i}_quantity`];
      const productName = metadata[`item_${i}_product`];
      
      if (!productSlug) {
        console.warn(`Missing productSlug for item ${i} (${productName})`);
        continue;
      }
      
      if (!quantityStr) {
        console.warn(`Missing quantity for item ${i}`);
        continue;
      }
      
      const quantity = parseInt(quantityStr, 10);
      if (isNaN(quantity) || quantity <= 0) {
        console.warn(`Invalid quantity for item ${i}: ${quantityStr}`);
        continue;
      }

      // Deduct stock
      const result = await deductProductStock(productSlug, quantity);
      
      if (result.success) {
        console.log(`Successfully deducted ${quantity} from stock for ${productSlug} (${productName}). New stock: ${result.newStock}`);
      } else {
        console.error(`Failed to deduct stock for ${productSlug} (${productName}): ${result.error}`);
      }
    }
    
    console.log(`Finished processing session ${session.id}`);
  } catch (error) {
    console.error('Error processing successful payment:', error);
    throw error;
  }
}
