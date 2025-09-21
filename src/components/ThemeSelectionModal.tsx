import * as React from 'react';
import { useState, useEffect } from 'react';
import { generateThemes } from '../utils/api';

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: string) => void;
  toLanguage: string;
}

export const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTheme,
  toLanguage
}) => {
  const [customTheme, setCustomTheme] = useState('');
  const [suggestedThemes, setSuggestedThemes] = useState<string[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);

  // Load suggested themes when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSuggestedThemes();
    }
  }, [isOpen, toLanguage]);

  const loadSuggestedThemes = async () => {
    setIsLoadingThemes(true);
    try {
      const themes = await generateThemes(toLanguage, 5);
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
      onSelectTheme(customTheme.trim());
      setCustomTheme('');
    }
  };

  const handleSelectSuggestedTheme = (theme: string) => {
    onSelectTheme(theme);
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
            Choose Your Next Theme
          </h2>
          
          <p className="text-xs text-slate-600 mb-4 text-center">
            Select a theme for your next set of practice sentences
          </p>

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