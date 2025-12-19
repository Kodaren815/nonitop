import { NextResponse } from 'next/server';
import { getAllProducts, getOuterFabrics, getInnerFabrics } from '@/lib/db/products';

// Force dynamic (no static generation)
export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Returns all products from database for client-side use
 * This endpoint is used by the cart and other client components
 */
export async function GET() {
  try {
    const [products, outerFabrics, innerFabrics] = await Promise.all([
      getAllProducts(),
      getOuterFabrics(),
      getInnerFabrics(),
    ]);

    return NextResponse.json({
      success: true,
      products,
      fabrics: {
        outer: outerFabrics,
        inner: innerFabrics,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        products: [],
        fabrics: { outer: [], inner: [] },
      },
      { status: 500 }
    );
  }
}
