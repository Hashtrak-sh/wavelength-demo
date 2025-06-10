export type ChatSession = {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  chat_session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      chat_sessions: {
        Row: ChatSession
        Insert: Omit<ChatSession, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ChatSession, 'id'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id'>>
      }
    }
  }
} 