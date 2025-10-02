import * as React from 'react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">About RapidLingo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
            aria-label="Close about us"
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
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">RL</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">RapidLingo</h1>
              <p className="text-lg text-slate-600 mb-2">
                Accelerating Language Learning Through Interactive Practice
              </p>
              <p className="text-sm text-slate-500">
                Version 1.0.0 • Built with ❤️ for language learners worldwide
              </p>
            </div>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🌟 Our Mission</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <p className="text-slate-700 text-lg leading-relaxed">
                  At RapidLingo, we believe that language learning should be <strong>engaging, efficient, and accessible</strong> to everyone. 
                  Our mission is to break down language barriers by providing an innovative platform that combines 
                  artificial intelligence with proven learning methodologies to create personalized, interactive language experiences.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🚀 What Makes Us Different</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">AI-Powered Learning</h4>
                  <p className="text-slate-600">
                    Our advanced AI generates contextual, themed sentences that adapt to your learning level and interests.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a6.048 6.048 0 01-1.5 0m1.5-2.383a6.048 6.048 0 00-1.5 0m3.75 2.383a6.048 6.048 0 01-1.5 0m1.5-2.383a6.048 6.048 0 00-1.5 0" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Interactive Practice</h4>
                  <p className="text-slate-600">
                    Learn through hands-on sentence construction with immediate feedback and audio pronunciation.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Rapid Progress</h4>
                  <p className="text-slate-600">
                    Our focused approach helps you master sentence structure quickly through targeted practice.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Mobile-First</h4>
                  <p className="text-slate-600">
                    Designed for mobile learning with PWA support, so you can practice anywhere, anytime.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🎯 Our Approach</h3>
              <div className="space-y-4 text-slate-700">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-slate-800 mb-3">Themed Learning</h4>
                  <p className="text-slate-600 mb-3">
                    We organize vocabulary and sentences into practical themes like travel, work, food, and daily life. 
                    This contextual approach helps you learn words that are relevant to your interests and needs.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-slate-600">
                    <li>Customisable themes</li>
                    <li>Real-world vocabulary and phrases</li>
                    <li>Customisable difficulty levels</li>
                    <li>Cultural context and usage examples</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-slate-800 mb-3">Spaced Repetition</h4>
                  <p className="text-slate-600 mb-3">
                    Our system uses scientifically-proven spaced repetition techniques to help you retain information 
                    long-term. Sentences are repeated at optimal intervals to strengthen your memory.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-slate-600">
                    <li>Adaptive repetition schedules</li>
                    <li>Performance-based adjustments</li>
                    <li>Long-term retention focus</li>
                    <li>Personalized learning paths</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🛠️ Technology Stack</h3>
              <div className="space-y-4 text-slate-700">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <h4 className="text-lg font-medium text-blue-800 mb-2">Frontend</h4>
                    <p className="text-blue-600 text-sm">React 18 + TypeScript</p>
                    <p className="text-blue-600 text-sm">Tailwind CSS</p>
                    <p className="text-blue-600 text-sm">Vite</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <h4 className="text-lg font-medium text-green-800 mb-2">Backend</h4>
                    <p className="text-green-600 text-sm">Supabase</p>
                    <p className="text-green-600 text-sm">PostgreSQL</p>
                    <p className="text-green-600 text-sm">Real-time APIs</p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <h4 className="text-lg font-medium text-purple-800 mb-2">AI & Analytics</h4>
                    <p className="text-purple-600 text-sm">Mistral</p>
                    <p className="text-purple-600 text-sm">Google Analytics</p>
                    <p className="text-purple-600 text-sm">Performance Monitoring</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">👥 Our Team</h3>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                <p className="text-slate-700 mb-4">
                  RapidLingo is built by a passionate team of language educators, software engineers, and AI researchers 
                  who share a common vision: making language learning accessible, effective, and enjoyable for everyone.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-lg font-medium text-slate-800 mb-2">Our Expertise</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-slate-600">
                      <li>Language acquisition research</li>
                      <li>Educational technology design</li>
                      <li>Machine learning and AI</li>
                      <li>User experience optimization</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-slate-800 mb-2">Our Values</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-slate-600">
                      <li>Accessibility and inclusion</li>
                      <li>Evidence-based learning</li>
                      <li>User privacy and security</li>
                      <li>Continuous improvement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">📊 Impact & Statistics</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                  <p className="text-blue-800 font-medium">Learning Themes</p>
                  <p className="text-blue-600 text-sm">Covering diverse topics</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
                  <p className="text-green-800 font-medium">Languages</p>
                  <p className="text-green-600 text-sm">Supported worldwide</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">10000+</div>
                  <p className="text-purple-800 font-medium">Sentences</p>
                  <p className="text-purple-600 text-sm">AI-generated content</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🔮 Future Roadmap</h3>
              <div className="space-y-4 text-slate-700">
    {/*             <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-yellow-800 mb-2">Coming Soon</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-yellow-700">
                    <li>Voice recognition for pronunciation practice</li>
                    <li>Advanced grammar explanations and tips</li>
                    <li>Social features and learning communities</li>
                    <li>Offline mode for uninterrupted learning</li>
                  </ul>
                </div> */}
                
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-teal-800 mb-2">Long-term Vision</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-teal-700">
                    <li>AI-powered conversation practice</li>
                    <li>Personalized learning paths</li>
                    <li>Integration with popular language learning platforms</li>
                    <li>Advanced analytics and progress insights</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">📞 Contact & Support</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-slate-800 mb-3">Get in Touch</h4>
                    <div className="space-y-2 text-slate-600">
                      <p><strong>General Support:</strong> support@rapidlingo.com</p>
                      <p><strong>Technical Issues:</strong> tech@rapidlingo.com</p>
                      <p><strong>Feature Requests:</strong> feedback@rapidlingo.com</p>
                      <p><strong>Partnership:</strong> partnerships@rapidlingo.com</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-slate-800 mb-3">Follow Our Journey</h4>
                    <div className="space-y-2 text-slate-600">
                      <p>Stay updated with our latest features and language learning tips</p>
                      <p>Join our community of passionate language learners</p>
                      <p>Share your feedback to help us improve</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-200 pt-6 mt-8 text-center">
              <p className="text-lg font-medium text-slate-800 mb-2">Thank you for choosing RapidLingo!</p>
              <p className="text-slate-600">
                Together, we're making language learning faster, more effective, and more enjoyable.
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
