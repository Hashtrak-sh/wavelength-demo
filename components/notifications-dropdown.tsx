"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  title: string
  message: string
  type: "summary" | "other"
  read: boolean
  timestamp: Date
}

export function NotificationsDropdown() {
  const router = useRouter()
  
  // This would typically come from your state management or API
  const notifications: Notification[] = [
    {
      id: "1",
      title: "Summary Generated",
      message: "Your wavelength summary is now available",
      type: "summary",
      read: false,
      timestamp: new Date()
    }
  ]

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "summary") {
      router.push("/profile?tab=Your+Wavelength")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white">
          <Bell className="h-5 w-5" />
          {notifications.some(n => !n.read) && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-gray-600" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px] bg-gray-900 border-gray-800">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`px-4 py-3 space-y-1 cursor-pointer hover:bg-gray-800 ${
                !notification.read ? "bg-gray-800/50" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-white">{notification.title}</span>
                <span className="text-xs text-gray-400">
                  {new Date(notification.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-300">{notification.message}</p>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-4 py-3 text-sm text-gray-400">No new notifications</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 