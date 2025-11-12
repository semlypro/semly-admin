// Admin API: Check User Subscription Status
// Run this to check any user's subscription status

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        found: false,
        email,
        message: 'User not found',
      });
    }

    // Get subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.clerk_user_id)
      .order('created_at', { ascending: false });

    // Get active subscription
    const activeSubscription = subscriptions?.find(s => s.is_active === true);

    return NextResponse.json({
      found: true,
      email: user.email,
      userId: user.clerk_user_id,
      hasSubscription: !!activeSubscription,
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        planKey: activeSubscription.plan_key,
        planName: activeSubscription.plan_name,
        razorpaySubscriptionId: activeSubscription.razorpay_subscription_id,
        status: activeSubscription.status,
        subscriptionStatus: activeSubscription.subscription_status,
        isActive: activeSubscription.is_active,
        currency: activeSubscription.currency,
        amountCents: activeSubscription.amount_cents,
        createdAt: activeSubscription.created_at,
      } : null,
      totalSubscriptions: subscriptions?.length || 0,
      allSubscriptions: subscriptions?.map(s => ({
        id: s.id,
        planKey: s.plan_key,
        status: s.status,
        isActive: s.is_active,
        createdAt: s.created_at,
      })),
    });

  } catch (error: any) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
