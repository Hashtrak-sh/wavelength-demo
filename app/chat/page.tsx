'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useToast } from "@/hooks/use-toast";
import { chatService } from '@/lib/supabase-service';

const formatMessageContent = (content: string) => {
  // Split content by line breaks first, then handle bold formatting within each line
  return content.split('\n').map((line, lineIndex) => {
    // Handle bold formatting within each line
    const formattedLine = line.split(/(\*\*[^*]+\*\*)/).map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** and wrap in bold span
        const text = part.slice(2, -2);
        return <span key={`${lineIndex}-${partIndex}`} className="font-bold">{text}</span>;
      }
      return part;
    });
    
    // Return each line with proper line break handling
    return (
      <span key={lineIndex}>
        {formattedLine}
        {lineIndex < content.split('\n').length - 1 && <br />}
      </span>
    );
  });
};

type Message = {
  role: 'user' | 'assistant';
  content: string;
  isSummary?: boolean;
  generatesSummary?: boolean;
  summary?: string;
};

type WhatsAppFlowState = 'ask-whatsapp' | 'phone-input' | 'ask-continue' | 'completed';

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hey, Think of me like that friend who actually follows through and sets you up — but I listen better 😉 Let's find someone on your wavelength?"
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [whatsappFlowState, setWhatsappFlowState] = useState<WhatsAppFlowState | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize chat session and load messages
  useEffect(() => {
    const initializeChat = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
        }

        // Get or create a session
        const session = await chatService.getOrCreateSession();
        if (!session?.id) {
          throw new Error('Failed to create or get chat session');
        }
        setSessionId(session.id);

        // Load existing messages or set initial message
        const history = await chatService.getChatHistory(session.id);
        if (history.length > 0) {
          setMessages(history.map(msg => ({
            role: msg.role,
            content: msg.message
          })));
        } else {
          setMessages([INITIAL_MESSAGE]);
          // Save initial message to Supabase
          await chatService.saveMessageWithRetry({
            session_id: session.id,
            message: INITIAL_MESSAGE.content,
            role: INITIAL_MESSAGE.role
          });
        }
      } catch (error: any) {
        console.error('Error initializing chat:', error);
        setError(error.message || 'Failed to initialize chat. Please check your Supabase configuration.');
      }
    };

    initializeChat();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-focus input after API response
  useEffect(() => {
    if (!isLoading && textareaRef.current && (whatsappFlowState === null || whatsappFlowState === 'completed')) {
      // Small delay to ensure the DOM has updated and the input is visible
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isLoading, whatsappFlowState]);

  // Dynamic textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Keyboard detection and handling
  useEffect(() => {
    const handleKeyboard = () => {
      if (typeof window !== 'undefined') {
        // Use visualViewport API if available (modern browsers)
        if (window.visualViewport) {
          const viewport = window.visualViewport;
          const handleViewportChange = () => {
            const newKeyboardHeight = window.innerHeight - viewport.height;
            setKeyboardHeight(Math.max(0, newKeyboardHeight));
            
            // Scroll to bottom when keyboard appears
            if (newKeyboardHeight > 0) {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          };

          viewport.addEventListener('resize', handleViewportChange);
          return () => viewport.removeEventListener('resize', handleViewportChange);
        } else {
          // Fallback for older browsers
          const initialHeight = window.innerHeight;
          
          const handleResize = () => {
            const currentHeight = window.innerHeight;
            const heightDiff = initialHeight - currentHeight;
            setKeyboardHeight(Math.max(0, heightDiff));
            
            if (heightDiff > 100) { // Keyboard is likely open
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          };

          window.addEventListener('resize', handleResize);
          return () => window.removeEventListener('resize', handleResize);
        }
      }
    };

    const cleanup = handleKeyboard();
    return cleanup;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const fetchWithRetry = async (
      url: string,
      options: RequestInit = {},
      retries = 3,
      delay = 1000, // initial delay in ms
      backoffFactor = 2
    ): Promise<Response> => {
      let attempt = 0;
    
      while (attempt <= retries) {
        try {
          const response = await fetch(url, options);
    
          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorBody}`);
          }
    
          return response;
        } catch (error) {
          attempt++;
    
          if (attempt > retries) {
            throw error;
          }
    
          console.warn(`Retrying ${url}... (attempt ${attempt})`);
          await new Promise((res) => setTimeout(res, delay * Math.pow(backoffFactor, attempt - 1)));
        }
      }
    
      throw new Error('Unexpected error in fetchWithRetry');
    };
    

    try {
      // Save user message to Supabase
      await chatService.saveMessageWithRetry({
        session_id: sessionId,
        message: userMessage.content,
        role: userMessage.role
      });

      // Get AI response
      const response = await fetchWithRetry('/api/chat', {
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
      const assistantMessage: Message = { 
        role: data.role, 
        content: data.content,
        generatesSummary: data.generatesSummary,
        summary: data.summary
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to Supabase
      await chatService.saveMessageWithRetry({
        session_id: sessionId,
        message: data.content,
        role: data.role
      });

      // Check if this is the last message that generates the summary
      if (data.generatesSummary && data.summary) {
        await chatService.updateSessionSummary(sessionId, data.summary);
        // Trigger WhatsApp flow
        setWhatsappFlowState('ask-whatsapp');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppYes = () => {
    setWhatsappFlowState('phone-input');
  };

  const handleWhatsAppNo = () => {
    setWhatsappFlowState('ask-continue');
  };

  const handlePhoneSubmit = async () => {
    if (phoneNumber.trim() && sessionId) {
      // Clean and format the phone number for database storage
      const cleanPhoneNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
      
      // Save contact number to chat_sessions table
      try {
        await chatService.updateSessionContactNumber(sessionId, cleanPhoneNumber);
        console.log('Contact number saved to session:', cleanPhoneNumber);
      } catch (error) {
        console.error('Error saving contact number to session:', error);
        // Continue with the flow even if saving fails
      }
      
      // Add user's phone number as a message (keep original format for display)
      const phoneMessage: Message = {
        role: 'user',
        content: `My WhatsApp number is: ${phoneNumber}`
      };
      setMessages(prev => [...prev, phoneMessage]);
      
      // Save phone number message to Supabase
      try {
        await chatService.saveMessageWithRetry({
          session_id: sessionId,
          message: phoneMessage.content,
          role: phoneMessage.role
        });
      } catch (error) {
        console.error('Error saving phone number:', error);
      }
      
      // Add confirmation message
      const confirmMessage: Message = {
        role: 'assistant',
        content: "Great! I've noted your WhatsApp number. Let's continue our conversation!"
      };
      setMessages(prev => [...prev, confirmMessage]);
      
      // Save confirmation message to Supabase
      try {
        await chatService.saveMessageWithRetry({
          session_id: sessionId,
          message: confirmMessage.content,
          role: confirmMessage.role
        });
      } catch (error) {
        console.error('Error saving confirmation message:', error);
      }
      
      setPhoneNumber('');
      setWhatsappFlowState('completed');
    }
  };

  const handleContinueChat = async () => {
    const continueMessage: Message = {
      role: 'assistant',
      content: "No worries! Let's continue our conversation. What else would you like to talk about?"
    };
    setMessages(prev => [...prev, continueMessage]);
    
    // Save continue message to Supabase
    if (sessionId) {
      try {
        await chatService.saveMessageWithRetry({
          session_id: sessionId,
          message: continueMessage.content,
          role: continueMessage.role
        });
      } catch (error) {
        console.error('Error saving continue message:', error);
      }
    }
    
    setWhatsappFlowState('completed');
  };

  const renderSummaryMessage = (message: Message, index: number) => {
    // Default summary message display (no WhatsApp UI here anymore)
    return (
      <div key={index} className="flex items-start space-x-3 mb-4 justify-start">
        <div className="w-7 h-7 rounded-full bg-white flex-shrink-0 flex items-center justify-center">
          <span className="text-black text-xs">wl</span>
        </div>
        <div className="relative max-w-[80%] rounded-2xl px-3 py-2 bg-gray-800 text-white text-sm">
          <div className="overflow-hidden whitespace-pre-wrap">
            {formatMessageContent(message.content)}
          </div>
        </div>
      </div>
    );
  };

  // New function to render WhatsApp modal in place of chat input
  const renderWhatsAppModal = () => {
    if (!whatsappFlowState || whatsappFlowState === 'completed') {
      return null;
    }
    
    if (whatsappFlowState === 'ask-whatsapp') {
      return (
        <div className="border-t border-black p-4 bg-black flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black-800 rounded-xl p-4 text-center">
              <p className="mb-3 text-sm text-white">Basis what we have gathered about you, would you want us to notify about a potential match who matches your wavelength?
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleWhatsAppYes}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={handleWhatsAppNo}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (whatsappFlowState === 'phone-input') {
      return (
        <div className="border-t border-black p-4 bg-black flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black-800 rounded-xl p-4 text-center">
             <p className="mb-3 text-sm text-white">
                Could you share your WhatsApp number for the update? <em>Rest assured we will never spam you!</em>
             </p>
              <div className="flex space-x-2 justify-center">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(+91)1234567890"
                  className="flex-1 max-w-xs px-3 py-2 bg-gray-700 text-white text-base rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  style={{ fontSize: '16px' }}
                  onFocus={() => {
                    // Scroll to bottom when focusing input
                    setTimeout(() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePhoneSubmit();
                    }
                  }}
                />
                <button
                  onClick={handlePhoneSubmit}
                  disabled={!phoneNumber.trim()}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (whatsappFlowState === 'ask-continue') {
      return (
        <div className="border-t border-black p-4 bg-black flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black-800 rounded-xl p-4 text-center">
              <p className="mb-3 text-sm text-white">Would you like to continue chatting?</p>
              <button
                onClick={handleContinueChat}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                Yes, let's continue
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      ref={chatContainerRef}
      className="flex bg-black overflow-x-hidden"
      style={{ 
        height: keyboardHeight > 0 ? `calc(100vh - ${keyboardHeight}px)` : '100vh'
      }}
    >
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
          {messages.map((message, i) => {
            // Check if this is a summary message that should trigger special rendering
            if (message.generatesSummary && whatsappFlowState && whatsappFlowState !== 'completed') {
              return renderSummaryMessage(message, i);
            }
            
            // Regular message rendering
            return (
              <div
                key={i}
                className={`flex items-start space-x-3 mb-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-white flex-shrink-0 flex items-center justify-center">
                    <span className="text-black text-xs">wl</span>
                  </div>
                )}
                <div
                   className={`relative max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words text-sm ${
                    message.role === 'user'
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <div className="overflow-hidden whitespace-pre-wrap">
                    {formatMessageContent(message.content)}
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs">Me</span>
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-black text-xs">wl</span>
              </div>
              <div className="bg-gray-800 text-white px-3 py-2 rounded-2xl">
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
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        {whatsappFlowState && whatsappFlowState !== 'completed' ? (
          renderWhatsAppModal()
        ) : (
          <div className="border-t border-black p-4 bg-black flex-shrink-0">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="relative flex items-center bg-gray-800 rounded-xl">
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
                  onFocus={() => {
                    // Scroll to bottom when focusing input
                    setTimeout(() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                  }}
                  placeholder="Share your thoughts..."
                  className="w-full bg-transparent text-white text-base rounded-xl pl-4 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none max-h-[120px] min-h-[40px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                  style={{ height: '40px', fontSize: '16px' }}
                  rows={1}
                  disabled={isLoading}
                />
                <div className="absolute right-3 flex items-center h-full">
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="flex items-center justify-center text-white p-1.5 rounded-lg
                             disabled:opacity-50 disabled:cursor-not-allowed
                             enabled:bg-purple-600 enabled:hover:bg-purple-700 transition-colors"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
