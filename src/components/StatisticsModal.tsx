import * as React from 'react';
import { Statistics } from '../types';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: Statistics;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  onClose,
  statistics
}) => {
  const accuracy = statistics.totalAttempts > 0 
    ? Math.round((statistics.sentencesCompleted / statistics.totalAttempts) * 100)
    : 0;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-lg p-6 z-50 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Statistics</h2>
          <button
            className="text-slate-400 hover:text-slate-600 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Sentences Completed</span>
            <span className="text-xl font-bold text-primary-600">
              {statistics.sentencesCompleted}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Total Attempts</span>
            <span className="text-xl font-bold text-slate-800">
              {statistics.totalAttempts}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Accuracy</span>
            <span className="text-xl font-bold text-green-600">
              {accuracy}%
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Current Streak</span>
            <span className="text-xl font-bold text-orange-600">
              {statistics.streak}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Best Streak</span>
            <span className="text-xl font-bold text-purple-600">
              {statistics.bestStreak}
            </span>
          </div>
        </div>
        
        <button
          className="w-full mt-6 btn-primary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </>
  );
};
