import { supabase } from './supabase'
import type { Database } from './supabase-types'
import type { Message } from './supabase-types'

export async function createChatSession(userId: string, title: string | null = null) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, title })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChatSessions(userId: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getChatMessages(chatSessionId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_session_id', chatSessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function addMessage(message: Omit<Message, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateChatSession(sessionId: string, updates: { title?: string }) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteChatSession(sessionId: string) {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) throw error
} 