import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Run cleanup function
    const { error } = await supabase.rpc('cleanup_failed_checkouts');
    
    if (error) {
      console.error('Cleanup error:', error);
      return NextResponse.json(
        { error: 'Cleanup failed: ' + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Failed checkouts cleaned up successfully' 
    });
    
  } catch (error: any) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
