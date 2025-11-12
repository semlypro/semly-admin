/**
 * API endpoint to manage merchant GST configuration
 * 
 * This is an admin-only endpoint to configure the merchant's GST details
 * that will be used on all invoices.
 * 
 * GET: Retrieve merchant GST config
 * POST: Create/update merchant GST config
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { validateGSTIN, INDIAN_STATES } from '@/lib/gst-utils';

// Helper to check if user is admin (you can customize this)
async function isUserAdmin(userId: string): Promise<boolean> {
  // TODO: Implement your admin check logic here
  // For now, this is a placeholder that always returns true
  // You might want to check against a list of admin user IDs or roles
  
  const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];
  return ADMIN_USER_IDS.includes(userId);
}

// GET: Retrieve merchant GST configuration
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    if (!(await isUserAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('merchant_gst_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({
        merchantConfig: null,
        message: 'No merchant GST configuration found',
      });
    }

    return NextResponse.json({
      merchantConfig: {
        id: data.id,
        merchantGstin: data.merchant_gstin,
        legalName: data.legal_name,
        tradeName: data.trade_name,
        merchantState: data.merchant_state,
        addressLine1: data.address_line1,
        addressLine2: data.address_line2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        defaultSacCode: data.default_sac_code,
        defaultGstRate: data.default_gst_rate,
        isActive: data.is_active,
      },
    });
  } catch (error: any) {
    console.error('Error fetching merchant GST config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create or update merchant GST configuration
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    if (!(await isUserAdmin(userId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      merchantGstin,
      legalName,
      tradeName,
      merchantState,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country = 'IN',
      defaultSacCode = '998314', // SaaS service code
      defaultGstRate = 18.00,
    } = body;

    // Validate required fields
    if (!merchantGstin || !legalName || !merchantState || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate GSTIN
    if (!validateGSTIN(merchantGstin)) {
      return NextResponse.json(
        { error: 'Invalid merchant GSTIN format' },
        { status: 400 }
      );
    }

    // Validate state code
    if (!INDIAN_STATES[merchantState as keyof typeof INDIAN_STATES]) {
      return NextResponse.json(
        { error: 'Invalid merchant state code' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Deactivate all existing configs
    await supabase
      .from('merchant_gst_config')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new config
    const { data, error } = await supabase
      .from('merchant_gst_config')
      .insert({
        merchant_gstin: merchantGstin,
        legal_name: legalName,
        trade_name: tradeName,
        merchant_state: merchantState,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        state,
        pincode,
        country,
        default_sac_code: defaultSacCode,
        default_gst_rate: defaultGstRate,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating merchant GST config:', error);
      return NextResponse.json(
        { error: 'Failed to create merchant GST configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Merchant GST configuration updated successfully',
      merchantConfig: {
        id: data.id,
        merchantGstin: data.merchant_gstin,
        legalName: data.legal_name,
      },
    });
  } catch (error: any) {
    console.error('Error updating merchant GST config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}







