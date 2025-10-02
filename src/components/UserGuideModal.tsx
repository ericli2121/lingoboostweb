import * as React from 'react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">User Guide</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
            aria-label="Close user guide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-slate max-w-none">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-4">Welcome to RapidLingo!</h1>
              <p className="text-lg text-slate-600">
                Your personal language learning companion for mastering sentence construction
              </p>
            </div>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🎯 Getting Started</h3>
              <div className="space-y-4 text-slate-700">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">Step 1: Choose Your Theme</h4>
                  <p className="text-blue-700">
                    Select from 60+ themed sentence collections like "Travel", "Food", "Work", or "Daily Life". 
                    Each theme contains carefully curated sentences to help you learn vocabulary in context.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-green-800 mb-2">Step 2: Set Your Preferences</h4>
                  <p className="text-green-700">
                    Choose your source language (English) and target language (Spanish, French, German, etc.), 
                    select sentence length (3-8 words), and set the number of exercises you want to practice.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-purple-800 mb-2">Step 3: Start Learning</h4>
                  <p className="text-purple-700">
                    Once your session begins, you'll see scrambled words that you need to arrange into the correct sentence 
                    based on the English reference shown at the top.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🎮 How to Play</h3>
              <div className="space-y-4 text-slate-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-slate-800 mb-2">📝 English Reference</h4>
                    <p className="text-slate-600">
                      The English sentence at the top shows you what you need to translate. Use this as your guide 
                      to understand the meaning and structure.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-slate-800 mb-2">🔤 Scrambled Words</h4>
                    <p className="text-slate-600">
                      Click on words in the bottom area to add them to your sentence. Each word plays audio 
                      when clicked to help with pronunciation.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-slate-800 mb-2">🏗️ Construction Area</h4>
                    <p className="text-slate-600">
                      The middle area is where you build your sentence. Click words to add them, or click 
                      on placed words to remove them.
                    </p>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-slate-800 mb-2">✅ Check Your Answer</h4>
                    <p className="text-slate-600">
                      When you think your sentence is correct, the system will automatically check it. 
                      You'll see green for correct or red for incorrect.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🎛️ Controls & Features</h3>
              <div className="space-y-4 text-slate-700">
                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Action Buttons</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>← Back:</strong> Return to the previous sentence</li>
                    <li><strong>🔊 Explain:</strong> Get a detailed explanation of the sentence structure and grammar</li>
                    <li><strong>👁️ Show Answer:</strong> Reveal the correct answer if you're stuck</li>
                    <li><strong>📊 Statistics:</strong> View your learning progress and accuracy</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Audio Controls</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>🔇 Mute/Unmute:</strong> Toggle audio on/off</li>
                    <li><strong>Speed Control:</strong> Adjust speech rate (0.5x to 2x speed)</li>
                    <li><strong>Auto-play:</strong> Words automatically play audio when clicked</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Profile Menu</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>📈 History:</strong> View your completed exercises and progress</li>
                    <li><strong>⚙️ Settings:</strong> Change languages, difficulty, and preferences</li>
                    <li><strong>📋 Privacy Policy:</strong> Learn about how we protect your data</li>
                    <li><strong>ℹ️ About Us:</strong> Learn more about RapidLingo</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">📈 Tracking Your Progress</h3>
              <div className="space-y-4 text-slate-700">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-yellow-800 mb-2">Session Statistics</h4>
                  <p className="text-yellow-700">
                    Track your progress in real-time with session counters showing completed sentences, 
                    accuracy rates, and current position in your exercise queue.
                  </p>
                </div>
                
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-indigo-800 mb-2">Learning History</h4>
                  <p className="text-indigo-700">
                    Access your complete learning history to review past exercises, see improvement over time, 
                    and identify areas that need more practice.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">💡 Tips for Success</h3>
              <div className="space-y-4 text-slate-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-emerald-800 mb-2">🎯 Start Simple</h4>
                    <p className="text-emerald-700">
                      Begin with 3-word sentences and gradually increase complexity as you build confidence.
                    </p>
                  </div>
                  
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-rose-800 mb-2">🔊 Use Audio</h4>
                    <p className="text-rose-700">
                      Listen to each word's pronunciation to improve your speaking skills and accent.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-amber-800 mb-2">📚 Learn Themes</h4>
                    <p className="text-amber-700">
                      Focus on specific themes to build vocabulary in areas that interest you most.
                    </p>
                  </div>
                  
                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-cyan-800 mb-2">🔄 Practice Regularly</h4>
                    <p className="text-cyan-700">
                      Consistent daily practice, even for just 10-15 minutes, yields the best results.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">❓ Troubleshooting</h3>
              <div className="space-y-4 text-slate-700">
                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Common Issues</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Audio not playing:</strong> Check your browser's audio permissions and ensure your device volume is up</li>
                    <li><strong>Slow loading:</strong> Check your internet connection; exercises are generated using AI</li>
                    <li><strong>Can't progress:</strong> Make sure you've completed the current sentence before moving to the next</li>
                    <li><strong>Wrong answer:</strong> Use the "Explain" button to understand the correct sentence structure</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-red-800 mb-2">Need Help?</h4>
                  <p className="text-red-700">
                    If you're experiencing technical issues or have questions about using RapidLingo, 
                    please contact our support team at support@rapidlingo.com
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🚀 Advanced Features</h3>
              <div className="space-y-4 text-slate-700">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">🎨 Theme Customization</h4>
                  <p className="text-blue-700">
                    Switch between different themes during your session to keep learning fresh and engaging. 
                    Each theme focuses on specific vocabulary areas and real-world scenarios.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-green-800 mb-2">📱 Mobile Optimization</h4>
                  <p className="text-green-700">
                    RapidLingo is fully optimized for mobile devices. Install it as a PWA (Progressive Web App) 
                    for a native app-like experience on your phone or tablet.
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-200 pt-6 mt-8 text-center">
              <p className="text-lg font-medium text-slate-800 mb-2">Ready to start your language learning journey?</p>
              <p className="text-slate-600">
                Choose a theme and begin practicing! Remember, consistency is key to mastering any language.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
