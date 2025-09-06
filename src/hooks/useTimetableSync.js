import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './useAuth'

const TIMETABLE_STORAGE_KEY = 'timetableData'
const ONBOARDING_MODE_KEY = 'onboardingMode'
const SYNC_STATUS_KEY = 'syncStatus'

const useTimetableSync = () => {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState('offline')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [timetableData, setTimetableData] = useState(null)
  const [onboardingMode, setOnboardingMode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
    } catch (error) {
      console.error('Error loading from localStorage:', error)
      setError('Failed to load local data')
    }
  }, [user])

  const saveToLocalStorage = useCallback((data, mode) => {
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
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      setError('Failed to save local data')
    }
  }, [user, isOnline])

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
        console.error('Error checking for existing data:', checkError)
        throw checkError
      }

      if (!existingData || existingData.length === 0) {
        // No data found - this is ok for new users
        console.log('No timetable data found for user, user is new or hasn\'t completed onboarding yet')
        setSyncStatus('synced')
        setError(null)
      } else {
        // Data found in Supabase, update local storage
        const userData = existingData[0] // Get the first (most recent) record
        saveToLocalStorage(userData.timetable_data, userData.onboarding_mode)
        setSyncStatus('synced')
        localStorage.setItem(SYNC_STATUS_KEY, 'synced')
        setError(null)
        console.log('Successfully loaded timetable data from Supabase')
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error)
      setError('Failed to sync from server')
      setSyncStatus('error')
    } finally {
      setLoading(false)
    }
  }, [user, isOnline, saveToLocalStorage])

  const syncToSupabase = useCallback(async (dataToSync = null, modeToSync = null) => {
    const currentTimetableData = dataToSync || timetableData
    const currentOnboardingMode = modeToSync || onboardingMode
    
    console.log('🔄 syncToSupabase called with:', {
      user: !!user,
      isOnline,
      hasData: !!currentTimetableData,
      hasMode: !!currentOnboardingMode,
      userId: user?.id
    })

    if (!user) {
      console.log('❌ No user authenticated, skipping sync')
      return
    }
    
    if (!isOnline) {
      console.log('❌ App is offline, skipping sync')
      return
    }
    
    if (!currentTimetableData || !currentOnboardingMode) {
      console.log('❌ Missing timetable data or onboarding mode:', {
        hasData: !!currentTimetableData,
        hasMode: !!currentOnboardingMode
      })
      return
    }

    setLoading(true)
    setSyncStatus('syncing')
    
    try {
      console.log('🔍 Checking for existing timetable for user:', user.id)
      
      // Check if user already has a timetable (avoid using .single())
      const { data: existingData, error: fetchError } = await supabase
        .from('user_timetables')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (fetchError) {
        console.error('❌ Error checking for existing timetable:', fetchError)
        throw fetchError
      }

      console.log('📊 Existing data check result:', {
        existingRecords: existingData?.length || 0,
        hasExisting: !!(existingData && existingData.length > 0)
      })

      const timetableRecord = {
        user_id: user.id,
        timetable_data: currentTimetableData,
        onboarding_mode: currentOnboardingMode
      }

      console.log('📝 Timetable record to save:', {
        user_id: timetableRecord.user_id,
        onboarding_mode: timetableRecord.onboarding_mode,
        timetable_data_keys: Object.keys(timetableRecord.timetable_data || {}),
        timetable_data_size: JSON.stringify(timetableRecord.timetable_data).length
      })

      let result
      if (existingData && existingData.length > 0) {
        // Update existing record
        console.log('🔄 Updating existing timetable data for user:', user.id)
        result = await supabase
          .from('user_timetables')
          .update(timetableRecord)
          .eq('user_id', user.id)
          .select()
      } else {
        // Insert new record
        console.log('➕ Creating new timetable data for user:', user.id)
        result = await supabase
          .from('user_timetables')
          .insert(timetableRecord)
          .select()
      }

      console.log('💾 Database operation result:', {
        hasError: !!result.error,
        dataCount: result.data?.length || 0,
        error: result.error
      })

      if (result.error) {
        throw result.error
      }

      setSyncStatus('synced')
      localStorage.setItem(SYNC_STATUS_KEY, 'synced')
      setError(null)
      console.log('✅ Successfully synced timetable data to Supabase:', result.data)
    } catch (error) {
      console.error('❌ Error syncing to Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error
      })
      setError(`Failed to sync to server: ${error.message}`)
      setSyncStatus('error')
    } finally {
      setLoading(false)
    }
  }, [user, isOnline, timetableData, onboardingMode])

  const clearLocalData = useCallback(() => {
    localStorage.removeItem(TIMETABLE_STORAGE_KEY)
    localStorage.removeItem(ONBOARDING_MODE_KEY)
    localStorage.removeItem(SYNC_STATUS_KEY)
    setTimetableData(null)
    setOnboardingMode(null)
    setSyncStatus('offline')
    setError(null)
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 App came online')
      setIsOnline(true)
      if (user) {
        console.log('🔄 Auto-syncing on reconnection')
        syncToSupabase()
      }
    }
    
    const handleOffline = () => {
      console.log('📴 App went offline')
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
      loadFromSupabase()
    } else if (!user) {
      clearLocalData()
    }
  }, [user, isOnline, loadFromSupabase, clearLocalData])

  const saveTimetable = useCallback(async (data, mode) => {
    console.log('💾 saveTimetable called with:', {
      hasData: !!data,
      mode,
      dataKeys: data ? Object.keys(data) : [],
      user: !!user,
      isOnline
    })
    
    // Save to localStorage first
    saveToLocalStorage(data, mode)
    
    if (user && isOnline) {
      console.log('🚀 User is authenticated and online, syncing to Supabase immediately')
      // Pass the data directly to syncToSupabase to avoid state update delays
      await syncToSupabase(data, mode)
    } else {
      console.log('⏸️ User not authenticated or offline, sync will happen later', {
        user: !!user,
        isOnline
      })
    }
  }, [user, isOnline, saveToLocalStorage, syncToSupabase])

  const resetTimetable = useCallback(async () => {
    if (user && isOnline) {
      try {
        console.log('Deleting timetable data from Supabase...')
        const { error } = await supabase
          .from('user_timetables')
          .delete()
          .eq('user_id', user.id)
        
        if (error) {
          console.error('Error deleting from Supabase:', error)
          // Don't throw here, still clear local data even if remote deletion fails
        } else {
          console.log('Successfully deleted timetable data from Supabase')
        }
      } catch (error) {
        console.error('Error deleting from Supabase:', error)
        // Don't throw here, still clear local data even if remote deletion fails
      }
    }
    
    console.log('Clearing local timetable data...')
    clearLocalData()
    // Also clear onboarding complete flag
    localStorage.removeItem('onboardingComplete')
    console.log('Timetable reset completed')
  }, [user, isOnline, clearLocalData])

  const hasTimetable = useCallback(() => {
    return !!(timetableData && onboardingMode)
  }, [timetableData, onboardingMode])

  const retrySyncAction = useCallback(() => {
    console.log('🔄 Retry sync action triggered')
    if (user && isOnline && syncStatus === 'error') {
      console.log('🚀 Retrying sync to Supabase')
      syncToSupabase()
    } else {
      console.log('❌ Cannot retry sync:', {
        user: !!user,
        isOnline,
        syncStatus
      })
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
    isSyncing: syncStatus === 'syncing'
  }
}

export default useTimetableSync
