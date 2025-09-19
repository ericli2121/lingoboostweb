import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { sentenceData } from './data/sentences';
import { GameState, Statistics } from './types';
import { initializeGameState, checkCompletion, moveWordToConstruction, removeWordFromConstruction } from './utils/gameLogic';
import { speechService } from './utils/speech';
import { loadStatistics, saveStatistics, loadCurrentIndex, saveCurrentIndex } from './utils/storage';
import { WordButton } from './components/WordButton';
import { ConstructionArea } from './components/ConstructionArea';
import { ActionButtons } from './components/ActionButtons';
import { StatisticsModal } from './components/StatisticsModal';
import { GoogleAd } from './components/GoogleAd';
import { ExplanationModal } from './components/ExplanationModal';

function App() {
  // Add missing state and constants
  const [fromLanguage, setFromLanguage] = useState('en');
  const [toLanguage, setToLanguage] = useState('vi');
  const [showSettings, setShowSettings] = useState(false);
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
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [statistics, setStatistics] = useState<Statistics>(loadStatistics());
  const [showStats, setShowStats] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(loadCurrentIndex());
  // Removed voice selection

  const initializeGame = useCallback(() => {
    const sentence = sentenceData[currentIndex];
    const newGameState = initializeGameState(sentence, currentIndex);
    setGameState(newGameState);
    setCompletionStatus(null); // Reset completion status
  }, [currentIndex]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

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
        console.log('Setting completion status to correct');
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
        speechService.speak(gameState.currentSentence.to, toLanguage, () => {
          // When speech finishes, go to next sentence
          const nextIndex = (currentIndex + 1) % sentenceData.length;
          setCurrentIndex(nextIndex);
          saveCurrentIndex(nextIndex);
          setIsReadingSentence(false);
        });
      } else if (newScrambled.length === 0 && newConstructed.length > 0) {
        // All words used but sentence is incorrect
        setCompletionStatus('incorrect');
        console.log('Setting completion status to incorrect');
      } else {
        // Reset status if not all words are used
        setCompletionStatus(null);
        console.log('Resetting completion status');
      }
    }
  }, [gameState, statistics, isReadingSentence, toLanguage, currentIndex]);

  const handleNextSentence = useCallback(() => {
    const nextIndex = (currentIndex + 1) % sentenceData.length;
    setCurrentIndex(nextIndex);
    saveCurrentIndex(nextIndex);
  }, [currentIndex]);

  const handleReplay = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  const handleExplain = useCallback(async () => {
    if (gameState) {
      setShowExplanation(true);
      setIsLoadingExplanation(true);
      setExplanation('');
      
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const response = await fetch(`${baseUrl}/explain`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sentence: gameState.currentSentence.to,
            from_language: getLanguageName(fromLanguage),
            to_language: getLanguageName(toLanguage)
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setExplanation(data.explanation || 'No explanation available.');
      } catch (error) {
        console.error('Error fetching explanation:', error);
        
        // Check if it's a CORS error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setExplanation('CORS error: The server needs to be configured to allow requests from this domain. Please contact the administrator to enable CORS for this endpoint.');
        } else {
          setExplanation(`Error: ${error.message}. Please try again later.`);
        }
      } finally {
        setIsLoadingExplanation(false);
      }
    }
  }, [gameState, fromLanguage, toLanguage, theme]);

  const handleBack = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : sentenceData.length - 1;
    setCurrentIndex(prevIndex);
    saveCurrentIndex(prevIndex);
  }, [currentIndex]);

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

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading LingoBoost...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
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
      <main className="max-w-4xl mx-auto px-4 py-6">
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

        {/* Google Ad */}
        <div className="mt-6 mb-4">
          <GoogleAd
            dataAdSlot={import.meta.env.VITE_GOOGLE_ADSENSE_SLOT}
            dataAdFormat="auto"
            dataFullWidthResponsive={true}
            style={{ display: 'block', textAlign: 'center' }}
          />
        </div>
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
