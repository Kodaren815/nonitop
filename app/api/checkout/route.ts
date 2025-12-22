import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  getProductBySlug, 
  getOuterFabrics, 
  getInnerFabrics,
  validateProductSelection 
} from '@/lib/db/products';

// Force dynamic (no static generation)
export const dynamic = 'force-dynamic';

// Input validation constants
const MAX_ITEMS = 20;
const MAX_QUANTITY = 10;
const MAX_STRING_LENGTH = 50;
const MAX_NOTES_LENGTH = 500;

interface CheckoutItem {
  productId: string;
  quantity: number;
  selectedFabric: string;
  selectedLining?: string;
  notes?: string;
}

/**
 * Sanitize string input - removes HTML tags and limits length
 * Security: Prevents XSS and buffer overflow attacks
 */
function sanitizeString(input: unknown, maxLength: number = MAX_STRING_LENGTH): string | null {
  if (typeof input !== 'string') return null;
  
  // Remove any HTML/script tags
  const sanitized = input.replace(/<[^>]*>/g, '').trim();
  
  // Check length
  if (sanitized.length === 0 || sanitized.length > maxLength) return null;
  
  // Only allow alphanumeric, hyphens, and underscores
  if (!/^[a-zA-Z0-9\-_åäöÅÄÖ]+$/.test(sanitized)) return null;
  
  return sanitized;
}

/**
 * Sanitize notes/text input - allows more characters but still prevents XSS
 * Security: Removes dangerous HTML/script tags while allowing normal text
 */
function sanitizeNotes(input: unknown, maxLength: number = MAX_NOTES_LENGTH): string | null {
  if (typeof input !== 'string') return null;
  
  // Remove any HTML/script tags
  const sanitized = input.replace(/<[^>]*>/g, '').trim();
  
  // Check length (allow empty notes)
  if (sanitized.length > maxLength) return null;
  
  return sanitized || null;
}

/**
 * Validate checkout item structure and values
 * Security: Ensures only valid data structures are processed
 */
function validateCheckoutItem(item: unknown): CheckoutItem | null {
  if (typeof item !== 'object' || item === null) return null;
  
  const obj = item as Record<string, unknown>;
  
  const productId = sanitizeString(obj.productId);
  const selectedFabric = sanitizeString(obj.selectedFabric);
  const quantity = typeof obj.quantity === 'number' ? Math.floor(obj.quantity) : null;
  const selectedLining = obj.selectedLining ? sanitizeString(obj.selectedLining) : undefined;
  const notes = obj.notes ? sanitizeNotes(obj.notes) : undefined;
  
  // Validate required fields
  if (!productId || !selectedFabric || !quantity) return null;
  if (quantity < 1 || quantity > MAX_QUANTITY) return null;
  
  return {
    productId,
    quantity,
    selectedFabric,
    selectedLining: selectedLining || undefined,
    notes: notes || undefined,
  };
}

export async function POST(request: NextRequest) {
  // Initialize Stripe inside handler to keep it server-side
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Security: Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    // Parse JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate body structure
    if (typeof body !== 'object' || body === null || !Array.isArray((body as { items?: unknown }).items)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const rawItems = (body as { items: unknown[] }).items;

    // Validate item count
    if (rawItems.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }
    
    if (rawItems.length > MAX_ITEMS) {
      return NextResponse.json(
        { error: `Too many items (max ${MAX_ITEMS})` },
        { status: 400 }
      );
    }

    // Validate and sanitize each item
    const validatedItems: CheckoutItem[] = [];
    for (const rawItem of rawItems) {
      const validatedItem = validateCheckoutItem(rawItem);
      if (!validatedItem) {
        return NextResponse.json(
          { error: 'Invalid item in cart' },
          { status: 400 }
        );
      }
      validatedItems.push(validatedItem);
    }

    // Get fabrics from database for validation
    const [outerFabrics, innerFabrics] = await Promise.all([
      getOuterFabrics(),
      getInnerFabrics(),
    ]);

    // Build line items for Stripe Checkout
    // Security: All prices come from server-side database data, not client
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderMetadata: Record<string, string> = {};

    for (let index = 0; index < validatedItems.length; index++) {
      const item = validatedItems[index];
      
      // Security: Validate product exists in database
      const product = await getProductBySlug(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Invalid product: ${item.productId}` },
          { status: 400 }
        );
      }

      // Security: Validate fabric exists and is available for this product
      const fabric = outerFabrics.find(f => 
        f.id === item.selectedFabric && product.availableFabrics.includes(f.id)
      );
      if (!fabric) {
        return NextResponse.json(
          { error: `Invalid fabric selection for ${product.name}` },
          { status: 400 }
        );
      }

      // Validate lining if product has lining option
      let lining = null;
      if (item.selectedLining) {
        if (!product.hasLiningOption) {
          return NextResponse.json(
            { error: `Product ${product.name} does not have lining option` },
            { status: 400 }
          );
        }
        lining = innerFabrics.find(f => f.id === item.selectedLining);
        if (!lining) {
          return NextResponse.json(
            { error: 'Invalid lining selection' },
            { status: 400 }
          );
        }
      }

      // Build description with fabric choices and notes
      let description = `Tyg: ${fabric.name}`;
      if (lining) {
        description += ` | Foder: ${lining.name}`;
      }
      if (item.notes) {
        description += ` | Önskemål: ${item.notes}`;
      }

      // Security: Price comes from server-side database data, not client input
      lineItems.push({
        price_data: {
          currency: 'sek',
          product_data: {
            name: product.name,
            description,
            metadata: {
              productId: product.id,
              fabric: fabric.id,
              fabricName: fabric.name,
              lining: lining?.id || '',
              liningName: lining?.name || '',
              customerNotes: item.notes || '',
            },
          },
          unit_amount: Math.round(product.price * 100), // Convert to öre
        },
        quantity: item.quantity,
      });

      // Build metadata for order tracking
      orderMetadata[`item_${index}_product`] = product.name;
      orderMetadata[`item_${index}_productSlug`] = product.slug;
      orderMetadata[`item_${index}_fabric`] = fabric.name;
      if (lining) {
        orderMetadata[`item_${index}_lining`] = lining.name;
      }
      orderMetadata[`item_${index}_quantity`] = String(item.quantity);
      if (item.notes) {
        orderMetadata[`item_${index}_notes`] = item.notes;
      }
    }

    // Calculate total for free shipping check from line items
    const subtotal = lineItems.reduce((total, item) => {
      const unitAmount = item.price_data?.unit_amount || 0;
      const quantity = item.quantity || 1;
      return total + unitAmount * quantity;
    }, 0) / 100; // Convert from öre to SEK

    // Build shipping options
    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 4900, // 49 SEK
            currency: 'sek',
          },
          display_name: 'Standard frakt',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      },
    ];

    // Add free shipping option if subtotal >= 500 SEK
    if (subtotal >= 500) {
      shippingOptions.unshift({
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 0,
            currency: 'sek',
          },
          display_name: 'Fri frakt',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      });
    }

    // Validate site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error('NEXT_PUBLIC_SITE_URL not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'klarna'],
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['SE', 'NO', 'DK', 'FI'],
      },
      shipping_options: shippingOptions,
      metadata: orderMetadata,
      success_url: `${siteUrl}/bekraftelse?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/produkter`,
      locale: 'sv',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    
    // Security: Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
