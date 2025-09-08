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
