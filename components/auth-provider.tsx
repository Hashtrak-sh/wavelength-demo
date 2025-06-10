"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface User {
  id: string
  phone: string
  profileSummary?: string
  chatHistory: ChatMessage[][]
}

interface AuthContextType {
  user: User | null
  login: (phone: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function parseStoredUser(savedUser: string | null): User | null {
  if (!savedUser) return null
  
  try {
    const parsedUser = JSON.parse(savedUser, (key, value) => {
      if (key === "timestamp" && value) {
        return new Date(value)
      }
      return value
    })

    // Ensure chatHistory is properly structured
    if (!parsedUser.chatHistory || !Array.isArray(parsedUser.chatHistory)) {
      parsedUser.chatHistory = [[]]
    } else {
      parsedUser.chatHistory = parsedUser.chatHistory.map((chat: any) => 
        Array.isArray(chat) ? chat : []
      )
    }

    return parsedUser
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem("wavelength-user")
      setUser(parseStoredUser(savedUser))
    }
    setIsInitialized(true)
  }, [])

  const login = async (phone: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      phone,
      chatHistory: [[]]
    }
    setUser(newUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem("wavelength-user", JSON.stringify(newUser))
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("wavelength-user")
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem("wavelength-user", JSON.stringify(updatedUser))
    }
  }

  if (!isInitialized) {
    return null // or a loading spinner
  }

  return <AuthContext.Provider value={{ user, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
