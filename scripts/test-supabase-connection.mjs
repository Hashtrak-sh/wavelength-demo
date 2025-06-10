import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase environment variables are not set!')
  console.log('Please make sure you have set:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('Supabase URL:', supabaseUrl)
console.log('Attempting to connect to Supabase...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    const { data, error } = await supabase.from('chat_sessions').select('count').limit(1)
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message)
      process.exit(1)
    }
    
    console.log('Successfully connected to Supabase!')
    console.log('Database connection test passed ✅')
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

testConnection() 