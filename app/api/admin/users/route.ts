/**
 * Admin API: Users Management
 * GET: List all users
 * POST: Create/Update user
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { rateLimitMiddleware } from '@/lib/rate-limiting';
import { sanitizeHTML, validateEmail } from '@/lib/sanitization';
import { logSecurityEvent, SecurityEventType, getRequestMetadata } from '@/lib/security-logger';
import { auth } from '@clerk/nextjs/server';

// GET: List all users with pagination
export async function GET(req: NextRequest) {
  try {
    // OWASP #4: Rate limiting for admin routes (100 requests per minute)
    const rateLimitResult = rateLimitMiddleware(req, 100, 60000);
    if (rateLimitResult) return rateLimitResult;

    const { userId } = await auth();
    await requireAdmin();

    // OWASP #9: Log admin action
    logSecurityEvent({
      type: SecurityEventType.ADMIN_ACTION,
      userId: userId || 'unknown',
      ...getRequestMetadata(req),
      timestamp: new Date(),
      details: { action: 'list_users' },
    });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get subscription counts for each user
    const userIds = users?.map(u => u.clerk_user_id) || [];
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id, is_active')
      .in('user_id', userIds);

    const subscriptionCounts = subscriptions?.reduce((acc, sub) => {
      acc[sub.user_id] = (acc[sub.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const activeSubscriptionCounts = subscriptions?.reduce((acc, sub) => {
      if (sub.is_active) {
        acc[sub.user_id] = (acc[sub.user_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const usersWithStats = users?.map(user => ({
      ...user,
      subscriptionCount: subscriptionCounts[user.clerk_user_id] || 0,
      activeSubscriptionCount: activeSubscriptionCounts[user.clerk_user_id] || 0,
    }));

    return NextResponse.json({
      users: usersWithStats || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update user
export async function POST(req: NextRequest) {
  try {
    // OWASP #4: Rate limiting
    const rateLimitResult = rateLimitMiddleware(req, 50, 60000);
    if (rateLimitResult) return rateLimitResult;

    const { userId } = await auth();
    await requireAdmin();

    const body = await req.json();
    let { clerk_user_id, email, first_name, last_name, avatar_url } = body;

    if (!clerk_user_id) {
      return NextResponse.json(
        { error: 'clerk_user_id is required' },
        { status: 400 }
      );
    }

    // OWASP #3: Sanitize inputs to prevent XSS
    if (email && !validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (first_name) first_name = sanitizeHTML(first_name);
    if (last_name) last_name = sanitizeHTML(last_name);
    if (avatar_url) avatar_url = sanitizeHTML(avatar_url);

    // OWASP #9: Log admin action
    logSecurityEvent({
      type: SecurityEventType.ADMIN_ACTION,
      userId: userId || 'unknown',
      ...getRequestMetadata(req),
      timestamp: new Date(),
      details: { action: 'update_user', target_user: clerk_user_id },
    });

    const supabase = createServerSupabaseClient();

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('clerk_user_id', clerk_user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete user (soft delete - just mark as deleted if needed)
export async function DELETE(req: NextRequest) {
  try {
    // OWASP #4: Rate limiting
    const rateLimitResult = rateLimitMiddleware(req, 20, 60000);
    if (rateLimitResult) return rateLimitResult;

    const { userId } = await auth();
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const clerk_user_id = searchParams.get('clerk_user_id');

    if (!clerk_user_id) {
      return NextResponse.json(
        { error: 'clerk_user_id is required' },
        { status: 400 }
      );
    }

    // OWASP #9: Log admin action (critical - user deletion)
    logSecurityEvent({
      type: SecurityEventType.ADMIN_ACTION,
      userId: userId || 'unknown',
      ...getRequestMetadata(req),
      timestamp: new Date(),
      details: { action: 'delete_user', target_user: clerk_user_id, severity: 'critical' },
    });

    // Note: This is a destructive operation
    // In production, you might want to implement soft deletes
    const supabase = createServerSupabaseClient();

    // Check if user has active subscriptions
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', clerk_user_id)
      .eq('is_active', true)
      .limit(1);

    if (activeSubs && activeSubs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with active subscriptions' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('clerk_user_id', clerk_user_id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







