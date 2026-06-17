import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes reachable without a session.
const PUBLIC_PATHS = ['/', '/login']

/**
 * Next.js 16 "proxy" (formerly middleware). Runs on every matched request:
 *  1. Refreshes the Supabase auth session (keeps cookies fresh).
 *  2. Redirects unauthenticated users to /login, and signed-in users away from /login.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims() verifies the JWT locally against the project's asymmetric (ES256)
  // signing keys — no round-trip to the Supabase auth server on every request,
  // while getSession() inside it still refreshes the cookie when the token expires.
  const {
    data: claims,
  } = await supabase.auth.getClaims()
  const user = claims?.claims ?? null

  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.includes(path)

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && path === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Run on everything except static assets and image files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
