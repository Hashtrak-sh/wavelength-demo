"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b bg-black border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center bg-black h-16">
          <Link href="/" className="flex items-center">
            <Image 
              src="/wavelength-hero.svg"
              alt="Wavelength Logo"
              width={180}
              height={80}
              className="h-8 md:h-12 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Link href="/chat">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-gray-300 hover:text-white p-1.5 md:p-2 ${pathname === '/chat' ? 'bg-gray-800' : ''}`}
              >
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>

            <NotificationsDropdown />

            <Link href="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-gray-300 hover:text-white p-1.5 md:p-2 ${pathname === '/profile' ? 'bg-gray-800' : ''}`}
              >
                <User className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
