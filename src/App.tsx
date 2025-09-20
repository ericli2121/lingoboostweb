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
import { supabase } from './utils/supabase';
import { User } from '@supabase/supabase-js';
import { explainSentence } from './utils/api';
import { getTranslationsForPracticeWithFallback, incrementTranslationCorrectCount, Translation } from './utils/translations';

function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
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
  const [toLanguage, setToLanguage] = useState('vi');
  const [sentenceLength, setSentenceLength] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isReadingSentence, setIsReadingSentence] = useState(false);
  const [theme, setTheme] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<'correct' | 'incorrect' | null>(null);
  const COMMON_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
  ];

  const getLanguageName = useCallback((code: string) => {
    return COMMON_LANGUAGES.find(lang => lang.code === code)?.name || code;
  }, []);
  
  // Constants
  const MIN_TRANSLATIONS_THRESHOLD = 5;
  const NUMBER_OF_TRANSLATIONS_TO_LOAD = 5; //20
  const NUMBER_OF_TIMES_CORRECT_NEEDED = 2;
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [statistics, setStatistics] = useState<Statistics>(loadStatistics());
  const [showStats, setShowStats] = useState(false);
  const [translationsQueue, setTranslationsQueue] = useState<Translation[]>([]);
  const [currentTranslationIndex, setCurrentTranslationIndex] = useState(0);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const hasInitiallyLoaded = useRef(false);

  // Load translations when user is authenticated and settings change
  const loadTranslations = useCallback(async (appendToQueue = false) => {
    if (!user) return;
    
    console.log(`🔄 [App] Starting loadTranslations - appendToQueue: ${appendToQueue}`);
    console.log(`🔄 [App] Parameters: from=${getLanguageName(fromLanguage)}, to=${getLanguageName(toLanguage)}, count=${NUMBER_OF_TRANSLATIONS_TO_LOAD}, length=${sentenceLength}, theme="${theme}"`);
    
    setIsLoadingTranslations(true);
    try {
      const result = await getTranslationsForPracticeWithFallback(
        user.id,
        getLanguageName(fromLanguage),
        getLanguageName(toLanguage),
        NUMBER_OF_TRANSLATIONS_TO_LOAD,
        sentenceLength,
        theme,
        NUMBER_OF_TIMES_CORRECT_NEEDED
      );

      if (result.error) {
        console.error('❌ [App] Error loading translations:', result.error);
        if (!appendToQueue) {
          setTranslationsQueue([]);
        }
      } else {
        console.log(`✅ [App] Loaded ${result.translations.length} translations`);
        if (result.generatedNew) {
          console.log('🆕 [App] Generated new translations from API');
        } else {
          console.log('💾 [App] Used existing translations from database');
        }
        
        if (appendToQueue) {
          // Add to existing queue
          console.log(`📝 [App] Appending ${result.translations.length} translations to existing queue`);
          setTranslationsQueue(prev => [...prev, ...result.translations]);
        } else {
          // Replace queue and reset index
          console.log(`🔄 [App] Replacing queue with ${result.translations.length} translations`);
          setTranslationsQueue(result.translations);
          setCurrentTranslationIndex(0);
        }
      }
    } catch (error) {
      console.error('❌ [App] Error loading translations:', error);
      if (!appendToQueue) {
        setTranslationsQueue([]);
      }
    } finally {
      setIsLoadingTranslations(false);
      console.log('✅ [App] loadTranslations completed');
    }
  }, [user, fromLanguage, toLanguage, sentenceLength, theme, getLanguageName]);

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

  // Load translations when user first authenticates
  useEffect(() => {
    if (user && !hasInitiallyLoaded.current) {
      console.log('🚀 [App] Initial load - user authenticated and no translations in queue');
      hasInitiallyLoaded.current = true;
      loadTranslations();
    }
  }, [user]);

  // Reload translations when settings change (clear queue and reload)
  useEffect(() => {
    if (user && hasInitiallyLoaded.current) {
      console.log('⚙️ [App] Settings changed - clearing queue and reloading translations');
      console.log(`⚙️ [App] New settings: from=${fromLanguage}, to=${toLanguage}, length=${sentenceLength}, theme="${theme}"`);
      setTranslationsQueue([]);
      setCurrentTranslationIndex(0);
      loadTranslations();
    }
  }, [fromLanguage, toLanguage, sentenceLength, theme]);

  // Check if we need more translations when queue gets low or is empty
  useEffect(() => {
    console.log(`translation queue length ${translationsQueue.length}`);
    if (user && translationsQueue.length <= MIN_TRANSLATIONS_THRESHOLD && !isLoadingTranslations) {
      console.log(`📉 [App] Queue needs replenishment - ${translationsQueue.length} translations remaining (threshold: ${MIN_TRANSLATIONS_THRESHOLD}), loading more`);
      loadTranslations(translationsQueue.length > 0); // Append if queue has items, replace if empty
    }
  }, [translationsQueue.length, user, isLoadingTranslations, loadTranslations]);

  // Initialize game when translations are loaded
  useEffect(() => {
    if (translationsQueue.length > 0) {
      console.log(`🎮 [App] Translations loaded, initializing game with ${translationsQueue.length} translations`);
      initializeGame();
    } else {
      console.log('⏳ [App] Waiting for translations to load...');
    }
  }, [translationsQueue, currentTranslationIndex, initializeGame]);

  // Remove the old test function
  // useEffect(() => {
  //   const testGenerateExercises = async () => {
  //     try {
  //       console.log('Testing generateExercisesSimple...');
  //       const exercises = await generateExercisesSimple(
  //         getLanguageName(fromLanguage),
  //         getLanguageName(toLanguage),
  //         sentenceLength,
  //         theme,
  //         5 // Generate 5 exercises for testing
  //       );
  //       console.log('Generated exercises result:', exercises);
  //     } catch (error) {
  //       console.error('Error testing generateExercisesSimple:', error);
  //     }
  //   };

  //   testGenerateExercises();
  // }, []); // Empty dependency array so it only runs once on mount

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
          // When speech finishes, increment correct count and go to next sentence
          if (user && gameState) {
            await incrementTranslationCorrectCount(
              user.id,
              getLanguageName(fromLanguage),
              getLanguageName(toLanguage),
              gameState.currentSentence.from
            );
          }
          
          // Remove completed translation from queue and stay at index 0
          console.log(`🗑️ [App] Removing completed translation from queue. Queue length before: ${translationsQueue.length}`);
          const newQueue = translationsQueue.slice(1); // Remove first element (current translation)
          setTranslationsQueue(newQueue);
          console.log(`📚 [App] Queue length after removal: ${newQueue.length}`);
          
          // Keep currentTranslationIndex at 0 since we removed the completed item
          setCurrentTranslationIndex(0);
          setIsReadingSentence(false);
        });
      } else if (newScrambled.length === 0 && newConstructed.length > 0) {
        // All words used but sentence is incorrect
        setCompletionStatus('incorrect');
      } else {
        // Reset status if not all words are used
        setCompletionStatus(null);
      }
    }
  }, [gameState, statistics, isReadingSentence, toLanguage, currentTranslationIndex, translationsQueue, user, fromLanguage, getLanguageName]);

  const handleNextSentence = useCallback(async () => {
    console.log(`➡️ [App] Manual next sentence requested`);
    console.log(`📚 [App] Queue status: ${translationsQueue.length} translations remaining`);
    console.log(`📚 [App] Queue contents:`, translationsQueue.map((t, i) => `${i}: "${t.from_sentence}" -> "${t.to_sentence}"`));
    
    if (translationsQueue.length > 1) {
      // Remove current translation and move to next
      console.log(`🗑️ [App] Manually removing current translation from queue`);
      const newQueue = translationsQueue.slice(1);
      setTranslationsQueue(newQueue);
      console.log(`✅ [App] Queue length after manual removal: ${newQueue.length}`);
      // Index stays at 0 since we removed the first item
      setCurrentTranslationIndex(0);
    } else {
      console.log(`⚠️ [App] No more translations available in queue`);
    }
  }, [translationsQueue]);

  const handleReplay = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  const handleExplain = useCallback(async () => {
    if (gameState) {
      setShowExplanation(true);
      setIsLoadingExplanation(true);
      setExplanation('');
      
      try {
        const explanation = await explainSentence(
          gameState.currentSentence.to,
          getLanguageName(fromLanguage),
          getLanguageName(toLanguage)
        );
        setExplanation(explanation);
      } catch (error) {
        setExplanation(error.message);
      } finally {
        setIsLoadingExplanation(false);
      }
    }
  }, [gameState, fromLanguage, toLanguage, getLanguageName]);

  const handleBack = useCallback(() => {
    const prevIndex = currentTranslationIndex > 0 ? currentTranslationIndex - 1 : 0;
    setCurrentTranslationIndex(prevIndex);
  }, [currentTranslationIndex]);

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

  if (!gameState || isLoadingTranslations) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-slate-600">
            {isLoadingTranslations ? 'Loading your practice sentences...' : 'Loading LingoBoost...'}
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
          <h1 className="text-3xl font-bold text-slate-800 mb-6">LingoBoost</h1>
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
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Settings</h2>
            <div className="mb-4">
              <label className="block text-slate-600 mb-1 font-medium">From Language</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                value={fromLanguage}
                onChange={e => {
                  const lang = e.target.value;
                  setFromLanguage(lang);
                }}
              >
                {COMMON_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-slate-600 mb-1 font-medium">To Language</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                value={toLanguage}
                onChange={e => {
                  const lang = e.target.value;
                  setToLanguage(lang);
                }}
              >
                {COMMON_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-slate-600 mb-1 font-medium">Length of Sentence</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSentenceLength(Math.max(3, sentenceLength - 1))}
                  disabled={sentenceLength <= 3}
                  className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded border border-slate-200">
                    {sentenceLength} words
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSentenceLength(Math.min(15, sentenceLength + 1))}
                  disabled={sentenceLength >= 15}
                  className="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Min: 3</span>
                <span>Max: 15</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-slate-600 mb-1 font-medium">Theme</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="Enter theme (e.g., animals, food, travel)"
              />
            </div>
            <button
              className="w-full py-2 px-4 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Header with settings */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-slate-800">
              LingoBoost
            </h1>
            <p className="text-sm text-slate-600">
              Sentences completed: {statistics.sentencesCompleted}
            </p>
          </div>
          <div className="flex items-center gap-4">
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
              onClick={() => setShowSettings(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 overflow-y-auto">
        <div className="space-y-4">
          {/* English Reference Sentence */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <p className="text-xl text-slate-700">{gameState.currentSentence.from}</p>
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
            <div className="flex flex-wrap gap-2 min-h-24 items-center">
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

        {/* Action Buttons */}
        <ActionButtons
          onExplain={handleExplain}
          onBack={handleBack}
          onRevealAnswer={handleRevealAnswer}
          onStatistics={handleStatistics}
          showAnswer={gameState.showAnswer}
          disabled={isReadingSentence}
        />

        {/* Google Ad
        <div className="mt-6">
          <GoogleAd
            dataAdSlot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT}
            dataAdFormat="auto"
            dataFullWidthResponsive={true}
            style={{ display: 'block', textAlign: 'center' }}
          />
        </div> */}
      </main>

      {/* Modals */}
      <StatisticsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        statistics={statistics}
      />

      <ExplanationModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        explanation={explanation}
        isLoading={isLoadingExplanation}
      />
    </div>
  );
}

export default App;
