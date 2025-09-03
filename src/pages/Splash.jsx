import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import logo from '../assets/logo.svg'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if onboarding is completed
    const checkOnboardingStatus = () => {
      try {
        const isOnboardingComplete = localStorage.getItem('onboardingComplete')
        const savedTimetableData = localStorage.getItem('timetableData')

        if (isOnboardingComplete === 'true' && savedTimetableData) {
          const timetableData = JSON.parse(savedTimetableData)
          // Navigate directly to home with saved data
          navigate('/', {
            state: timetableData,
            replace: true,
          })
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        // Continue to splash screen if there's an error
      }
    }

    // Small delay to show splash screen briefly
    const timer = setTimeout(checkOnboardingStatus, 1000)

    return () => clearTimeout(timer)
  }, [navigate])
  return (
    <>
      <div className="h-screen bg-black  flex flex-col justify-between items-center px-4 pt-safe-offset-8 pb-safe">
        <div className=" flex flex-col items-center gap-6 px-4 py-6 w-full max-w-md mx-auto">
          <h1 className=" font-product-sans text-accent font-black text-2xl mb-2 text-center">
            FAST Timetable <span className="text-accent">Sucks?</span>
            <br />
            <span className="text-sm font-light font-product-sans">Yeah, we feel your pain!</span>
          </h1>
        </div>
        <img src={logo} alt="Logo" className="w-54 h-54 user-select-none mb-2" />
        <div className="flex flex-col gap-3 items-center justify-center w-full max-w-md mx-auto px-2 pb-6">
          <p className="text-white font-product-sans">Let’s fix this mess in 2 minutes flat!</p>
          <button
            className="bg-accent font-product-sans text-white px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md"
            onClick={() => navigate('/stepone')}
          >
            Let's Fix This!
          </button>
        </div>
      </div>
    </>
  )
}
