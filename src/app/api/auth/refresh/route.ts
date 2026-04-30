import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  // getUser() validates the JWT with Supabase Auth server
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Session is valid; Supabase SSR handles token refresh automatically
  // The cookie maxAge will be extended if configured
  return NextResponse.json({ success: true })
}