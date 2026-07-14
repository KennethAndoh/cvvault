import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('profiles').select('*');
  return NextResponse.json({ data, error, timestamp: Date.now() });
}
