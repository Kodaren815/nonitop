/**
 * Admin Fabrics API
 * GET /api/admin/fabrics - List all fabrics
 * POST /api/admin/fabrics - Create fabric
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/db/auth';
import { getAllFabrics, createFabric } from '@/lib/db/admin';

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

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authenticated) return auth.error!;

  try {
    const fabrics = await getAllFabrics();
    return NextResponse.json({ fabrics });
  } catch (error) {
    console.error('Get fabrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fabrics' },
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
    const requiredFields = ['slug', 'name', 'type'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate type
    if (!['outer', 'inner'].includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be "outer" or "inner"' },
        { status: 400 }
      );
    }

    // Sanitize and validate data
    const fabricData = {
      slug: String(body.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: String(body.name).trim(),
      imageUrl: String(body.imageUrl || '').trim(),
      type: body.type as 'outer' | 'inner',
    };

    const result = await createFabric(fabricData);

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id }, { status: 201 });
    }

    return NextResponse.json(
      { error: result.error || 'Failed to create fabric' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create fabric error:', error);
    return NextResponse.json(
      { error: 'Failed to create fabric' },
      { status: 500 }
    );
  }
}
