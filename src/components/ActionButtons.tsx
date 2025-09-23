import * as React from 'react';
import { speechService } from '../utils/speech';

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
  const [isMuted, setIsMuted] = React.useState(speechService.isSpeechMuted());
  const [speechRate, setSpeechRate] = React.useState(speechService.getSpeechRate());

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    speechService.setMuted(newMuted);
  };

  const handleSpeedChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRate = parseFloat(event.target.value);
    setSpeechRate(newRate);
    speechService.setSpeechRate(newRate);
  };

  return (
    <div className="space-y-3 p-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          className="btn-secondary text-sm"
          onClick={onBack}
          disabled={disabled}
        >
          ← Back
        </button>
        <button
          className="btn-secondary text-sm"
          onClick={onExplain}
          disabled={disabled}
        >
          💡 Explain
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

      {/* Audio Controls */}
      <div className="flex items-center justify-center gap-4 bg-slate-50 rounded-lg p-3">
        {/* Mute Button */}
        <button
          className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
            isMuted 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          onClick={handleMuteToggle}
          disabled={disabled}
          title={isMuted ? 'Unmute speech' : 'Mute speech'}
        >
          {isMuted ? '🔇' : '🔊'}
          <span>{isMuted ? 'Muted' : 'Sound on'}</span>
        </button>

        {/* Speed Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">Speed:</span>
          <select
            value={speechRate}
            onChange={handleSpeedChange}
            disabled={disabled}
            className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.7}>0.7x</option>
            <option value={0.9}>0.9x</option>
            <option value={1.0}>1.0x</option>
            <option value={1.2}>1.2x</option>
            <option value={1.5}>1.5x</option>
          </select>
          <span className="text-xs font-extralight">powered by <a href="https://mistral.ai/" target='_blank'>Mistral AI</a></span>
        </div>
      </div>
    </div>
  );
};
