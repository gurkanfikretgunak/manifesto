import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('signatures')
      .select(`
        *,
        profiles (
          github_username,
          full_name,
          avatar_url
        )
      `)
      .order('signed_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, location, user_id, privacy_consent } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (privacy_consent === undefined || privacy_consent === null) {
      return NextResponse.json(
        { error: 'Privacy consent is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('signatures')
      .insert([
        {
          user_id,
          message,
          location,
          privacy_consent,
        }
      ])
      .select(`
        *,
        profiles (
          github_username,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create signature' },
      { status: 500 }
    );
  }
}
