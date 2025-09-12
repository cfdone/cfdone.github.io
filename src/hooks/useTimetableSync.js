import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './useAuth'

const TIMETABLE_STORAGE_KEY = 'timetableData'
const ONBOARDING_MODE_KEY = 'onboardingMode'
const SYNC_STATUS_KEY = 'syncStatus'

const useTimetableSync = () => {
  const { user } = useAuth()
  const [timetableData, setTimetableData] = useState(null)
  const [onboardingMode, setOnboardingMode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadFromLocalStorage = useCallback(() => {
    try {
      const storedTimetable = localStorage.getItem(TIMETABLE_STORAGE_KEY)
      const storedMode = localStorage.getItem(ONBOARDING_MODE_KEY)
      if (storedTimetable) {
        setTimetableData(JSON.parse(storedTimetable))
      }
      if (storedMode) {
        setOnboardingMode(storedMode)
      }
    } catch {
      setError('Failed to load local data')
    }
  }, [])

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
    } catch {
      setError('Failed to save local data')
    }
  }, [])

  const fetchTimetableOnce = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data: existingData, error: checkError } = await supabase
        .from('user_timetables')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
      if (checkError) throw checkError
      if (existingData && existingData.length > 0) {
        const userData = existingData[0]
        saveToLocalStorage(userData.timetable_data, userData.onboarding_mode)
      }
    } catch {
      setError('Failed to fetch timetable')
    } finally {
      setLoading(false)
    }
  }, [user, saveToLocalStorage])

  // Removed syncToSupabase

  const clearLocalData = useCallback(() => {
    localStorage.removeItem(TIMETABLE_STORAGE_KEY)
    localStorage.removeItem(ONBOARDING_MODE_KEY)
    setTimetableData(null)
    setOnboardingMode(null)
    setError(null)
  }, [])

  // No online status monitoring needed

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  // Fetch from Supabase only once after login if no local data
  useEffect(() => {
    if (user) {
      const hasLocal =
        localStorage.getItem(TIMETABLE_STORAGE_KEY) && localStorage.getItem(ONBOARDING_MODE_KEY)
      if (!hasLocal) {
        fetchTimetableOnce()
      }
    } else {
      clearLocalData()
    }
  }, [user, fetchTimetableOnce, clearLocalData])

  // Save timetable only to localStorage
  const saveTimetable = useCallback(
    (data, mode) => {
      saveToLocalStorage(data, mode)
    },
    [saveToLocalStorage]
  )

  const resetTimetable = useCallback(() => {
    clearLocalData()
    localStorage.removeItem('onboardingComplete')
  }, [clearLocalData])

  const hasTimetable = useCallback(() => {
    return !!(timetableData && onboardingMode)
  }, [timetableData, onboardingMode])

  // No retrySyncAction needed

  return {
    timetableData,
    onboardingMode,
    loading,
    error,
    saveTimetable,
    resetTimetable,
    clearLocalData,
    hasTimetable,
  }
}

export default useTimetableSync
