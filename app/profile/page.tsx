"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, User, MessageCircle, Copy } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Mock summary - set to null initially
const mockSummary = null;

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [shareableLink, setShareableLink] = useState("")
  const [summary, setSummary] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [userName, setUserName] = useState<string>("")
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "Your Wavelength"

  // Function to load summary from localStorage
  const loadSummary = () => {
    const hasSummary = localStorage.getItem('hasSummary') === 'true'
    if (hasSummary) {
      const savedSummary = localStorage.getItem('wavelengthSummary')
      if (savedSummary) {
        setSummary(savedSummary)
      }
    } else {
      setSummary(null)
    }
  }

  // Function to generate or load user ID
  const getUserIdentifier = () => {
    let userId = localStorage.getItem('wavelengthUserId')
    if (!userId) {
      userId = Math.random().toString(36).substring(2, 15)
      localStorage.setItem('wavelengthUserId', userId)
    }
    return userId
  }

  // Function to get or set username
  const getUsername = () => {
    let name = localStorage.getItem('wavelengthUsername')
    if (!name) {
      name = 'Anonymous'
      localStorage.setItem('wavelengthUsername', name)
    }
    return name
  }

  // Function to load chat history from localStorage
  const loadChatHistory = () => {
    const savedMessages = localStorage.getItem('chatMessages')
    if (savedMessages) {
      const messages = JSON.parse(savedMessages)
      // Take only the first 4 messages
      const initialMessages = messages.slice(0, 4)
      setChatHistory(initialMessages)
    }
  }

  useEffect(() => {
    // Initial load
    loadSummary()
    loadChatHistory()

    // Load or set username
    const name = getUsername()
    setUserName(name)

    // Set shareable link
    const userId = getUserIdentifier()
    // Store username with userId
    const storedNames = localStorage.getItem('wavelengthUsernames')
    const names: Record<string, string> = storedNames ? JSON.parse(storedNames) : {}
    names[userId] = name
    localStorage.setItem('wavelengthUsernames', JSON.stringify(names))

    setShareableLink(`${window.location.origin}/share/${userId}`)
  }, [])

  // Effect to handle route changes (when navigating from chat)
  useEffect(() => {
    loadSummary()
    loadChatHistory()
  }, [searchParams])

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink)
    toast({
      title: "Link copied!",
      description: "Shareable profile link copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C]">
      <div className="max-w-4xl mx-auto p-4 space-y-6 pt-24">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold gradient-text text-white">Insights</h1>
          <p className="text-gray-400">Discover insights from your conversations</p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="Your Wavelength" className="data-[state=active]:bg-gray-600">
              <User className="h-4 w-4 mr-2" />
              Your Wavelength
            </TabsTrigger>
            <TabsTrigger value="conversations" className="data-[state=active]:bg-gray-600">
              <MessageCircle className="h-4 w-4 mr-2" />
              Conversations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Your Wavelength" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                {summary ? (
                  <div className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300 leading-relaxed">{summary}</p>
                    </div>
                    <div className="border-t border-gray-800 pt-4 mt-6">
                      <p className="text-gray-300 mb-3">Check your wavelength with others</p>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={shareableLink}
                          readOnly
                          className="flex-1 bg-gray-800 border-gray-700 text-white px-3 py-2 rounded"
                        />
                        <Button onClick={copyShareableLink} className="bg-gray-600 hover:bg-gray-700">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-gray-400 text-lg">Your summary will be displayed here</p>
                    <Button 
                      onClick={() => router.push('/chat')} 
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Start Chatting
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Chat History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-md px-3 py-2 rounded-lg text-sm ${
                          message.role === "user" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-300"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {chatHistory.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No chat history yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
