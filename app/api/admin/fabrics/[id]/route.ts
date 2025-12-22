/**
 * Admin Single Fabric API
 * GET /api/admin/fabrics/[id] - Get single fabric
 * PUT /api/admin/fabrics/[id] - Update fabric
 * DELETE /api/admin/fabrics/[id] - Delete fabric
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/db/auth';
import { getFabricById, updateFabric, deleteFabric } from '@/lib/db/admin';

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

  const { id } = await params;
  const fabricId = parseInt(id, 10);

  if (isNaN(fabricId)) {
    return NextResponse.json({ error: 'Invalid fabric ID' }, { status: 400 });
  }

  try {
    const fabric = await getFabricById(fabricId);

    if (!fabric) {
      return NextResponse.json({ error: 'Fabric not found' }, { status: 404 });
    }

    return NextResponse.json({ fabric });
  } catch (error) {
    console.error('Get fabric error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fabric' },
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

  const { id } = await params;
  const fabricId = parseInt(id, 10);

  if (isNaN(fabricId)) {
    return NextResponse.json({ error: 'Invalid fabric ID' }, { status: 400 });
  }

  try {
    const body = await request.json();

    const updateData: any = {};

    if (body.name !== undefined) {
      updateData.name = String(body.name).trim();
    }
    if (body.slug !== undefined) {
      updateData.slug = String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }
    if (body.imageUrl !== undefined) {
      updateData.imageUrl = String(body.imageUrl).trim();
    }
    if (body.type !== undefined) {
      if (!['outer', 'inner'].includes(body.type)) {
        return NextResponse.json(
          { error: 'Type must be "outer" or "inner"' },
          { status: 400 }
        );
      }
      updateData.type = body.type;
    }
    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    const result = await updateFabric(fabricId, updateData);

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error || 'Failed to update fabric' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update fabric error:', error);
    return NextResponse.json(
      { error: 'Failed to update fabric' },
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

  const { id } = await params;
  const fabricId = parseInt(id, 10);

  if (isNaN(fabricId)) {
    return NextResponse.json({ error: 'Invalid fabric ID' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    const result = await deleteFabric(fabricId, hard);

    if (result.success) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error || 'Failed to delete fabric' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete fabric error:', error);
    return NextResponse.json(
      { error: 'Failed to delete fabric' },
      { status: 500 }
    );
  }
}
