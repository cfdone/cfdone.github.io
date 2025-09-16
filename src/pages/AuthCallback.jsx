import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'

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
            const { data } = await supabase
              .from('user_timetables')
              .select('timetable_data, onboarding_mode')
              .eq('user_id', user.id)
              .single()
            if (data) {
              if (data.timetable_data) {
                localStorage.setItem('timetableData', JSON.stringify(data.timetable_data))
              }
              if (data.onboarding_mode) {
                localStorage.setItem('onboardingMode', data.onboarding_mode)
                localStorage.setItem('onboardingComplete', 'true')
              }
            }
          }
        } catch (e) {
          console.error('AuthCallback: error setting session', e)
        }
      }
      navigate('/home', { replace: true })
    }
    setSessionFromHash()
  }, [navigate])

  return <div>Signing you in...</div>
}
