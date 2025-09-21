import * as React from 'react';
import { useState, useEffect } from 'react';
import { generateThemes } from '../utils/api';

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: string, fromLanguage: string, toLanguage: string, sentenceLength: number) => void;
  toLanguage: string;
  fromLanguage: string;
  sentenceLength: number;
  availableLanguages: Array<{ code: string; name: string }>;
}

export const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTheme,
  toLanguage,
  fromLanguage,
  sentenceLength,
  availableLanguages
}) => {
  const [customTheme, setCustomTheme] = useState('');
  const [suggestedThemes, setSuggestedThemes] = useState<string[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);
  
  // Local state for settings
  const [localFromLanguage, setLocalFromLanguage] = useState(fromLanguage);
  const [localToLanguage, setLocalToLanguage] = useState(toLanguage);
  const [localSentenceLength, setLocalSentenceLength] = useState(sentenceLength);

  // Update local state when props change
  useEffect(() => {
    setLocalFromLanguage(fromLanguage);
    setLocalToLanguage(toLanguage);
    setLocalSentenceLength(sentenceLength);
  }, [fromLanguage, toLanguage, sentenceLength]);

  // Load suggested themes when modal opens or language changes
  useEffect(() => {
    if (isOpen) {
      loadSuggestedThemes();
    }
  }, [isOpen, localToLanguage]);

  const loadSuggestedThemes = async () => {
    setIsLoadingThemes(true);
    try {
      const themes = await generateThemes(localToLanguage, 5);
      setSuggestedThemes(themes);
    } catch (error) {
      console.error('Error loading suggested themes:', error);
      setSuggestedThemes([]);
    } finally {
      setIsLoadingThemes(false);
    }
  };

  const handleSelectCustomTheme = () => {
    if (customTheme.trim()) {
      onSelectTheme(customTheme.trim(), localFromLanguage, localToLanguage, localSentenceLength);
      setCustomTheme('');
    }
  };

  const handleSelectSuggestedTheme = (theme: string) => {
    onSelectTheme(theme, localFromLanguage, localToLanguage, localSentenceLength);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTheme.trim()) {
      handleSelectCustomTheme();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">
            Practice Settings & Theme
          </h2>
          
          <p className="text-xs text-slate-600 mb-4 text-center">
            Configure your practice session and choose a theme
          </p>

          {/* Language Settings */}
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">
                  From Language
                </label>
                <select
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={localFromLanguage}
                  onChange={(e) => setLocalFromLanguage(e.target.value)}
                >
                  {availableLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1">
                  To Language
                </label>
                <select
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={localToLanguage}
                  onChange={(e) => setLocalToLanguage(e.target.value)}
                >
                  {availableLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sentence Length */}
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-medium mb-1">
              Sentence Length
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLocalSentenceLength(Math.max(3, localSentenceLength - 1))}
                disabled={localSentenceLength <= 3}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                −
              </button>
              <div className="flex-1 text-center">
                <span className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                  {localSentenceLength} words
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLocalSentenceLength(Math.min(15, localSentenceLength + 1))}
                disabled={localSentenceLength >= 15}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* Custom Theme Input */}
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-medium mb-1">
              Custom Theme
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your own theme..."
                className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleSelectCustomTheme}
                disabled={!customTheme.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use
              </button>
            </div>
          </div>

          {/* Suggested Themes */}
          <div className="mb-4">
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Suggested Themes
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
                    className="w-full text-left p-2 text-sm border border-slate-200 rounded hover:bg-slate-50 hover:border-blue-300 transition-colors duration-200"
                  >
                    <span className="text-slate-700">{theme}</span>
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
          <div className="flex justify-between items-center">
            <button
              onClick={loadSuggestedThemes}
              disabled={isLoadingThemes}
              className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              🔄 Get New Suggestions
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-1 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};