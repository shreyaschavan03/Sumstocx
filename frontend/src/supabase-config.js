import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gpfesrlqguapdnvgpjrv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZmVzcmxxZ3VhcGRudmdwanJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTQ1NTMsImV4cCI6MjA3MzIzMDU1M30.ZPU5OYw4cSXl-rrkP5yyiO6s9vy-pbEoUdCrEG6CLWU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})