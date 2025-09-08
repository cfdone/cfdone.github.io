import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './useAuth'

const TIMETABLE_STORAGE_KEY = 'timetableData'
const ONBOARDING_MODE_KEY = 'onboardingMode'
const SYNC_STATUS_KEY = 'syncStatus'

const useTimetableSync = () => {
  const { user } = useAuth()
  const SESSION_SYNC_KEY = 'timetableSynced'
  const [syncStatus, setSyncStatus] = useState('offline')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [timetableData, setTimetableData] = useState(null)
  const [onboardingMode, setOnboardingMode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const LAST_SYNC_KEY = 'lastSyncTime'

  const loadFromLocalStorage = useCallback(() => {
    try {
      const storedTimetable = localStorage.getItem(TIMETABLE_STORAGE_KEY)
      const storedMode = localStorage.getItem(ONBOARDING_MODE_KEY)
      const storedStatus = localStorage.getItem(SYNC_STATUS_KEY)

      if (storedTimetable) {
        setTimetableData(JSON.parse(storedTimetable))
      }
      if (storedMode) {
        setOnboardingMode(storedMode)
      }
      if (storedStatus && !user) {
        setSyncStatus('offline')
      } else if (storedStatus) {
        setSyncStatus(storedStatus)
      }
      // Optionally, could expose storedLastSync if needed
    } catch {
      setError('Failed to load local data')
    }
  }, [user])

  const saveToLocalStorage = useCallback(
    (data, mode) => {
      try {
        if (data) {
          localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(data))
          setTimetableData(data)
        }
        if (mode) {
          localStorage.setItem(ONBOARDING_MODE_KEY, mode)
          setOnboardingMode(mode)
        }

        if (!user || !isOnline) {
          setSyncStatus('pending')
          localStorage.setItem(SYNC_STATUS_KEY, 'pending')
        }
      } catch {
        setError('Failed to save local data')
      }
    },
    [user, isOnline]
  )

  const loadFromSupabase = useCallback(async () => {
    if (!user || !isOnline) return

    setLoading(true)
    setSyncStatus('syncing')

    try {
      // First, check if any data exists for this user
      const { data: existingData, error: checkError } = await supabase
        .from('user_timetables')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (checkError) {
        throw checkError
      }

      if (!existingData || existingData.length === 0) {
        // No data found - this is ok for new users
        setSyncStatus('synced')
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
        setError(null)
      } else {
        // Data found in Supabase, update local storage
        const userData = existingData[0] // Get the first (most recent) record
        saveToLocalStorage(userData.timetable_data, userData.onboarding_mode)
        setSyncStatus('synced')
        localStorage.setItem(SYNC_STATUS_KEY, 'synced')
        localStorage.setItem(LAST_SYNC_KEY, userData.updated_at || new Date().toISOString())
        setError(null)
      }
    } catch {
      setError('Failed to sync from server')
      setSyncStatus('error')
    } finally {
      setLoading(false)
    }
  }, [user, isOnline, saveToLocalStorage])

  const syncToSupabase = useCallback(
    async (dataToSync = null, modeToSync = null) => {
      const currentTimetableData = dataToSync || timetableData
      const currentOnboardingMode = modeToSync || onboardingMode

      if (!user) {
        return
      }

      if (!isOnline) {
        return
      }

      if (!currentTimetableData || !currentOnboardingMode) {
        return
      }

      setLoading(true)
      setSyncStatus('syncing')

      try {
        // Check if user already has a timetable (avoid using .single())
        const { data: existingData, error: fetchError } = await supabase
          .from('user_timetables')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)

        if (fetchError) {
          throw fetchError
        }

        const timetableRecord = {
          user_id: user.id,
          timetable_data: currentTimetableData,
          onboarding_mode: currentOnboardingMode,
        }

        let result
        if (existingData && existingData.length > 0) {
          // Update existing record
          result = await supabase
            .from('user_timetables')
            .update(timetableRecord)
            .eq('user_id', user.id)
            .select()
        } else {
          // Insert new record
          result = await supabase.from('user_timetables').insert(timetableRecord).select()
        }

        if (result.error) {
          throw result.error
        }

        setSyncStatus('synced')
        localStorage.setItem(SYNC_STATUS_KEY, 'synced')
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
        setError(null)
      } catch (error) {
        setError(`Failed to sync to server: ${error.message}`)
        setSyncStatus('error')
      } finally {
        setLoading(false)
      }
    },
    [user, isOnline, timetableData, onboardingMode]
  )

  const clearLocalData = useCallback(() => {
    localStorage.removeItem(TIMETABLE_STORAGE_KEY)
    localStorage.removeItem(ONBOARDING_MODE_KEY)
    localStorage.removeItem(SYNC_STATUS_KEY)
    localStorage.removeItem(LAST_SYNC_KEY)
    setTimetableData(null)
    setOnboardingMode(null)
    setSyncStatus('offline')
    setError(null)
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (user) {
        syncToSupabase()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user, syncToSupabase])

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  // Sync when user changes
  useEffect(() => {
    if (user && isOnline) {
      // Always check Supabase if no local data
      const hasLocal =
        localStorage.getItem(TIMETABLE_STORAGE_KEY) && localStorage.getItem(ONBOARDING_MODE_KEY)
      if (!hasLocal) {
        loadFromSupabase().finally(() => {
          setSyncStatus('synced')
        })
      } else {
        setSyncStatus('synced')
      }
      sessionStorage.setItem(SESSION_SYNC_KEY, 'true')
    } else if (!user) {
      clearLocalData()
      sessionStorage.removeItem(SESSION_SYNC_KEY)
      setSyncStatus('offline')
    }
  }, [user, isOnline, loadFromSupabase, clearLocalData])

  const saveTimetable = useCallback(
    async (data, mode) => {
      // Save to localStorage first
      saveToLocalStorage(data, mode)

      if (user && isOnline) {
        // Pass the data directly to syncToSupabase to avoid state update delays
        await syncToSupabase(data, mode)
      }
    },
    [user, isOnline, saveToLocalStorage, syncToSupabase]
  )

  const resetTimetable = useCallback(async () => {
    if (user && isOnline) {
      try {
        const { error } = await supabase.from('user_timetables').delete().eq('user_id', user.id)

        if (error) {
          // Don't throw here, still clear local data even if remote deletion fails
        }
      } catch {
        // Don't throw here, still clear local data even if remote deletion fails
      }
    }

    clearLocalData()
    // Also clear onboarding complete flag
    localStorage.removeItem('onboardingComplete')
  }, [user, isOnline, clearLocalData])

  const hasTimetable = useCallback(() => {
    return !!(timetableData && onboardingMode)
  }, [timetableData, onboardingMode])

  const retrySyncAction = useCallback(() => {
    if (user && isOnline && syncStatus === 'error') {
      syncToSupabase()
    }
  }, [user, isOnline, syncStatus, syncToSupabase])

  return {
    // State
    timetableData,
    onboardingMode,
    syncStatus,
    isOnline,
    loading,
    error,
    lastSyncTime: typeof window !== 'undefined' ? localStorage.getItem(LAST_SYNC_KEY) : null,

    // Actions
    saveTimetable,
    resetTimetable,
    syncToSupabase,
    loadFromSupabase,
    clearLocalData,
    hasTimetable,
    retrySyncAction,

    // Status helpers
    isSynced: syncStatus === 'synced',
    isPending: syncStatus === 'pending',
    isError: syncStatus === 'error',
    isSyncing: syncStatus === 'syncing',
  }
}

export default useTimetableSync
