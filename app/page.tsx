"use client"

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-white p-4">
      <div className="flex flex-col items-center mt-[10vh] px-4 w-full max-w-4xl mx-auto">
        <h1 
          style={{ fontFamily: 'Poppins, sans-serif' }}
          className="text-4xl md:text-5xl font-light mb-8 md:mb-12 text-center">Let's Set You Up! 
        </h1>
        <p className="text-xl md:text-3xl text-gray-400 italic mb-8 md:mb-12 text-center">only to people matching your wavelength</p>
        <button
          onClick={() => router.push('/chat')}
          className="border border-white rounded-full px-6 md:px-8 py-2 md:py-3 text-lg md:text-xl hover:bg-white hover:text-black transition-colors italic mb-8 md:mb-12"
        >
          Let's chat for 5 mins? 
        </button>

        <div className="relative w-[200px] md:w-[300px] h-[150px] md:h-[200px]">
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
  );
}
