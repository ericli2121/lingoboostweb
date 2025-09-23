import React from 'react';

interface ExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  isLoading: boolean;
  retryStatus?: string;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  isOpen,
  onClose,
  explanation,
  isLoading,
  retryStatus
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">💡 Explanation</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          <div className="text-slate-700">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <div className="ml-2">
                  <span>Loading explanation...</span>
                  {retryStatus && (
                    <div className="text-sm text-slate-500 mt-1">{retryStatus}</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{explanation}</p>
            )}
          </div>
          
          {!isLoading && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
