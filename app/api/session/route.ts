import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { deductProductStock } from '@/lib/db/products';
import { neon } from '@neondatabase/serverless';

// Track processed sessions to prevent double stock deduction
async function hasSessionBeenProcessed(sessionId: string): Promise<boolean> {
  const dbUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) return false;
  
  try {
    const sql = neon(dbUrl);
    const result = await sql`
      SELECT 1 FROM processed_orders WHERE stripe_session_id = ${sessionId} LIMIT 1
    `;
    return result.length > 0;
  } catch (error) {
    // Table might not exist yet, that's okay
    console.log('Could not check processed orders:', error);
    return false;
  }
}

async function markSessionAsProcessed(sessionId: string): Promise<void> {
  const dbUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) return;
  
  try {
    const sql = neon(dbUrl);
    // Create table if not exists and insert
    await sql`
      CREATE TABLE IF NOT EXISTS processed_orders (
        id SERIAL PRIMARY KEY,
        stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
        processed_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      INSERT INTO processed_orders (stripe_session_id) 
      VALUES (${sessionId}) 
      ON CONFLICT (stripe_session_id) DO NOTHING
    `;
  } catch (error) {
    console.error('Could not mark session as processed:', error);
  }
}

async function processStockDeduction(session: Stripe.Checkout.Session): Promise<void> {
  const metadata = session.metadata || {};
  
  // Find all item indices from metadata keys
  const itemIndices = new Set<number>();
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
    
    if (!productSlug || !quantityStr) {
      console.warn(`Missing data for item ${i}`);
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
      console.log(`✓ Deducted ${quantity} from stock for ${productSlug} (${productName}). New stock: ${result.newStock}`);
    } else {
      console.error(`✗ Failed to deduct stock for ${productSlug} (${productName}): ${result.error}`);
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  // Initialize Stripe inside the handler to ensure it stays server-side
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    });

    // If payment was successful and we haven't processed this session yet, deduct stock
    if (session.payment_status === 'paid') {
      const alreadyProcessed = await hasSessionBeenProcessed(sessionId);
      
      if (!alreadyProcessed) {
        console.log(`Processing stock deduction for session: ${sessionId}`);
        await processStockDeduction(session);
        await markSessionAsProcessed(sessionId);
        console.log(`Finished processing session: ${sessionId}`);
      } else {
        console.log(`Session ${sessionId} already processed, skipping stock deduction`);
      }
    }

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
