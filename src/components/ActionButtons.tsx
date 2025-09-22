import * as React from 'react';

interface ActionButtonsProps {
  onExplain: () => void;
  onBack: () => void;
  onRevealAnswer: () => void;
  onStatistics?: () => void; // Made optional
  showAnswer: boolean;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onExplain,
  onBack,
  onRevealAnswer,
  onStatistics,
  showAnswer,
  disabled = false
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center p-4">
      <button
        className="btn-secondary text-sm"
        onClick={onExplain}
        disabled={disabled}
      >
        💡 Explain
      </button>
      
      <button
        className="btn-secondary text-sm"
        onClick={onBack}
        disabled={disabled}
      >
        ← Back
      </button>
      
      <button
        className="btn-secondary text-sm"
        onClick={onRevealAnswer}
        disabled={disabled}
      >
        👁 Reveal Answer
      </button>
      
      {onStatistics && (
        <button
          className="btn-primary text-sm"
          onClick={onStatistics}
          disabled={disabled}
        >
          📊 Stats
        </button>
      )}
    </div>
  );
};
