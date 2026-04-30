// src/lib/supabase.ts
/** biome-ignore-all lint/style/noNonNullAssertion: // biome-ignore lint/style/noNonNullAssertion: These environment variables are required for the application to function correctly, and their absence would indicate a misconfiguration that should be addressed during development or deployment. */
/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: // biome-ignore lint/style/noNonNullAssertion: These environment variables are required for the application to function correctly, and their absence would indicate a misconfiguration that should be addressed during development or deployment. */

import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default supabase

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
}