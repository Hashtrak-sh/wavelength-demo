import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to generate a session ID if none exists
export const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

// Chat message type
export interface ChatMessage {
  id: string;
  session_id: string;
  message: string;
  role: 'user' | 'assistant';
  created_at: string;
  metadata?: Record<string, any>;
}

// Chat API functions
export const chatApi = {
  // Save a new message
  async saveMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
    return supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();
  },

  // Get chat history for a session
  async getChatHistory(sessionId: string) {
    return supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
  }
}; 