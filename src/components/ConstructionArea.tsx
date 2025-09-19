import * as React from 'react';
import { WordButton } from './WordButton';

interface ConstructionAreaProps {
  words: string[];
  onWordClick: (word: string) => void;
  isEmpty: boolean;
  onEmptySpaceClick?: () => void;
  completionStatus?: 'correct' | 'incorrect' | null;
}

export const ConstructionArea: React.FC<ConstructionAreaProps> = ({ 
  words, 
  onWordClick, 
  isEmpty,
  onEmptySpaceClick,
  completionStatus
}) => {
  console.log('ConstructionArea completionStatus:', completionStatus);
  
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!onEmptySpaceClick) return;
    onEmptySpaceClick();
  };

  return (
    <div 
      className={`construction-area ${!isEmpty ? 'has-words' : ''}`}
      onClick={handleContainerClick}
    >
      {isEmpty ? (
        <div className="text-slate-400 text-center w-full">
          Tap words below to build your sentence
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 w-full items-center">
          {words.map((word, index) => (
            <div key={`${word}-${index}`}>
              <WordButton
                word={word}
                onClick={onWordClick}
              />
            </div>
          ))}
          {completionStatus && (
            <div className="ml-2 flex-shrink-0">
              {completionStatus === 'correct' ? (
                <div className="text-green-500 text-2xl">✓</div>
              ) : (
                <div className="text-red-500 text-2xl">✗</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
