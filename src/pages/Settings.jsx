import { useNavigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import {
  RefreshCw,
  Info,
  FileText,
  Shield,
  ExternalLink,
  Mail,
  Heart,
  ChevronRight,
  ChevronDown,
  Trash2,
  LogOut,
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.svg'

export default function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [expandedAccordion, setExpandedAccordion] = useState(null)

  const toggleAccordion = (accordion) => {
    setExpandedAccordion(expandedAccordion === accordion ? null : accordion)
  }

  const handleResetOnboarding = useCallback(() => {
    try {
      // Clear localStorage
      localStorage.removeItem('onboardingComplete')
      localStorage.removeItem('timetableData')

      // Navigate back to splash/onboarding
      navigate('/splash', { replace: true })
    } catch (error) {
      console.error('Error resetting onboarding:', error)
    }
  }, [navigate])
  
  const handleClearCache = useCallback(async () => {
    try {
      // Clear application cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      }
      
      // Refresh the application
      setTimeout(() => {
        window.location.reload(true); // Force refresh from server, not from cache
      }, 300);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
    setShowClearCacheConfirm(false);
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
    }
    setShowLogoutConfirm(false)
  }, [signOut, navigate])

  const getTimetableInfo = useCallback(() => {
    try {
      const savedTimetableData = localStorage.getItem('timetableData')
      if (savedTimetableData) {
        const data = JSON.parse(savedTimetableData)
        if (data.studentType === 'regular') {
          // More detailed info for regular students
          let countClasses = 0;
          if (data.timetable || data.passtimetable) {
            const schedule = data.timetable || data.passtimetable || {};
            Object.keys(schedule).forEach(day => {
              if (Array.isArray(schedule[day])) {
                countClasses += schedule[day].length;
              }
            });
          }
          return `${data.degree} • Semester ${data.semester} • Section ${data.section}\n${countClasses} classes per week`;
        } else if (data.studentType === 'lagger') {
          // More detailed info for lagger students
          const subjects = data.subjects || [];
          return `Custom Timetable\n${subjects.length || 0} subjects selected\n${subjects.map(s => s.name).join('\n')}`;
        }
      }
      return 'No timetable data'
    } catch {
      return 'Error loading data'
    }
  }, [])

  const handleExternalLink = useCallback(url => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <div className="fixed inset-0 bg-black">
      {/* Simplified background decoration - same as Home.jsx */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-48 h-48 bg-accent/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-64 h-64 bg-purple-500/2 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 pt-12 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-product-sans text-white text-2xl font-medium mb-1">Settings</h1>
              <p className="text-accent font-product-sans">Manage your preferences</p>
            </div>
            <img src={logo} alt="" className="h-10 w-10" />
          </div>

        
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto no-scrollbar p-4 max-w-md mx-auto text-white">
            {/* Account Section */}
            {user && (
              <div className="mb-6">
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Account
                </h2>
                <div className="bg-white/5 p-4 rounded-xl border border-accent/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {user.user_metadata?.avatar_url ? (
                        <img 
                          src={user.user_metadata.avatar_url} 
                          alt="Profile" 
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-accent/20 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-accent font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-white/70 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5 text-white/70" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Current Timetable Section */}
            <div className="mb-6">
              <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                Current Timetable
              </h2>
              <div className="bg-white/5 p-4 rounded-xl border border-accent/10">
                <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-white/70 text-sm font-product-sans mb-2">{getTimetableInfo()}</p>
                  <div className="text-xs text-white/50 mb-1">
                    You can change your timetable setup anytime by resetting onboarding
                  </div>
                </div>
              </div>
            </div>
            {/* Settings Options */}
            <div className="space-y-3">
              {/* Timetable Section */}
              <div className="mb-6">
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Timetable
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full bg-white/5 p-4 rounded-xl border border-accent/10 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <RefreshCw className="w-5 h-5 text-accent mr-3" />
                        <div>
                          <h4 className="text-white font-medium text-base mb-1">Reset Timetable</h4>
                          <p className="text-white/70 text-sm font-product-sans">
                            Clear current setup and start onboarding again
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30" />
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setShowClearCacheConfirm(true)}
                    className="w-full bg-white/5 p-4 rounded-xl border border-accent/10 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Trash2 className="w-5 h-5 text-accent mr-3" />
                        <div>
                          <h4 className="text-white font-medium text-base mb-1">Clear Cache & Refresh</h4>
                          <p className="text-white/70 text-sm font-product-sans">
                            Delete cached data and refresh the application
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30" />
                    </div>
                  </button>
                </div>
              </div>

              {/* About Section */}
              <div className="mb-6">
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Information
                </h2>
                <div className="space-y-2">
                  {/* About Accordion */}
                  <div className="bg-white/5 rounded-xl border border-accent/10 overflow-hidden">
                    <button
                      onClick={() => toggleAccordion('about')}
                      className="w-full p-4 hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Info className="w-5 h-5 text-accent mr-3" />
                          <div>
                            <h4 className="text-white font-medium text-base mb-1">About CFDONE</h4>
                            <p className="text-white/70 text-sm font-product-sans">
                              App information and version details
                            </p>
                          </div>
                        </div>
                        {expandedAccordion === 'about' ? (
                          <ChevronDown className="w-5 h-5 text-white/30" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white/30" />
                        )}
                      </div>
                    </button>
                    {expandedAccordion === 'about' && (
                      <div className="px-4 pb-4 border-t border-white/10">
                        <div className="pt-4">
                          <div className="text-center mb-4">
                            <img src={logo} alt="" className="h-16 w-16 mx-auto mb-4" />
                            <h3 className="font-product-sans text-accent font-medium text-xl mb-2">CFDONE</h3>
                            <p className="text-white/70 text-sm font-product-sans mb-4">
                              A modern timetable app for FAST University students
                            </p>
                            <div className="text-white/50 text-xs font-product-sans space-y-1">
                              <p>Version 1.0.0</p>
                              <p>Built with React & Vite</p>
                              <p>Developed by Ajmal Razaq</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms & Conditions Accordion */}
                  <div className="bg-white/5 rounded-xl border border-accent/10 overflow-hidden">
                    <button
                      onClick={() => toggleAccordion('terms')}
                      className="w-full p-4 hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-accent mr-3" />
                          <div>
                            <h4 className="text-white font-medium text-base">Terms & Conditions</h4>
                          </div>
                        </div>
                        {expandedAccordion === 'terms' ? (
                          <ChevronDown className="w-5 h-5 text-white/30" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white/30" />
                        )}
                      </div>
                    </button>
                    {expandedAccordion === 'terms' && (
                      <div className="px-4 pb-4 border-t border-white/10">
                        <div className="pt-4 max-h-64 overflow-y-auto no-scrollbar">
                          <div className="text-white/70 text-sm font-product-sans space-y-4">
                            <p>
                              By using CFDONE, you agree to these terms and conditions. This app is designed
                              specifically for FAST University students to manage their timetables.
                            </p>
                            <p>
                              <strong className="text-white">Google Authentication:</strong> When you sign in with Google, 
                              we only access your basic profile information (name, email, profile picture) to provide 
                              authentication services. We do not access your Google Drive, Gmail, or other Google services.
                            </p>
                            <p>
                              <strong className="text-white">Usage:</strong> This app is provided as-is for
                              educational purposes. We are not responsible for any scheduling conflicts or missed
                              classes.
                            </p>
                            <p>
                              <strong className="text-white">Data:</strong> All timetable data is stored locally
                              on your device. We do not collect or store any personal information on external
                              servers beyond what's necessary for authentication.
                            </p>
                            <p>
                              <strong className="text-white">Account Information:</strong> Your Google account information 
                              is used solely for authentication and personalization purposes. You can revoke access at 
                              any time through your Google account settings.
                            </p>
                            <p>
                              <strong className="text-white">Updates:</strong> The app may receive updates to
                              improve functionality and fix bugs. Continued use implies acceptance of updated
                              terms.
                            </p>
                            <p>
                              <strong className="text-white">Contact:</strong> For any issues or questions,
                              please contact the developer through the provided channels.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Privacy Policy Accordion */}
                  <div className="bg-white/5 rounded-xl border border-accent/10 overflow-hidden">
                    <button
                      onClick={() => toggleAccordion('privacy')}
                      className="w-full p-4 hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-accent mr-3" />
                          <div>
                            <h4 className="text-white font-medium text-base">Privacy Policy</h4>
                          </div>
                        </div>
                        {expandedAccordion === 'privacy' ? (
                          <ChevronDown className="w-5 h-5 text-white/30" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white/30" />
                        )}
                      </div>
                    </button>
                    {expandedAccordion === 'privacy' && (
                      <div className="px-4 pb-4 border-t border-white/10">
                        <div className="pt-4 max-h-64 overflow-y-auto no-scrollbar">
                          <div className="text-white/70 text-sm font-product-sans space-y-4">
                            <p>
                              Your privacy is important to us. This policy explains how CFDONE handles your
                              information.
                            </p>
                            <p>
                              <strong className="text-white">Google Sign-In:</strong> When you use Google Sign-In, 
                              we receive and store only your basic profile information (name, email address, and 
                              profile picture). This information is used for authentication and personalization purposes only.
                            </p>
                            <p>
                              <strong className="text-white">Data Collection:</strong> Beyond Google authentication data, 
                              we do not collect, store, or transmit any additional personal data to external servers. 
                              All timetable information remains on your device.
                            </p>
                            <p>
                              <strong className="text-white">Local Storage:</strong> Your timetable preferences
                              and settings are stored locally using your browser's localStorage feature. This data 
                              never leaves your device.
                            </p>
                            <p>
                              <strong className="text-white">Google Data Usage:</strong> We do not access your Google Drive, 
                              Gmail, calendar, or any other Google services. We only use the minimal profile information 
                              necessary for authentication.
                            </p>
                            <p>
                              <strong className="text-white">Third-Party Services:</strong> We use Supabase for authentication 
                              services, which handles your Google sign-in securely. No other third-party tracking or analytics 
                              services are used.
                            </p>
                            <p>
                              <strong className="text-white">Data Retention:</strong> Your authentication data is retained 
                              only as long as you maintain an account. You can delete your account and all associated data 
                              at any time.
                            </p>
                            <p>
                              <strong className="text-white">Data Security:</strong> All authentication is handled through 
                              secure, encrypted connections. Local data is under your full control and can be cleared 
                              anytime by resetting the app.
                            </p>
                            <p>
                              <strong className="text-white">Your Rights:</strong> You can access, modify, or delete your 
                              account information at any time. You can also revoke app access through your Google account 
                              settings.
                            </p>
                            <p>
                              <strong className="text-white">Changes:</strong> Any changes to this privacy policy
                              will be reflected in app updates and communicated to users.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Developer Section */}
              <div className="mb-6">
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Developer
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => handleExternalLink('mailto:theajmalrazaq@gmail.com')}
                    className="w-full bg-white/5 p-4 rounded-xl border border-accent/10 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-accent mr-3" />
                        <div>
                          <h4 className="text-white font-medium text-base mb-1">Contact Developer</h4>
                          <p className="text-white/70 text-sm font-product-sans">
                            Report bugs or suggest features
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/30" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Support Section */}
              <div className="mb-20">
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Support
                </h2>
                <div className="bg-white/5 p-4 rounded-xl border border-accent/10">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-red-500 mr-3" />
                    <div>
                      <h4 className="text-white font-medium text-base mb-1">Made with frustration by Ajmal Razaq Bhatti</h4>
                      <p className="text-white/70 text-sm font-product-sans">
                        Sometimes the best apps come from the most frustrating experiences!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navbar */}
        <div className="flex-shrink-0 flex justify-center px-4">
          <Navbar currentPage="settings" />
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-black border border-accent/20 rounded-xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <h3 className="font-product-sans text-accent font-medium text-xl mb-2">
                Reset Timetable?
              </h3>
              <p className="text-white/70 text-sm font-product-sans">
                This will clear your current timetable setup and take you back to onboarding. You'll
                need to set up your timetable again.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl font-product-sans hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetOnboarding}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-product-sans hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Clear Cache Confirmation Modal */}
      {showClearCacheConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-black border border-accent/20 rounded-xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <h3 className="font-product-sans text-accent font-medium text-xl mb-2">
                Clear Cache & Refresh?
              </h3>
              <p className="text-white/70 text-sm font-product-sans">
                This will delete all cached data and refresh the application. This can help if you're experiencing display issues or outdated content.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearCacheConfirm(false)}
                className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl font-product-sans hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-product-sans hover:bg-red-600 transition-colors"
              >
                Clear & Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-black border border-accent/20 rounded-xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <h3 className="font-product-sans text-accent font-medium text-xl mb-2">
                Sign Out?
              </h3>
              <p className="text-white/70 text-sm font-product-sans">
                You will be signed out of your account. Your timetable data will remain saved locally.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl font-product-sans hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-product-sans hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
  