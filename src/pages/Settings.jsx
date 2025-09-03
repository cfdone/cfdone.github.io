import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { RefreshCw, Info } from 'lucide-react'
import Navbar from '../components/Navbar'
import logo from '../assets/logo.svg'

export default function Settings() {
  const navigate = useNavigate()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleResetOnboarding = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('onboardingComplete')
      localStorage.removeItem('timetableData')

      // Navigate back to splash/onboarding
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error resetting onboarding:', error)
    }
  }

  const getTimetableInfo = () => {
    try {
      const savedTimetableData = localStorage.getItem('timetableData')
      if (savedTimetableData) {
        const data = JSON.parse(savedTimetableData)
        if (data.studentType === 'regular') {
          return `${data.degree} • Semester ${data.semester} • Section ${data.section}`
        } else if (data.studentType === 'lagger') {
          return `Custom Timetable • ${data.subjects?.length || 0} subjects`
        }
      }
      return 'No timetable data'
    } catch {
      return 'Error loading data'
    }
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="min-h-full bg-black text-white pb-24">
          {/* Header */}
          <div className="p-2 pt-8 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-6 px-4">
              <div>
                <h1 className="font-product-sans text-white text-2xl font-medium mb-1">Settings</h1>
                <p className="text-accent font-product-sans">Manage your preferences</p>
              </div>
              <img src={logo} alt="" className="h-10 w-10" />
            </div>

            {/* Current Timetable Info */}
            <div className="px-4 mb-6">
              <div className="bg-white/5 p-4 rounded-xl border border-accent/10">
                <h3 className="font-product-sans text-accent font-medium text-lg mb-2">
                  Current Timetable
                </h3>
                <p className="text-white/70 text-sm font-product-sans mb-2">{getTimetableInfo()}</p>
                <div className="text-xs text-white/50">
                  You can change your timetable setup anytime by resetting onboarding
                </div>
              </div>
            </div>

            {/* Settings Options */}
            <div className="px-4 space-y-3">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full bg-white/5 p-4 rounded-xl border border-accent/10 hover:bg-white/20 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-base mb-1">Reset Timetable</h4>
                    <p className="text-white/70 text-sm font-product-sans">
                      Clear current setup and start onboarding again
                    </p>
                  </div>
                  <RefreshCw className="w-6 h-6 text-accent" />
                </div>
              </button>

              <div className="bg-white/5 p-4 rounded-xl border border-accent/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-base mb-1">About</h4>
                    <p className="text-white/70 text-sm font-product-sans">
                      CFDONE - FAST Timetable App
                    </p>
                    <p className="text-white/50 text-xs font-product-sans mt-1">Version 1.0.0</p>
                  </div>
                  <Info className="w-6 h-6 text-accent" />
                </div>
              </div>
            </div>
          </div>
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

      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40">
        <Navbar currentPage="settings" />
      </div>
    </div>
  )
}
