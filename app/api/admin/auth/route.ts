/**
 * Admin Authentication API
 * POST /api/admin/auth - Login
 * DELETE /api/admin/auth - Logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin, logoutAdmin, verifyAdminSession } from '@/lib/db/auth';

// Force dynamic (no static generation)
export const dynamic = 'force-dynamic';

// Rate limiting map (in production, use Redis or similar)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOCKOUT_DURATION });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter) }
        }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Sanitize username
    const sanitizedUsername = username.toString().trim().toLowerCase();

    // Attempt login
    const result = await loginAdmin(sanitizedUsername, password);

    if (result.success) {
      // Clear rate limit on successful login
      clearRateLimit(ip);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: result.error || 'Login failed' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await logoutAdmin();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await verifyAdminSession();
    
    if (session.authenticated) {
      return NextResponse.json({
        authenticated: true,
        username: session.username,
      });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
