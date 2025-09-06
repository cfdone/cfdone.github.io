import React, { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [envVars, setEnvVars] = useState({})

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        const envCheck = {
          VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.slice(0, 30) + '...',
          anonKeyPrefix: import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 10) + '...'
        }
        setEnvVars(envCheck)

        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          setConnectionStatus('missing_env')
          return
        }

        // Test connection to Supabase
        const { error } = await supabase.from('user_timetables').select('count', { count: 'exact', head: true })
        
        if (error) {
          console.error('Supabase connection test failed:', error)
          setConnectionStatus('error')
        } else {
          console.log('Supabase connection test successful')
          setConnectionStatus('connected')
        }
      } catch (error) {
        console.error('Supabase connection test exception:', error)
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [])

  if (import.meta.env.MODE === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-3 rounded-lg border border-gray-600 max-w-sm text-xs z-50">
      <div className="font-bold text-sm mb-2">Supabase Status</div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Connection:</span>
          <span className={
            connectionStatus === 'connected' ? 'text-green-400' :
            connectionStatus === 'testing' ? 'text-blue-400' :
            connectionStatus === 'missing_env' ? 'text-yellow-400' : 'text-red-400'
          }>
            {connectionStatus === 'connected' ? '✓ Connected' :
             connectionStatus === 'testing' ? '⏳ Testing...' :
             connectionStatus === 'missing_env' ? '⚠️ Missing Env' : '✗ Error'}
          </span>
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          <div>URL: {envVars.VITE_SUPABASE_URL ? '✓' : '✗'}</div>
          <div>Key: {envVars.VITE_SUPABASE_ANON_KEY ? '✓' : '✗'}</div>
          {envVars.supabaseUrl && (
            <div className="text-gray-500">{envVars.supabaseUrl}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupabaseConnectionTest
