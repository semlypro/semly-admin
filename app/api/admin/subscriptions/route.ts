/**
 * Admin API: Subscriptions Management
 * GET: List all subscriptions
 * POST: Update subscription
 * PATCH: Activate/Deactivate subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: List all subscriptions with filters
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const orgId = searchParams.get('org_id');
    const offset = (page - 1) * limit;

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('subscriptions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('subscription_status', status);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (orgId) {
      query = query.eq('organization_id', orgId);
    }

    const { data: subscriptions, error, count } = await query;

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    // Fetch related user and organization data
    const userIds = [...new Set(subscriptions?.map(s => s.user_id) || [])];
    const orgIds = [...new Set(subscriptions?.map(s => s.organization_id).filter(Boolean) || [])];

    const { data: users } = userIds.length > 0
      ? await supabase.from('users').select('clerk_user_id, email, first_name, last_name').in('clerk_user_id', userIds)
      : { data: [] };

    const { data: orgs } = orgIds.length > 0
      ? await supabase.from('organizations').select('clerk_org_id, name, slug').in('clerk_org_id', orgIds)
      : { data: [] };

    const userMap = new Map(users?.map(u => [u.clerk_user_id, u]) || []);
    const orgMap = new Map(orgs?.map(o => [o.clerk_org_id, o]) || []);

    const subscriptionsWithRelations = subscriptions?.map(sub => ({
      ...sub,
      users: userMap.get(sub.user_id),
      organizations: sub.organization_id ? orgMap.get(sub.organization_id) : null,
    }));

    return NextResponse.json({
      subscriptions: subscriptionsWithRelations || [],
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
    console.error('Error in subscriptions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update subscription
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      id,
      plan_key,
      plan_name,
      subscription_status,
      is_active,
      current_period_start,
      current_period_end,
      amount_cents,
      currency,
      metadata,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const updateData: any = {};
    if (plan_key !== undefined) updateData.plan_key = plan_key;
    if (plan_name !== undefined) updateData.plan_name = plan_name;
    if (subscription_status !== undefined) updateData.subscription_status = subscription_status;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (current_period_start !== undefined) updateData.current_period_start = current_period_start;
    if (current_period_end !== undefined) updateData.current_period_end = current_period_end;
    if (amount_cents !== undefined) updateData.amount_cents = amount_cents;
    if (currency !== undefined) updateData.currency = currency;
    if (metadata !== undefined) updateData.metadata = metadata;

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: data,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Activate or deactivate subscription
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { id, is_active, subscription_status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const updateData: any = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (subscription_status !== undefined) updateData.subscription_status = subscription_status;

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: data,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

