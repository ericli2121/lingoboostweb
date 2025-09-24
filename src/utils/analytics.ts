// Google Analytics utility functions for RapidLingo

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Initialize Google Analytics
export const initializeAnalytics = (measurementId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', measurementId, {
      page_title: 'RapidLingo.ai',
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (pageName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      custom_parameter: true,
      ...parameters,
    });
  }
};

// Track language learning specific events
export const trackLanguageEvent = (action: string, fromLanguage: string, toLanguage: string, additionalData?: Record<string, any>) => {
  trackEvent(action, {
    from_language: fromLanguage,
    to_language: toLanguage,
    ...additionalData,
  });
};

// Track exercise completion
export const trackExerciseCompletion = (
  fromLanguage: string,
  toLanguage: string,
  isCorrect: boolean,
  exerciseType: string = 'sentence_construction',
  theme?: string
) => {
  trackEvent('exercise_completed', {
    from_language: fromLanguage,
    to_language: toLanguage,
    is_correct: isCorrect,
    exercise_type: exerciseType,
    theme: theme || 'none',
  });
};

// Track theme selection
export const trackThemeSelection = (theme: string, fromLanguage: string, toLanguage: string) => {
  trackEvent('theme_selected', {
    theme: theme,
    from_language: fromLanguage,
    to_language: toLanguage,
  });
};

// Track API usage
export const trackApiCall = (apiEndpoint: string, success: boolean, retryCount?: number) => {
  trackEvent('api_call', {
    endpoint: apiEndpoint,
    success: success,
    retry_count: retryCount || 1,
  });
};

// Track explanation requests
export const trackExplanationRequest = (fromLanguage: string, toLanguage: string) => {
  trackEvent('explanation_requested', {
    from_language: fromLanguage,
    to_language: toLanguage,
  });
};

// Track session statistics
export const trackSessionStats = (
  totalExercises: number,
  correctAnswers: number,
  fromLanguage: string,
  toLanguage: string,
  sessionDuration: number
) => {
  trackEvent('session_completed', {
    total_exercises: totalExercises,
    correct_answers: correctAnswers,
    accuracy: Math.round((correctAnswers / totalExercises) * 100),
    from_language: fromLanguage,
    to_language: toLanguage,
    session_duration_seconds: sessionDuration,
  });
};