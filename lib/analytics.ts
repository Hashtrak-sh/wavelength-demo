// Google Analytics utility functions
import { sendGAEvent } from '@next/third-parties/google';

// Type definitions for custom events
export type AnalyticsEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

// Basic event tracking function
export const trackEvent = ({ action, category, label, value }: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    sendGAEvent({
      event: action,
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Pre-defined event functions (easy to use, can add more later)
export const analytics = {
  // Page tracking (automatic with next/third-parties)
  
  // Chat events (for future use)
  trackChatStart: () => trackEvent({
    action: 'chat_started',
    category: 'engagement'
  }),
  
  trackMessageSent: () => trackEvent({
    action: 'message_sent', 
    category: 'chat'
  }),
  
  trackSummaryGenerated: () => trackEvent({
    action: 'summary_generated',
    category: 'ai_features'
  }),
  
  // WhatsApp flow events (for future use)
  trackWhatsAppFlowStart: () => trackEvent({
    action: 'whatsapp_flow_started',
    category: 'conversion'
  }),
  
  trackPhoneNumberSubmitted: () => trackEvent({
    action: 'phone_submitted',
    category: 'conversion'
  }),
  
  // Profile events (for future use)
  trackProfileView: () => trackEvent({
    action: 'profile_viewed',
    category: 'engagement'
  }),
  
  trackProfileShared: () => trackEvent({
    action: 'profile_shared',
    category: 'sharing'
  }),
};

// Debug function for development
export const debugAnalytics = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Google Analytics Debug Mode Enabled');
    console.log('📊 GA Measurement ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  }
}; 