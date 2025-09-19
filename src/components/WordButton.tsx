import * as React from 'react';

interface WordButtonProps {
  word: string;
  onClick: (word: string) => void;
  disabled?: boolean;
}

export const WordButton: React.FC<WordButtonProps> = ({ word, onClick, disabled = false }) => {
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
      {word}
    </button>
  );
};
