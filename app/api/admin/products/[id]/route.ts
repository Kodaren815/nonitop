/**
 * Admin Single Product API
 * GET /api/admin/products/[id] - Get product
 * PUT /api/admin/products/[id] - Update product
 * DELETE /api/admin/products/[id] - Delete product
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/db/auth';
import { getAdminProductById, updateProduct, deleteProduct } from '@/lib/db/admin';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authenticated) return auth.error!;

  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const product = await getAdminProductById(productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authenticated) return auth.error!;

  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = await request.json();

    // Build update data (only include provided fields)
    const updateData: Record<string, unknown> = {};

    if (body.slug !== undefined) updateData.slug = String(body.slug).trim();
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.shortDescription !== undefined) updateData.shortDescription = String(body.shortDescription).trim();
    if (body.price !== undefined) updateData.price = Math.max(0, parseInt(body.price, 10));
    if (body.size !== undefined) updateData.size = String(body.size).trim();
    if (body.stock !== undefined) updateData.stock = Math.max(0, parseInt(body.stock, 10));
    if (body.category !== undefined) updateData.category = String(body.category).trim();
    if (body.hasLiningOption !== undefined) updateData.hasLiningOption = Boolean(body.hasLiningOption);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images.map(String) : [];
    if (body.outerFabricIds !== undefined) updateData.outerFabricIds = Array.isArray(body.outerFabricIds) ? body.outerFabricIds.map(Number).filter((n: number) => !isNaN(n)) : [];
    if (body.innerFabricIds !== undefined) updateData.innerFabricIds = Array.isArray(body.innerFabricIds) ? body.innerFabricIds.map(Number).filter((n: number) => !isNaN(n)) : [];

    const result = await updateProduct(productId, updateData);

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error || 'Failed to update product' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authenticated) return auth.error!;

  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    const result = await deleteProduct(productId, hard);

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error || 'Failed to delete product' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
