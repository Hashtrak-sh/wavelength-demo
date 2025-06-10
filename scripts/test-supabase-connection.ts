import { supabase } from '../lib/supabase'

async function testConnection() {
  try {
    const { data, error } = await supabase.from('chat_sessions').select('count').limit(1)
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message)
      return
    }
    
    console.log('Successfully connected to Supabase!')
    console.log('Database connection test passed ✅')
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection() 