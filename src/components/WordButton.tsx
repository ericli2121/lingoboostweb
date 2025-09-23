import * as React from 'react';

interface WordButtonProps {
  word: string;
  index: number;
  onClick: (word: string, index: number) => void;
  disabled?: boolean;
}

export const WordButton: React.FC<WordButtonProps> = ({ word, onClick, disabled = false }) => {
  const handleClick = () => {
    if (!disabled) {
      onClick(word, index);
    }
  };

  return (
    <button
      className="word-button"
      onClick={handleClick}
      disabled={disabled}
    >
      {word}
    </button>
  );
};
