import { NextResponse } from 'next/server';
import { getAllProducts, outerFabrics, innerFabrics } from '@/lib/products';

/**
 * GET /api/products
 * Returns all hardcoded products for client-side use
 * This endpoint is used by the cart and other client components
 */
export async function GET() {
  try {
    const products = getAllProducts();

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
