import * as React from 'react';
import { useState, useEffect } from 'react';
import { fetchUserHistory, CompletedSentenceRecord } from '../utils/translations';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  fromLanguage: string;
  toLanguage: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  fromLanguage,
  toLanguage
}) => {
  const [history, setHistory] = useState<CompletedSentenceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadHistory();
    }
  }, [isOpen, userId, fromLanguage, toLanguage]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Loading history for ${fromLanguage} -> ${toLanguage}`);
      const historyData = await fetchUserHistory(userId, fromLanguage, toLanguage);
      setHistory(historyData);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history. Please try again.');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Translation History
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-slate-600 mb-4">
            Your completed translations for {fromLanguage} → {toLanguage}
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={loadHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No translation history found for this language pair.</p>
              <p className="text-sm text-slate-400 mt-2">Complete some exercises to see your history here!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((entry) => (
                <div
                  key={entry.id || entry.created_at}
                  className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-slate-700 font-medium">{entry.from_sentence}</p>
                      <p className="text-blue-600 mt-1">{entry.to_sentence}</p>
                    </div>
                    {entry.number_of_times_correct && entry.number_of_times_correct > 1 && (
                      <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">
                        {entry.number_of_times_correct}x correct
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};