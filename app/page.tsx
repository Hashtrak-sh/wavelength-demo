"use client"

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { analytics } from '@/lib/analytics';

export default function Home() {
  const router = useRouter();

  const handleChatButtonClick = () => {
    // Track the button click event
    analytics.trackChatStart();
    
    // Navigate to login page instead of chat
    router.push('/login');
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center p-4" style={{ color: '#f5e8d6' }}>
      {/* Desktop Background Image */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <Image
          src="/main-bg.jpg"
          alt="Background"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 0.5%' }}
          priority
          className="opacity-90"
        />
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Mobile Background Image */}
      <div className="absolute inset-0 z-0 block md:hidden">
        <Image
          src="/main-bg-mobile.jpg"
          alt="Mobile Background"
          fill

          style={{ objectFit: 'cover', objectPosition:'59% 40%' }}

          priority
          className="opacity-90"
        />
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0 bg-black/15" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center mt-[10vh] px-4 w-full max-w-4xl mx-auto">
        <h1 
          style={{ fontFamily: 'Poppins, sans-serif', color: '#f5e8d6' }}
          className="text-3xl md:text-4xl font-light mb-6 md:mb-8 text-center drop-shadow-lg">An AI that Set's You Up! 
        </h1>
        <p className="text-lg md:text-2xl italic mb-6 md:mb-8 text-center drop-shadow-md" style={{ color: '#f5e8d6' }}>No swiping, No forms</p>
        <button
          onClick={handleChatButtonClick}
          className="border rounded-full px-5 md:px-6 py-2 md:py-2.5 text-base md:text-lg bg-white/10 backdrop-blur-sm transition-all duration-300 italic mb-6 md:mb-8 drop-shadow-lg hover:bg-white hover:text-black"
          style={{ borderColor: '#f5e8d6', color: '#f5e8d6' }}
        >
          Got 5 mins to chat? 
        </button>

        <div className="relative w-[180px] md:w-[260px] h-[135px] md:h-[175px] drop-shadow-xl">
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
