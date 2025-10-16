import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gpfesrlqguapdnvgpjrv.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZmVzcmxxZ3VhcGRudmdwanJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY1NDU1MywiZXhwIjoyMDczMjMwNTUzfQ.qtcvSRxsQFRR_3b_wrawItXYSlXPxzn1nMFDnVmFp_c'

export const supabase = createClient(supabaseUrl, supabaseServiceKey)