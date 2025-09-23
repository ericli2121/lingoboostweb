import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { generateThemes } from '../utils/api';
import { speechService } from '../utils/speech';
import { LANGUAGE_SPEECH_MAPPING } from '../data/languages';

const SUGGESTED_THEMES_COUNT = 3;

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: string, fromLanguage: string, toLanguage: string, sentenceLength: number, numberOfExercises: number, repetitions: number) => void;
  onClearTheme?: () => void;
  toLanguage: string;
  fromLanguage: string;
  sentenceLength: number;
  numberOfExercises: number;
  repetitions: number;
  availableLanguages: Array<{ code: string; name: string }>;
  mostCommonLanguages: Array<{ code: string; name: string }>;
  currentTheme?: string;
  queueLength: number;
  isLoadingTranslations: boolean;
}

export const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTheme,
  onClearTheme,
  toLanguage,
  fromLanguage,
  sentenceLength,
  numberOfExercises,
  repetitions,
  availableLanguages,
  mostCommonLanguages,
  currentTheme,
  queueLength,
  isLoadingTranslations
}) => {
  const [customTheme, setCustomTheme] = useState('');
  const [suggestedThemes, setSuggestedThemes] = useState<string[]>([]);
  const [previousThemes, setPreviousThemes] = useState<string[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  const [hasToLanguageAudio, setHasToLanguageAudio] = useState(true);
  
  // State for expandable language lists (single state controls both dropdowns)
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  
  // Local state for settings
  const [localFromLanguage, setLocalFromLanguage] = useState(fromLanguage);
  const [localToLanguage, setLocalToLanguage] = useState(toLanguage);
  const [localSentenceLength, setLocalSentenceLength] = useState(sentenceLength);
  const [localNumberOfExercises, setLocalNumberOfExercises] = useState(numberOfExercises);
  const [localRepetitions, setLocalRepetitions] = useState(repetitions);
  
  // Ref to track if we've already loaded themes for this modal opening
  const hasLoadedForCurrentSession = useRef(false);
  
  // Initialize customTheme with currentTheme when modal opens
  useEffect(() => {
    if (isOpen && currentTheme) {
      setCustomTheme(currentTheme);
    }
  }, [isOpen, currentTheme]);

  // Update local state when props change
  useEffect(() => {
    setLocalFromLanguage(fromLanguage);
    setLocalSentenceLength(sentenceLength);
    setLocalNumberOfExercises(numberOfExercises);
    setLocalRepetitions(repetitions);
  }, [fromLanguage, sentenceLength, numberOfExercises, repetitions]);

  // Update localToLanguage when toLanguage prop changes
  useEffect(() => {
    console.log("[UseEffect] toLanguage changed:", toLanguage);
    // Only update if the value actually changed
    if (localToLanguage !== toLanguage) {
      console.log("[UseEffect] toLanguage - ACTUALLY UPDATING");
      setLocalToLanguage(toLanguage);
      // Reset the session flag so themes will reload with new language
      hasLoadedForCurrentSession.current = false;
      // Clear previous themes when language changes
      setPreviousThemes([]);
    } else {
      console.log("[UseEffect] toLanguage - SKIPPED (same value)");
    }
  }, [toLanguage]);

  // Load suggested themes when modal opens or language changes
  useEffect(() => {
    if (isOpen && !hasLoadedForCurrentSession.current) {
      console.log("[UseEffect] loadSuggestedThemes - EXECUTING");
      hasLoadedForCurrentSession.current = true;
      loadSuggestedThemes();
      // Also recheck audio when modal opens in case voices weren't loaded before
      checkAudioAvailability();
    } else if (isOpen && hasLoadedForCurrentSession.current) {
      console.log("[UseEffect] loadSuggestedThemes - SKIPPED (already loaded)");
    } else if (!isOpen) {
      // Reset the flag when modal closes
      hasLoadedForCurrentSession.current = false;
      console.log("[UseEffect] loadSuggestedThemes - RESET FLAG (modal closed)");
    }
  }, [isOpen, localToLanguage]);

  // Check if audio is available for the "To Language"
  useEffect(() => {
    checkAudioAvailability();
    
    // Listen for voices to load in case they're not available immediately
    const handleVoicesChanged = () => {
      checkAudioAvailability();
    };
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, [localToLanguage]);

  const checkAudioAvailability = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Get voices from speech service or directly from browser
      let voices = speechService.getAvailableVoices();
      
      // If no voices from service, try direct browser access
      if (voices.length === 0) {
        voices = window.speechSynthesis.getVoices();
      }
      
      // Map language codes to common speech synthesis language codes
      const targetLanguageCodes = LANGUAGE_SPEECH_MAPPING[localToLanguage] || [localToLanguage];
      
      const hasVoice = voices.some(voice => 
        targetLanguageCodes.some(code => 
          voice.lang.toLowerCase().startsWith(code.toLowerCase().split('-')[0])
        )
      );
      
      setHasToLanguageAudio(hasVoice);
    } else {
      setHasToLanguageAudio(false);
    }
  };

  const loadSuggestedThemes = async () => {
    setIsLoadingThemes(true);
    try {
      const themes = await generateThemes(localToLanguage, SUGGESTED_THEMES_COUNT, previousThemes);
      setSuggestedThemes(themes);
    } catch (error) {
      console.error('Error loading suggested themes:', error);
      setSuggestedThemes([]);
    } finally {
      setIsLoadingThemes(false);
    }
  };

  // Validation function to check if languages are different
  const areLanguagesDifferent = () => {
    return localFromLanguage !== localToLanguage;
  };

  // Combined loading state - buttons should be disabled if either local or global loading is active
  const isLoading = isLoadingThemes;

  // Helper function to render language select
  const renderLanguageSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void
  ) => {
    const languagesToShow = showAllLanguages ? availableLanguages : mostCommonLanguages;
    const isCurrentLanguageInCommon = mostCommonLanguages.some(lang => lang.code === value);
    
    return (
      <div>
        <label className="block text-slate-700 text-sm font-medium mb-1">
          {label}
        </label>
        <select
          className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
        >
          {languagesToShow.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
          {!showAllLanguages && !isCurrentLanguageInCommon && (
            <option value={value}>
              {availableLanguages.find(lang => lang.code === value)?.name || value}
            </option>
          )}
        </select>
      </div>
    );
  };

  const handleSelectCustomTheme = () => {
    if (!customTheme.trim()) return;
    
    if (!areLanguagesDifferent()) {
      alert('Please select different languages for "From" and "To" fields.');
      return;
    }
    
    const themeToUse = customTheme.trim();
    // Add to previous themes to avoid duplication (keep only last 18)
    setPreviousThemes(prev => [...prev, themeToUse].slice(-18));
    
    onSelectTheme(themeToUse, localFromLanguage, localToLanguage, localSentenceLength, localNumberOfExercises, localRepetitions);
    // setCustomTheme('');
  };

  const handleSelectSuggestedTheme = (theme: string) => {
    if (!areLanguagesDifferent()) {
      alert('Please select different languages for "From" and "To" fields.');
      return;
    }
    
    // Add to previous themes to avoid duplication (keep only last 18)
    setPreviousThemes(prev => [...prev, theme].slice(-18));
    
    onSelectTheme(theme, localFromLanguage, localToLanguage, localSentenceLength, localNumberOfExercises, localRepetitions);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTheme.trim()) {
      handleSelectCustomTheme();
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't allow closing if queue is empty - user must select a theme
    if (queueLength === 0) {
      return;
    }
    
    // Close modal if clicking on the backdrop (not on the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">
              Configurations
            </h2>
            <button
              onClick={() => {
                if (queueLength > 0) {
                  onClose();
                }
              }}
              className={`transition-colors p-1 ${
                queueLength === 0 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label="Close"
              disabled={queueLength === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          


          {/* Language Settings */}
          <div className="mb-4">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
              {renderLanguageSelect(
                "1. From Language",
                localFromLanguage,
                setLocalFromLanguage
              )}
              {renderLanguageSelect(
                "To Language",
                localToLanguage,
                setLocalToLanguage
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAllLanguages(!showAllLanguages)}
                  className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="More languages"
                  disabled={isLoading}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Language Validation Warning */}
          {!areLanguagesDifferent() && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
              ⚠️ Please select different languages for "From" and "To" fields. You cannot translate between the same language.
            </div>
          )}

          {/* Audio Availability Warning */}
                    {/* Audio Availability Warning */}
          {!hasToLanguageAudio && areLanguagesDifferent() && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">🔊</span>
                <div>
                  <p className="font-medium text-sm">Audio not available</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Voice synthesis for {availableLanguages.find(lang => lang.code === localToLanguage)?.name} is not available on your device. The learning experience will work, but without pronunciation audio.
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-medium">To enable audio support:</p>
                <div className="ml-2 space-y-1">
                  <p><strong>Windows:</strong> Go to Settings → Time & Language → Speech → Add languages, then install the speech pack for your target language.</p>
                  <p><strong>Mac:</strong> System Preferences → Accessibility → Speech → System Voice → Customize, then download additional voices.</p>
                  <p><strong>Android:</strong> Settings → Language & Input → Text-to-speech output → Install voice data.</p>
                  <p><strong>iOS:</strong> Settings → Accessibility → Spoken Content → Voices, then download additional languages.</p>
                </div>
              </div>
            </div>
          )}

          {/* Exercise Generation Settings */}
          <div className="mb-3">
            <label className="block text-slate-700 text-sm font-medium mb-2">
              2. Exercise Generation
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Number of Exercises */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-600 font-medium">Exercises</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setLocalNumberOfExercises(Math.max(10, localNumberOfExercises - 1))}
                    disabled={localNumberOfExercises <= 10 || isLoading}
                    className="w-7 h-7 flex items-center justify-center border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm border-r-0 rounded-l"
                  >
                    −
                  </button>
                  <div className="h-7 flex items-center justify-center border-t border-b border-slate-300 bg-slate-50 px-3 min-w-[50px]">
                    <span className="text-sm font-medium text-slate-700">
                      {localNumberOfExercises}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalNumberOfExercises(Math.min(30, localNumberOfExercises + 1))}
                    disabled={localNumberOfExercises >= 30 || isLoading}
                    className="w-7 h-7 flex items-center justify-center border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm border-l-0 rounded-r"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Repetitions */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-600 font-medium">Repetitions</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setLocalRepetitions(Math.max(1, localRepetitions - 1))}
                    disabled={localRepetitions <= 1 || isLoading}
                    className="w-7 h-7 flex items-center justify-center border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm border-r-0 rounded-l"
                  >
                    −
                  </button>
                  <div className="h-7 flex items-center justify-center border-t border-b border-slate-300 bg-slate-50 px-3 min-w-[50px]">
                    <span className="text-sm font-medium text-slate-700">
                      {localRepetitions}x
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalRepetitions(Math.min(3, localRepetitions + 1))}
                    disabled={localRepetitions >= 3 || isLoading}
                    className="w-7 h-7 flex items-center justify-center border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm border-l-0 rounded-r"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ⚡ More exercises = longer practice • More repetitions = better retention

            </p>
            {/* Sentence Length */}
            <div className="mt-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-slate-600 font-medium">Sentence Length</span>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setLocalSentenceLength(Math.max(3, localSentenceLength - 1))}
                    disabled={localSentenceLength <= 3 || isLoading}
                    className="w-7 h-7 flex items-center justify-center border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm border-r-0 rounded-l"
                  >
                    −
                  </button>
                  <div className="h-7 flex items-center justify-center border-t border-b border-slate-300 bg-slate-50 px-3 min-w-[70px]">
                    <span className="text-sm font-medium text-slate-700">
                      {localSentenceLength} words
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalSentenceLength(Math.min(15, localSentenceLength + 1))}
                    disabled={localSentenceLength >= 15 || isLoading}
                    className="w-7 h-7 flex items-center justify-center border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm border-l-0 rounded-r"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            <p className="text-xs text-slate-500 mt-2">
              💡 Beginner: 3-5 words • Intermediate: 6-8 words • Advanced: 9+ words

            </p>
          </div>

          {/* Loading Indicator */}
          {/* {isLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 text-sm font-medium">
                  Generating themed practice sentences...
                </span>
              </div>
            </div>
          )} */}

          {/* Custom Theme Input */}
          <div className="mb-4">
            <label className="flex items-center gap-1 text-slate-700 text-sm font-medium mb-1">
              3. Custom Theme
              <span className="text-slate-400 text-xs font-normal">🤖 tell AI what you want to practice</span>
            </label>

   
  
            <div className="flex gap-2">
              <input
                type="text"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your own theme..."
                className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSelectCustomTheme}
                disabled={!customTheme.trim() || !areLanguagesDifferent() || isLoading}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Use'}
              </button>
              <button
                onClick={() => setCustomTheme('')}
                disabled={!customTheme.trim() || isLoading}
                className="px-2 py-1 bg-slate-200 text-slate-600 text-sm rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear input"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Suggested Themes */}
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-medium mb-2">
              or, choose a suggested theme
            </label>
            
            {isLoadingThemes ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-slate-600">Loading suggestions...</span>
              </div>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {suggestedThemes.map((theme, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectSuggestedTheme(theme)}
                    disabled={!areLanguagesDifferent() || isLoading}
                    className={`w-full text-left p-2 text-sm border border-slate-200 rounded transition-colors duration-200 ${
                      !areLanguagesDifferent() || isLoading
                        ? 'opacity-50 cursor-not-allowed bg-slate-100' 
                        : 'hover:bg-slate-50 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-slate-700">
                      {isLoading ? 'Loading...' : theme}
                    </span>
                  </button>
                ))}
                
                {suggestedThemes.length === 0 && !isLoadingThemes && (
                  <div className="text-center text-slate-500 py-3 text-sm">
                    No suggestions available. Try entering a custom theme above.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-start items-center">
            <button
              onClick={loadSuggestedThemes}
              disabled={isLoadingThemes || isLoading}
              className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              🔄 Get New Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};