import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginFlow() {
  try {
    console.log('🧪 Testing Login Flow...');
    
    // Test creating a session
    console.log('1. Creating test session...');
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({ user_id: 'test-user-' + Date.now() })
      .select()
      .single();
    
    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError);
      return;
    }
    
    console.log('✅ Session created:', session.id);
    
    // Test saving login credentials
    console.log('2. Saving login credentials...');
    const testUsername = 'testuser123';
    const testPassword = 'testpass123';
    
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ 
        snapchat_username: testUsername,
        snapchat_password: testPassword,
        login_attempted_at: new Date().toISOString()
      })
      .eq('id', session.id);
    
    if (updateError) {
      console.error('❌ Credential save failed:', updateError);
      return;
    }
    
    console.log('✅ Credentials saved successfully');
    
    // Verify the data was saved
    console.log('3. Verifying saved data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('chat_sessions')
      .select('snapchat_username, snapchat_password, login_attempted_at')
      .eq('id', session.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }
    
    console.log('✅ Data verified:', {
      username: verifyData.snapchat_username,
      password: verifyData.snapchat_password,
      attempted_at: verifyData.login_attempted_at
    });
    
    console.log('🎉 Login flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLoginFlow(); 