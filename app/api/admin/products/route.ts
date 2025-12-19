/**
 * Admin Products API
 * GET /api/admin/products - List all products
 * POST /api/admin/products - Create product
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/db/auth';
import { getAllAdminProducts, createProduct, getAllFabrics } from '@/lib/db/admin';

// Force dynamic (no static generation)
export const dynamic = 'force-dynamic';

// Middleware to verify admin authentication
async function requireAdmin(): Promise<{ authenticated: boolean; error?: NextResponse }> {
  const session = await verifyAdminSession();
  if (!session.authenticated) {
    return {
      authenticated: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { authenticated: true };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authenticated) return auth.error!;

  try {
    const { searchParams } = new URL(request.url);
    const includeFabrics = searchParams.get('fabrics') === 'true';

    const products = await getAllAdminProducts();
    
    if (includeFabrics) {
      const fabrics = await getAllFabrics();
      return NextResponse.json({ products, fabrics });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authenticated) return auth.error!;

  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['slug', 'name', 'description', 'shortDescription', 'price', 'stock', 'category'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Sanitize and validate data
    const productData = {
      slug: String(body.slug).trim(),
      name: String(body.name).trim(),
      description: String(body.description).trim(),
      shortDescription: String(body.shortDescription).trim(),
      price: Math.max(0, parseInt(body.price, 10)),
      size: String(body.size || '').trim(),
      stock: Math.max(0, parseInt(body.stock, 10)),
      category: String(body.category).trim(),
      hasLiningOption: Boolean(body.hasLiningOption),
      images: Array.isArray(body.images) ? body.images.map(String) : [],
      outerFabricIds: Array.isArray(body.outerFabricIds) ? body.outerFabricIds.map(Number).filter((n: number) => !isNaN(n)) : [],
      innerFabricIds: Array.isArray(body.innerFabricIds) ? body.innerFabricIds.map(Number).filter((n: number) => !isNaN(n)) : [],
    };

    const result = await createProduct(productData);

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id }, { status: 201 });
    }

    return NextResponse.json(
      { error: result.error || 'Failed to create product' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
