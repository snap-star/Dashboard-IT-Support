/** biome-ignore-all lint/style/noNonNullAssertion: // biome-ignore lint/style/noNonNullAssertion: These environment variables are required for the application to function correctly, and their absence would indicate a misconfiguration that should be addressed during development or deployment. */
/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: // biome-ignore lint/style/noNonNullAssertion: These environment variables are required for the application to function correctly, and their absence would indicate a misconfiguration that should be addressed during development or deployment. */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    },
  )
}
