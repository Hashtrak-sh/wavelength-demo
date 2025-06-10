"use client"

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowUpIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useToast } from "@/hooks/use-toast"

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const TIMEOUT_MS = 15000; // 15 seconds
const MAX_RETRIES = 2;

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm Violet. I help people find their wavelength through simple chats, not boring forms. Want to talk? It'll be fun!"
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([INITIAL_MESSAGE]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dynamic textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get response');
      }

      const data = await response.json();
      console.log('API Response:', data);
      setMessages(prev => [...prev, { role: data.role, content: data.content }]);

      // Check if this is the last message that generates the summary
      if (data.generatesSummary) {
        console.log('Summary generation detected');
        // Make sure we have a summary before proceeding
        if (!data.summary) {
          console.error('Summary was expected but not received');
          return;
        }
        console.log('Saving summary:', data.summary);

        toast({
          title: "Summary Generated!",
          description: "Your wavelength summary is now available.",
          duration: 5000,
        });
        
        // Store the summary in localStorage
        localStorage.setItem('wavelengthSummary', data.summary);
        localStorage.setItem('hasSummary', 'true');

        // Force a reload when navigating to ensure fresh state
        setTimeout(() => {
          console.log('Navigating to profile page...');
          window.location.href = '/profile?tab=Your%20Wavelength';
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to clear chat history
  const clearChat = () => {
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('wavelengthSummary');
    localStorage.removeItem('hasSummary');
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="flex h-screen bg-[#0C0C0C]">
      {/* New Chat Button */}
      <div className="w-16 border-r border-gray-800 flex flex-col items-center pt-4">
        <button
          onClick={clearChat}
          className="p-3 hover:bg-gray-800 rounded-lg transition-colors group"
          title="New Chat"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-6 h-6 text-gray-400 group-hover:text-white"
          >
            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
          </svg>
        </button>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowUpIcon className="h-5 w-5 transform rotate-[-90deg]" />
            </button>
            <h1 className="text-xl font-semibold text-white">Wavelength</h1>
          </div>
        </header>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex items-start space-x-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">W</span>
                </div>
              )}
              <div
                className={`relative max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm">U</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">W</span>
              </div>
              <div className="bg-gray-800 text-white px-4 py-3 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <div className="border-t border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Share your thoughts..."
                className="w-full bg-gray-800 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2.5 text-white p-1.5 rounded-lg 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         enabled:bg-purple-600 enabled:hover:bg-purple-700 transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
