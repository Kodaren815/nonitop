/**
 * Admin Authentication Library
 * Handles secure authentication for admin dashboard
 */

import 'server-only';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';

// Type for the neon query function that returns arrays
type SqlFunction = (strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>;

/**
 * Get SQL instance with error handling
 */
function getSql(): SqlFunction | null {
  const dbUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  
  // Skip if no valid URL - covers build time when URL might not be set or is invalid
  if (!dbUrl || !dbUrl.startsWith('postgres')) {
    return null;
  }
  
  try {
    return neon(dbUrl) as SqlFunction;
  } catch (error) {
    console.warn('Database not available');
    return null;
  }
}

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_HOURS = 24;

/**
 * Generate a secure random session token
 */
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify admin credentials and create session
 */
export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const sql = getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Rate limiting check could be added here
    
    // Find admin user
    const users = await sql`
      SELECT id, password_hash
      FROM admin_users
      WHERE username = ${username}
      LIMIT 1
    `;

    if (users.length === 0) {
      // Use same error message to prevent username enumeration
      return { success: false, error: 'Invalid credentials' };
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

    // Delete any existing sessions for this user
    await sql`
      DELETE FROM admin_sessions
      WHERE user_id = ${user.id}
    `;

    // Create new session
    await sql`
      INSERT INTO admin_sessions (user_id, session_token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `;

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Verify admin session from request
 */
export async function verifyAdminSession(): Promise<{
  authenticated: boolean;
  userId?: number;
  username?: string;
}> {
  const sql = getSql();
  if (!sql) {
    return { authenticated: false };
  }
  
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return { authenticated: false };
    }

    // Find valid session
    const sessions = await sql`
      SELECT s.user_id, u.username
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.session_token = ${sessionToken}
        AND s.expires_at > NOW()
      LIMIT 1
    `;

    if (sessions.length === 0) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      userId: sessions[0].user_id,
      username: sessions[0].username,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { authenticated: false };
  }
}

/**
 * Logout admin and destroy session
 */
export async function logoutAdmin(): Promise<void> {
  const sql = getSql();
  
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken && sql) {
      // Delete session from database
      await sql`
        DELETE FROM admin_sessions
        WHERE session_token = ${sessionToken}
      `;
    }

    // Clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const sql = getSql();
  if (!sql) {
    return { success: false, error: 'Database not available' };
  }
  
  try {
    // Validate new password strength
    if (newPassword.length < 12) {
      return { success: false, error: 'Password must be at least 12 characters' };
    }

    // Get current user
    const users = await sql`
      SELECT password_hash
      FROM admin_users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!validPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await sql`
      UPDATE admin_users
      SET password_hash = ${newHash}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Invalidate all sessions for this user
    await sql`
      DELETE FROM admin_sessions
      WHERE user_id = ${userId}
    `;

    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

/**
 * Clean up expired sessions (can be called periodically)
 */
export async function cleanupExpiredSessions(): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  
  try {
    await sql`
      DELETE FROM admin_sessions
      WHERE expires_at < NOW()
    `;
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}
