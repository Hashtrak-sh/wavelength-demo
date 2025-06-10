import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Load environment variables
config({ path: '.env.local' })

console.log('Current working directory:', process.cwd())
console.log('\nChecking .env.local file:')

try {
  const envPath = resolve(process.cwd(), '.env.local')
  const envContents = readFileSync(envPath, 'utf8')
  console.log('\n.env.local contents:')
  console.log(envContents)
} catch (error) {
  console.log('\n❌ Error reading .env.local file:', error.message)
}

console.log('\nEnvironment variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Not set')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set (hidden for security)' : '❌ Not set') 