import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import LoadingPulseOverlay from '../components/Loading'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const setSessionFromHash = async () => {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      
      if (access_token && refresh_token) {
        try {
          await supabase.auth.setSession({ access_token, refresh_token })
          
          const {
            data: { user },
          } = await supabase.auth.getUser()
          
          if (user) {
            // Clear any existing local data first to ensure clean sync
            localStorage.removeItem('timetableData')
            localStorage.removeItem('onboardingMode')
            localStorage.removeItem('onboardingComplete')

            const { data } = await supabase
              .from('user_timetables')
              .select('timetable_data, onboarding_mode')
              .eq('user_id', user.id)
              .single()
            
            if (data) {
              if (data.timetable_data) {
                localStorage.setItem('timetableData', JSON.stringify(data.timetable_data))
                localStorage.setItem('onboardingComplete', 'true')
              }
              if (data.onboarding_mode) {
                localStorage.setItem('onboardingMode', data.onboarding_mode)
              }
              setTimeout(() => navigate('/home'), 500)
            } else {
              // No timetable data found, go to onboarding
              setTimeout(() => navigate('/stepone'), 500)
            }
          } else {
            navigate('/login')
          }
        } catch (error) {
          console.error('Auth callback error:', error)
          navigate('/login')
        }
      } else {
        navigate('/login')
      }
    }
    setSessionFromHash()
  }, [navigate])

  return <LoadingPulseOverlay />
}
