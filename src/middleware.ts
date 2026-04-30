import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    // biome-ignore lint/style/noNonNullAssertion: These environment variables are required for the application to function correctly, and their absence would indicate a misconfiguration that should be addressed during development or deployment.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint/style/noNonNullAssertion: These environment variables are required for the application to function correctly, and their absence would indicate a misconfiguration that should be addressed during development or deployment.
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // biome-ignore lint/suspicious/useIterableCallbackReturn: this callback is used for its side effects (setting cookies on the request object) rather than for its return value, which is a valid use case in this context.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // biome-ignore lint/suspicious/useIterableCallbackReturn: this callback is used for its side effects (setting cookies on the request object) rather than for its return value, which is a valid use case in this context.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
