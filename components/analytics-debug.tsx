'use client';

import { useEffect } from 'react';

export function AnalyticsDebug() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Google Analytics Debug Mode Enabled');
      console.log('📊 GA Measurement ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
      console.log('🌍 Environment:', process.env.NODE_ENV);
      
      // Check if the measurement ID is loaded
      if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        console.log('✅ GA Environment Variable Loaded Successfully');
      } else {
        console.error('❌ GA Environment Variable NOT FOUND - Check your .env.local file');
      }
      
      // Check if gtag is available (after GA loads)
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          console.log('✅ Google Analytics gtag loaded successfully');
        } else {
          console.warn('⚠️  gtag not found - GA may still be loading');
        }
      }, 2000);
    }
  }, []);

  // This component doesn't render anything visible
  return null;
} 