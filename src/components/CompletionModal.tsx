import * as React from 'react';

interface CompletionModalProps {
  isOpen: boolean;
  onNext: () => void;
  onReplay: () => void;
  sentence: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onNext,
  onReplay,
  sentence
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">
          🎉
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Excellent!
        </h2>
        
        <p className="text-slate-600 mb-4">
          You correctly built:
        </p>
        
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-lg font-medium text-primary-800">
            {sentence}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            className="flex-1 btn-secondary"
            onClick={onReplay}
          >
            🔄 Replay
          </button>
          
          <button
            className="flex-1 btn-primary"
            onClick={onNext}
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
};
