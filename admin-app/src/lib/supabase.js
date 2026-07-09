import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://whrgguakzszbvuplvyzj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocmdndWFrenN6YnZ1cGx2eXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNzQxNjEsImV4cCI6MjA5ODc1MDE2MX0.xl-bRmBmsT6__UOvzAhTQZRK5DxCja0z3CuHaiGj99I'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)