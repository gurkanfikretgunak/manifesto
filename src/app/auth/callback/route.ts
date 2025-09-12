import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';

  console.log('Auth callback - Code:', code, 'Error:', error, 'Description:', errorDescription);

  // If there's an explicit error from GitHub
  if (error) {
    console.error('GitHub OAuth error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`);
  }

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet: any) {
              try {
                cookiesToSet.forEach(({ name, value, options }: any) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
          },
        }
      );

      const { error: supabaseError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!supabaseError) {
        console.log('Auth successful, redirecting to:', next);
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      } else {
        console.error('Supabase auth error:', supabaseError);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=supabase_error&description=${encodeURIComponent(supabaseError.message)}`);
      }
    } catch (err) {
      console.error('Auth callback exception:', err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=callback_exception`);
    }
  }

  // No code parameter found - this might be normal for hash-based auth
  console.log('No code parameter found, redirecting to home (might be hash-based auth)');
  return NextResponse.redirect(`${origin}${next}`);
}
