import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

// Force dynamic (no static generation)
export const dynamic = 'force-dynamic';

/**
 * GET /api/images/[...path]
 * Serve images from Netlify Blobs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const imagePath = path.join('/');

    // Get image from Netlify Blobs
    const store = getStore('images');
    const imageData = await store.get(imagePath, { type: 'blob' });

    if (!imageData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Determine content type from extension
    const extension = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = contentTypes[extension] || 'image/jpeg';

    // Return the image with proper headers
    const arrayBuffer = await imageData.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
