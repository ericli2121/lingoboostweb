import * as React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Statistics } from './types';
import { initializeGameState, checkCompletion, moveWordToConstruction, removeWordFromConstruction } from './utils/gameLogic';
import { speechService } from './utils/speech';
import { loadStatistics, saveStatistics } from './utils/storage';
import { WordButton } from './components/WordButton';
import { ConstructionArea } from './components/ConstructionArea';
import { ActionButtons } from './components/ActionButtons';
import { StatisticsModal } from './components/StatisticsModal';
import { GoogleAd } from './components/GoogleAd';
import { ExplanationModal } from './components/ExplanationModal';
import { ThemeSelectionModal } from './components/ThemeSelectionModal';
import { HistoryModal } from './components/HistoryModal';
import { supabase } from './utils/supabase';
import { User } from '@supabase/supabase-js';
import { explainSentence } from './utils/api';
import { generateNewThemeQueue, saveCompletedSentence, Translation } from './utils/translations';
import { COMMON_LANGUAGES, MOST_COMMON_LANGUAGES } from './data/languages';
import { 
  initializeAnalytics, 
  trackPageView, 
  trackExerciseCompletion, 
  trackThemeSelection, 
  trackExplanationRequest,
  trackLanguageEvent
} from './utils/analytics';

function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      // Reset session counter when user logs in for the first time
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const previousUser = user;
      setUser(session?.user ?? null);
      
      // Reset session counter only when user logs in (was null, now has user)
      // if (!previousUser && session?.user) {
      //   console.log('🔄 [Session] Resetting session counter due to auth state change');
      //   setSessionSentencesCompleted(0);
      // }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  // Initialize Google Analytics
  useEffect(() => {
    // Initialize Analytics on app load
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID';
    initializeAnalytics(measurementId);
    trackPageView('App Load');
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    // Use the current origin + pathname for GitHub Pages compatibility
    const redirectUrl = window.location.origin + window.location.pathname;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    if (error) console.error('Error signing in:', error);
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  // Add missing state and constants
  const [fromLanguage, setFromLanguage] = useState('en');
  const [toLanguage, setToLanguage] = useState('es');
  const [sentenceLength, setSentenceLength] = useState(3);
  const [numberOfExercises, setNumberOfExercises] = useState(10);
  const [repetitions, setRepetitions] = useState(2);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isReadingSentence, setIsReadingSentence] = useState(false);
  const [theme, setTheme] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanationRetryStatus, setExplanationRetryStatus] = useState('');
  const [completionStatus, setCompletionStatus] = useState<'correct' | 'incorrect' | null>(null);
  
  // Debug state
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  const [isCallingAI, setIsCallingAI] = useState(false);
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false);
  
  // Theme selection modal state
  const [showThemeSelection, setShowThemeSelection] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('');

  const getLanguageName = useCallback((code: string) => {
    return COMMON_LANGUAGES.find(lang => lang.code === code)?.name || code;
  }, []);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [statistics, setStatistics] = useState<Statistics>(loadStatistics());
  const [sessionSentencesCompleted, setSessionSentencesCompleted] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [translationsQueue, setTranslationsQueue] = useState<Translation[]>([]);
  const [currentTranslationIndex, setCurrentTranslationIndex] = useState(0);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const hasInitiallyLoaded = useRef(false);

  // Generate new theme-based queue
  const generateQueueForTheme = useCallback(async (selectedTheme: string, overrideFromLanguage?: string, overrideToLanguage?: string, overrideSentenceLength?: number, overrideNumberOfExercises?: number, overrideRepetitions?: number) => {
    if (!user) return;
    
    // Use override values if provided, otherwise use current state
    const useFromLanguage = overrideFromLanguage || fromLanguage;
    const useToLanguage = overrideToLanguage || toLanguage;
    const useSentenceLength = overrideSentenceLength || sentenceLength;
    
    console.log(`🎨 [App] Generating queue for theme: "${selectedTheme}" with languages: ${useFromLanguage} -> ${useToLanguage} (${useSentenceLength} words)`);
    
    // Session counter continues across themes - only resets on logout/login
    
    setIsLoadingTranslations(true);
    setCurrentTheme(selectedTheme);
    
    try {
      const result = await generateNewThemeQueue(
        user.id,
        getLanguageName(useFromLanguage),
        getLanguageName(useToLanguage),
        useSentenceLength,
        selectedTheme,
        overrideNumberOfExercises || 10,
        overrideRepetitions || 2,
        setIsCallingAI
      );

      if (result.error) {
        console.error('❌ [App] Error generating theme queue:', result.error);
        setTranslationsQueue([]);
        // Show theme selection again on error
        setShowThemeSelection(true);
      } else {
        console.log(`✅ [App] Generated queue with ${result.translations.length} translations for theme: "${selectedTheme}"`);
        // Batch state updates to avoid double refresh
        setTranslationsQueue(result.translations);
        setCurrentTranslationIndex(0);
        setShowThemeSelection(false);
      }
    } catch (error) {
      console.error('❌ [App] Error generating theme queue:', error);
      setTranslationsQueue([]);
      setShowThemeSelection(true);
    } finally {
      setIsLoadingTranslations(false);
    }
  }, [user, fromLanguage, toLanguage, sentenceLength, getLanguageName]);

  const initializeGame = useCallback(() => {
    if (translationsQueue.length === 0) {
      console.log('⚠️ [App] Cannot initialize game - translation queue is empty');
      return;
    }
    
    console.log(`🎮 [App] Initializing game with next translation from queue (${translationsQueue.length} translations remaining)`);
    const translation = translationsQueue[currentTranslationIndex];
    console.log(`🎮 [App] Current sentence: "${translation.from_sentence}" -> "${translation.to_sentence}"`);
    
    const sentence = {
      from: translation.from_sentence,
      to: translation.to_sentence
    };
    const newGameState = initializeGameState(sentence, currentTranslationIndex);
    setGameState(newGameState);
    setCompletionStatus(null); // Reset completion status
    console.log('✅ [App] Game initialized successfully');
  }, [translationsQueue, currentTranslationIndex]);

  // Show theme selection when user first authenticates
  useEffect(() => {
    if (user && !hasInitiallyLoaded.current) {
      console.log('🚀 [App] Initial load - user authenticated, showing theme selection');
      hasInitiallyLoaded.current = true;
      setShowThemeSelection(true);
    }
  }, [user]);

  // Show theme selection when queue is empty or index is out of bounds
  useEffect(() => {
    if (user && hasInitiallyLoaded.current && !isLoadingTranslations) {
      if ((translationsQueue.length === 0 || currentTranslationIndex >= translationsQueue.length) && !showThemeSelection) {
        console.log(`📋 [App] Showing theme selection - Queue length: ${translationsQueue.length}, Index: ${currentTranslationIndex}`);
        setShowThemeSelection(true);
        setGameState(null);
      }
    }
  }, [translationsQueue.length, currentTranslationIndex, user, isLoadingTranslations]);

  // Initialize game when we have valid translations and index
  useEffect(() => {
    if (translationsQueue.length > 0 && 
        currentTranslationIndex >= 0 && 
        currentTranslationIndex < translationsQueue.length && 
        !isLoadingTranslations) {
      console.log(`🎮 [App] Initializing game for translation ${currentTranslationIndex + 1}/${translationsQueue.length}`);
      initializeGame();
    }
  }, [translationsQueue.length, currentTranslationIndex, isLoadingTranslations]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfileMenu && !target.closest('[data-profile-menu]')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleWordClick = useCallback((word: string) => {
    if (!gameState) return;

    // Don't allow interaction when sentence is being read
    if (isReadingSentence) return;

    const isInConstruction = gameState.constructedWords.includes(word);
    if (isInConstruction) {
      // Remove from construction area
      const { newScrambled, newConstructed } = removeWordFromConstruction(
        word,
        gameState.scrambledWords,
        gameState.constructedWords
      );
      setGameState(prev => prev ? {
        ...prev,
        scrambledWords: newScrambled,
        constructedWords: newConstructed,
        isCompleted: false
      } : null);
      setCompletionStatus(null); // Reset completion status when removing words
    } else {
      // Add to construction area
      const { newScrambled, newConstructed } = moveWordToConstruction(
        word,
        gameState.scrambledWords,
        gameState.constructedWords
      );
      const isCompleted = checkCompletion(newConstructed, gameState.currentSentence.to);
      setGameState(prev => prev ? {
        ...prev,
        scrambledWords: newScrambled,
        constructedWords: newConstructed,
        isCompleted
      } : null);
      // Check for completion
      if (isCompleted) {
        setCompletionStatus('correct');
        
        // Track exercise completion
        trackExerciseCompletion(
          fromLanguage,
          toLanguage,
          true,
          'sentence_construction',
          currentTheme
        );
        
        // Update session counter
        setSessionSentencesCompleted(prev => prev + 1);
        
        const newStats = {
          ...statistics,
          sentencesCompleted: statistics.sentencesCompleted + 1,
          totalAttempts: statistics.totalAttempts + 1,
          streak: statistics.streak + 1,
          bestStreak: Math.max(statistics.bestStreak, statistics.streak + 1)
        };
        setStatistics(newStats);
        saveStatistics(newStats);
        setIsReadingSentence(true);
        
        // Speak the completed sentence and auto-advance when finished
        speechService.speak(gameState.currentSentence.to, toLanguage, async () => {
          // When speech finishes, save completed sentence to database
          if (user && gameState) {
            await saveCompletedSentence(
              user.id,
              getLanguageName(fromLanguage),
              getLanguageName(toLanguage),
              gameState.currentSentence.from,
              gameState.currentSentence.to
            );
          }
          
          // Move to next translation by incrementing index (don't remove from queue)
          console.log(`➡️ [App] Moving to next translation. Current index: ${currentTranslationIndex}, Queue length: ${translationsQueue.length}`);
          const nextIndex = currentTranslationIndex + 1;
          
          if (nextIndex >= translationsQueue.length) {
            // Reached end of queue - show theme selection for new exercises
            console.log(`✅ [App] Reached end of queue (${translationsQueue.length} translations completed)`);
            setShowThemeSelection(true);
            setGameState(null); // Clear current game state
          } else {
            // Move to next translation
            console.log(`📚 [App] Moving to translation ${nextIndex + 1} of ${translationsQueue.length}`);
            setCurrentTranslationIndex(nextIndex);
          }
          
          setIsReadingSentence(false);
        });
      } else if (newScrambled.length === 0 && newConstructed.length > 0) {
        // All words used but sentence is incorrect
        setCompletionStatus('incorrect');
        
        // Track incorrect exercise completion
        trackExerciseCompletion(
          fromLanguage,
          toLanguage,
          false,
          'sentence_construction',
          currentTheme
        );
      } else {
        // Reset status if not all words are used
        setCompletionStatus(null);
      }
    }
  }, [gameState, statistics, isReadingSentence, toLanguage, currentTranslationIndex, translationsQueue, user, fromLanguage, getLanguageName, currentTheme]);

  const handleNextSentence = useCallback(async () => {
    console.log(`➡️ [App] Manual next sentence requested`);
    console.log(`📚 [App] Current index: ${currentTranslationIndex}, Queue length: ${translationsQueue.length}`);
    
    const nextIndex = currentTranslationIndex + 1;
    
    if (nextIndex >= translationsQueue.length) {
      // Reached end of queue - show theme selection for new exercises
      console.log(`⚠️ [App] Reached end of queue manually`);
      setShowThemeSelection(true);
      setGameState(null);
    } else {
      // Move to next translation
      console.log(`📚 [App] Manually moving to translation ${nextIndex + 1} of ${translationsQueue.length}`);
      setCurrentTranslationIndex(nextIndex);
    }
  }, [currentTranslationIndex, translationsQueue]);

  const handleReplay = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  const handleExplain = useCallback(async () => {
    if (gameState) {
      setShowExplanation(true);
      setIsLoadingExplanation(true);
      setExplanation('');
      setExplanationRetryStatus('');
      
      // Track explanation request
      trackExplanationRequest(fromLanguage, toLanguage);
      
      try {
        const explanation = await explainSentence(
          gameState.currentSentence.to,
          getLanguageName(fromLanguage),
          getLanguageName(toLanguage),
          (attempt, maxRetries) => {
            console.log(`🔄 [App] Status update: Attempting ${attempt}/${maxRetries}...`);
            setExplanationRetryStatus(`Attempting ${attempt}/${maxRetries}...`);
          }
        );
        setExplanation(explanation);
        setExplanationRetryStatus('');
      } catch (error) {
        console.error('🚨 [App] Final error after all retries:', error);
        setExplanation(error.message);
        setExplanationRetryStatus('');
      } finally {
        setIsLoadingExplanation(false);
      }
    }
  }, [gameState, fromLanguage, toLanguage, getLanguageName]);

  const handleBack = useCallback(() => {
    if (currentTranslationIndex > 0) {
      const prevIndex = currentTranslationIndex - 1;
      console.log(`⬅️ [App] Going back to translation ${prevIndex + 1} of ${translationsQueue.length}`);
      setCurrentTranslationIndex(prevIndex);
    } else {
      console.log(`⬅️ [App] Already at first translation, cannot go back`);
    }
  }, [currentTranslationIndex, translationsQueue.length]);

  const handleRevealAnswer = useCallback(() => {
    if (gameState) {
      setGameState(prev => prev ? { ...prev, showAnswer: true } : null);
    }
  }, [gameState]);

  const handleConstructionEmptyClick = useCallback(() => {
    if (!gameState) return;
    if (gameState.constructedWords.length === 0) return;

    const newScrambled = [...gameState.scrambledWords, ...gameState.constructedWords];
    setGameState(prev => prev ? {
      ...prev,
      scrambledWords: newScrambled,
      constructedWords: [],
      isCompleted: false
    } : null);
    setCompletionStatus(null); // Reset completion status when clearing construction area
  }, [gameState]);

  const handleStatistics = useCallback(() => {
    setShowStats(true);
  }, []);

  const handleHistory = useCallback(() => {
    setShowHistory(true);
    setShowProfileMenu(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    // Open the theme selection modal which now includes settings
    setShowThemeSelection(true);
  }, []);

  const handleThemeSelected = useCallback((theme: string, newFromLanguage: string, newToLanguage: string, newSentenceLength: number, newNumberOfExercises: number, newRepetitions: number) => {
    console.log(`🎨 [App] Theme and settings selected:`, { theme, newFromLanguage, newToLanguage, newSentenceLength, newNumberOfExercises, newRepetitions });
    
    // Track theme selection
    trackThemeSelection(theme, newFromLanguage, newToLanguage);
    
    // Apply settings first
    setFromLanguage(newFromLanguage);
    setToLanguage(newToLanguage);
    setSentenceLength(newSentenceLength);
    setNumberOfExercises(newNumberOfExercises);
    setRepetitions(newRepetitions);
    
    // Then generate queue with the new settings (pass them directly to avoid state timing issues)
    generateQueueForTheme(theme, newFromLanguage, newToLanguage, newSentenceLength, newNumberOfExercises, newRepetitions);
  }, [generateQueueForTheme]);

  const handleThemeSelectionClose = useCallback(() => {
    setShowThemeSelection(false);
  }, []);

  const handleClearTheme = useCallback(() => {
    setCurrentTheme('');
    setTranslationsQueue([]);
    setCurrentTranslationIndex(0);
    setGameState(null);
  }, []);

  // Only show loading screen when actively generating translations
  if (isLoadingTranslations) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-slate-600">
            {`Generating ${currentTheme ? `"${currentTheme}"` : 'themed'} practice sentences...`}
          </p>
        </div>
      </div>
    );
  }

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">RapidLingo</h1>
          <p className="text-slate-600 mb-8">
            Practice language by rapid sentence construction and track your progress. Sign in to get started.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header with settings */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Main row with centered title and profile/settings */}
          <div className="flex justify-center items-center relative mb-3 sm:mb-4">
            {/* Centered RapidLingo title */}
            <h1 className="text-xl font-bold text-slate-800">
              RapidLingo
            </h1>
            
            {/* Right side - Profile and settings (absolute positioned) */}
            <div className="absolute right-0 flex items-center gap-4">
              {/* Profile Picture with Dropdown */}
              <div className="relative" data-profile-menu>
                <button
                  className="flex items-center p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="Profile menu"
                >
                  <img
                    src={user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || '')}&background=3b82f6&color=fff`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || '')}&background=3b82f6&color=fff`;
                    }}
                  />
                </button>
                
                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm text-slate-600 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleHistory}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                    >
                      History
                    </button>
                    <button
                      onClick={() => {
                        signOut();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
              
              {/* Settings Button */}
              <button
                className="p-2 rounded-full hover:bg-slate-100 focus:outline-none"
                aria-label="Settings"
                onClick={handleOpenSettings}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Compact secondary information row */}
          <div className="text-center space-y-2">
            {currentTheme && (
              <div className="text-xs text-blue-600 font-medium">
                Theme: "{currentTheme}"
              </div>
            )}
            <div className="text-xs flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 items-center justify-center">
              <span className="text-slate-500">
                Sentence #<span className="font-semibold text-blue-600">{currentTranslationIndex + 1}</span>/<span className="text-slate-600">{translationsQueue.length}</span>
              </span>
              <span className="text-slate-500">
                Total completed: <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{sessionSentencesCompleted}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto px-6 py-4 overflow-y-auto">
        {/* Top Banner Ad */}
        {/* <div className="mb-4">
          <GoogleAd
            dataAdSlot={import.meta.env.VITE_GOOGLE_ADSENSE_BANNER_SLOT || '0987654321'}
            dataAdFormat="horizontal"
            dataFullWidthResponsive={true}
            style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
            className="banner-ad"
          />
        </div> */}
        
        {gameState ? (
          <div className="space-y-3">
            {/* English Reference Sentence */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 min-h-[60px] flex items-center">
              <p className="text-lg text-slate-700">{gameState.currentSentence.from}</p>
            </div>

            {/* Construction Area */}
            <ConstructionArea
              words={gameState.constructedWords}
              onWordClick={handleWordClick}
              isEmpty={gameState.constructedWords.length === 0}
              onEmptySpaceClick={handleConstructionEmptyClick}
              completionStatus={completionStatus}
            />

            {/* Answer Display */}
            {gameState.showAnswer && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Answer:</h3>
                <p className="text-lg text-green-700">{gameState.currentSentence.to}</p>
              </div>
            )}

            {/* Words */}
            <div className="mt-2">
              <div className="flex flex-wrap gap-2 min-h-20 items-center">
                {gameState.scrambledWords.map((word, index) => (
                  <div key={word}>
                    <WordButton
                      word={word}
                      onClick={handleWordClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to RapidLingo!</h2>
              <p className="text-slate-600 mb-6">
                {translationsQueue.length === 0 
                  ? "Choose a theme to start practicing with 60 themed sentences."
                  : "Loading your practice session..."
                }
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons - only show when gameState exists */}
        {gameState && (
          <ActionButtons
            onExplain={handleExplain}
            onBack={handleBack}
            onRevealAnswer={handleRevealAnswer}
            // onStatistics={handleStatistics} // Disabled for now
            showAnswer={gameState.showAnswer}
            disabled={isReadingSentence}
          />
        )}

        {/* Google Ad - Main Content Area */}
        {/* <div className="mt-6">
          <GoogleAd
            dataAdSlot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT || '1234567890'}
            dataAdFormat="auto"
            dataFullWidthResponsive={true}
            style={{ display: 'block', textAlign: 'center' }}
            className="mt-4 mb-4"
          />
        </div> */}
      </main>

      {/* Modals */}
      <StatisticsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        statistics={statistics}
      />

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        userId={user?.id || ''}
        fromLanguage={getLanguageName(fromLanguage)}
        toLanguage={getLanguageName(toLanguage)}
      />

      <ExplanationModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={explanation}
        isLoading={isLoadingExplanation}
        retryStatus={explanationRetryStatus}
      />

      <ThemeSelectionModal
        isOpen={showThemeSelection}
        onClose={handleThemeSelectionClose}
        onSelectTheme={handleThemeSelected}
        onClearTheme={handleClearTheme}
        toLanguage={toLanguage}
        fromLanguage={fromLanguage}
        sentenceLength={sentenceLength}
        numberOfExercises={numberOfExercises}
        repetitions={repetitions}
        availableLanguages={COMMON_LANGUAGES}
        mostCommonLanguages={MOST_COMMON_LANGUAGES}
        currentTheme={currentTheme}
        queueLength={translationsQueue.length}
        isLoadingTranslations={isLoadingTranslations}
      />
    </div>
  );
}

export default App;
