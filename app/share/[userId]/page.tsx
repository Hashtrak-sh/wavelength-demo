"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from 'next/image'

export default function SharedProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [userName, setUserName] = useState<string>("Anonymous")

  useEffect(() => {
    // In a real app, we would fetch the user's name from an API using the userId
    // For now, we'll just use a mock fetch
    const fetchUserName = async () => {
      const storedNames = localStorage.getItem('wavelengthUsernames')
      if (storedNames) {
        const names: Record<string, string> = JSON.parse(storedNames)
        const userId = params.userId as string
        if (names[userId]) {
          setUserName(names[userId])
        }
      }
    }
    fetchUserName()
  }, [params.userId])

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#1C1C1C] text-white p-4">
      <div className="flex flex-col items-center mt-[20vh]">
        <h1 className="text-7xl font-light mb-8">Wavelength</h1>
        <p className="text-3xl text-gray-400 italic mb-8">Only meet people of your wavelength</p>
        <button
          onClick={() => router.push(`/chat?with=${params.userId}`)}
          className="border border-white rounded-full px-8 py-3 text-1xl hover:bg-white hover:text-black transition-colors italic mb-12"
        >
          Check your wavelength with {userName}
        </button>

        <div className="relative w-[300px] h-[200px]">
          <Image
            src="/wavelength-hero.svg"
            alt="Wavelength illustration"
            fill
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>
    </main>
  )
} 
