/**
 * Admin Check API
 * Used by AdminGuard to verify admin access
 */

import { NextRequest, NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/admin-utils';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isUserAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { isAdmin: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isAdmin: true,
    });
  } catch (error) {
    return NextResponse.json(
      { isAdmin: false },
      { status: 500 }
    );
  }
}







