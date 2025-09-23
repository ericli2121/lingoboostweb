import * as React from 'react';
import { WordItem } from '../types';

interface WordButtonProps {
  word: WordItem;
  onClick: (word: WordItem) => void;
  disabled?: boolean;
}

export const WordButton: React.FC<WordButtonProps> = ({ word,  onClick, disabled = false }) => {
  const handleClick = () => {
    if (!disabled) {
      onClick(word);
    }
  };

  return (
    <button
      className="word-button"
      onClick={handleClick}
      disabled={disabled}
    >
      {word.word}
    </button>
  );
};
