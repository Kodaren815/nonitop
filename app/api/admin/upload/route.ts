import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/db/auth';
import { getStore } from '@netlify/blobs';

// Force dynamic (no static generation)
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/upload
 * Upload an image file to Netlify Blobs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${folder}/${timestamp}-${randomString}.${extension}`;

    // Get Netlify Blobs store
    const store = getStore('images');

    // Convert file to ArrayBuffer and store
    const bytes = await file.arrayBuffer();
    await store.set(filename, new Blob([bytes], { type: file.type }));

    // Return the URL to serve the image
    const url = `/api/images/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
