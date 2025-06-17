'use client';

import { useState, useEffect } from 'react';
import { ChatMessage, chatApi, getOrCreateSessionId } from '@/lib/supabase';

export default function AnonymousChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (sessionId) {
      loadChatHistory(sessionId);
    }
  }, []);

  const loadChatHistory = async (sessionId: string) => {
    try {
      const { data, error } = await chatApi.getChatHistory(sessionId);
      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    setLoading(true);
    try {
      // Save user message
      const { data: userData, error: userError } = await chatApi.saveMessage({
        session_id: sessionId,
        message: newMessage,
        role: 'user'
      });

      if (userError) throw userError;
      if (userData) {
        setMessages(prev => [...prev, userData]);
        setNewMessage('');
      }

      // Here you can add AI response logic if needed
      // For now, we'll just save a simple response
      const { data: assistantData, error: assistantError } = await chatApi.saveMessage({
        session_id: sessionId,
        message: `Received your message: "${newMessage}"`,
        role: 'assistant'
      });

      if (assistantError) throw assistantError;
      if (assistantData) {
        setMessages(prev => [...prev, assistantData]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto p-4 border rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
} 