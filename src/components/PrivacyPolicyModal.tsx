import * as React from 'react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
            aria-label="Close privacy policy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-slate max-w-none">
            <p className="text-sm text-slate-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">1. Information We Collect</h3>
              <div className="space-y-4 text-slate-700">
                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Account Information</h4>
                  <p>When you create an account with RapidLingo, we collect:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Email address (for authentication and account management)</li>
                    <li>Profile information (name, avatar) provided by your authentication provider</li>
                    <li>Account preferences and settings</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Learning Data</h4>
                  <p>To provide personalized learning experiences, we collect:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Language learning progress and statistics</li>
                    <li>Exercise completion data and accuracy rates</li>
                    <li>Theme preferences and learning patterns</li>
                    <li>Session duration and frequency of use</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Technical Information</h4>
                  <p>We automatically collect certain technical information:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Device information (browser type, operating system)</li>
                    <li>IP address and general location data</li>
                    <li>Usage analytics and performance metrics</li>
                    <li>Error logs and debugging information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">2. How We Use Your Information</h3>
              <div className="space-y-4 text-slate-700">
                <p>We use the collected information to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Provide Services:</strong> Deliver personalized language learning exercises and track your progress</li>
                  <li><strong>Improve Experience:</strong> Analyze usage patterns to enhance our learning algorithms and user interface</li>
                  <li><strong>Account Management:</strong> Maintain your account, process authentication, and manage preferences</li>
                  <li><strong>Communication:</strong> Send important updates about the service and respond to your inquiries</li>
                  <li><strong>Analytics:</strong> Understand how our service is used to make data-driven improvements</li>
                  <li><strong>Security:</strong> Protect against fraud, abuse, and unauthorized access</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">3. Data Storage and Security</h3>
              <div className="space-y-4 text-slate-700">
                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Data Storage</h4>
                  <p>Your data is stored securely using industry-standard practices:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Data is encrypted in transit and at rest</li>
                    <li>We use secure cloud infrastructure with regular security updates</li>
                    <li>Access to your data is restricted to authorized personnel only</li>
                    <li>Regular backups ensure data integrity and availability</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Data Retention</h4>
                  <p>We retain your information for as long as necessary to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Provide our services to you</li>
                    <li>Comply with legal obligations</li>
                    <li>Resolve disputes and enforce agreements</li>
                    <li>Improve our services through analytics</li>
                  </ul>
                  <p className="mt-2">You can request deletion of your account and associated data at any time.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">4. Third-Party Services</h3>
              <div className="space-y-4 text-slate-700">
                <p>We use the following third-party services that may collect information:</p>
                
                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Authentication</h4>
                  <p>We use Supabase for user authentication. When you sign in, Supabase may collect:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Email address and authentication credentials</li>
                    <li>Profile information from social login providers</li>
                    <li>Authentication logs and security events</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Analytics</h4>
                  <p>We use analytics services to understand usage patterns and improve our service:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Anonymous usage statistics and performance metrics</li>
                    <li>Error tracking and debugging information</li>
                    <li>User interaction patterns (anonymized)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-slate-800 mb-2">Advertising</h4>
                  <p>We display advertisements through Google AdSense:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Ad personalization based on your interests (if you've opted in)</li>
                    <li>Ad performance and click-through data</li>
                    <li>General demographic information for ad targeting</li>
                  </ul>
                  <p className="mt-2 text-sm">You can opt out of personalized ads in your browser settings or through Google's Ad Settings.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">5. Your Rights and Choices</h3>
              <div className="space-y-4 text-slate-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we have about you</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate personal information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Portability:</strong> Export your learning data in a machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
                  <li><strong>Restriction:</strong> Limit how we process your personal information</li>
                </ul>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-blue-800">
                    <strong>To exercise these rights:</strong> Contact us at privacy@rapidlingo.com or use the account settings in your profile.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">6. Cookies and Tracking</h3>
              <div className="space-y-4 text-slate-700">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Remember your login status and preferences</li>
                  <li>Analyze usage patterns and improve our service</li>
                  <li>Provide personalized content and advertisements</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-slate-700">
                    <strong>Cookie Controls:</strong> You can manage cookies through your browser settings. 
                    Note that disabling certain cookies may affect the functionality of our service.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">7. Children's Privacy</h3>
              <div className="space-y-4 text-slate-700">
                <p>
                  RapidLingo is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If you are a parent or guardian and believe 
                  your child has provided us with personal information, please contact us immediately.
                </p>
                <p>
                  If we discover that we have collected personal information from a child under 13, 
                  we will take steps to delete such information promptly.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">8. International Data Transfers</h3>
              <div className="space-y-4 text-slate-700">
                <p>
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure that such transfers comply with applicable data protection laws and implement 
                  appropriate safeguards to protect your personal information.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">9. Changes to This Policy</h3>
              <div className="space-y-4 text-slate-700">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material 
                  changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                <p>
                  Your continued use of RapidLingo after any changes to this Privacy Policy will constitute 
                  your acceptance of such changes.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">10. Contact Us</h3>
              <div className="space-y-4 text-slate-700">
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p><strong>Email:</strong> privacy@rapidlingo.com</p>
                  <p><strong>General Support:</strong> support@rapidlingo.com</p>
                  <p><strong>Data Protection Officer:</strong> dpo@rapidlingo.com</p>
                </div>
              </div>
            </section>

            <div className="border-t border-slate-200 pt-6 mt-8">
              <p className="text-sm text-slate-500 text-center">
                This Privacy Policy is effective as of {new Date().toLocaleDateString()} and applies to all users of RapidLingo.
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
