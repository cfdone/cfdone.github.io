import React from 'react'
import useTimetableSync from '../hooks/useTimetableSync'
import { useAuth } from '../hooks/useAuth'

const SyncDebugPanel = () => {
  const { user } = useAuth()
  const {
    timetableData,
    onboardingMode,
    syncStatus,
    isOnline,
    loading,
    error,
    hasTimetable,
    syncToSupabase,
    loadFromSupabase,
    clearLocalData,
    resetTimetable
  } = useTimetableSync()

  const debugInfo = {
    user: user ? { id: user.id, email: user.email } : null,
    timetableData: timetableData ? 'Data present' : 'No data',
    onboardingMode,
    syncStatus,
    isOnline,
    loading,
    error,
    hasTimetable: hasTimetable(),
    localStorage: {
      timetableData: localStorage.getItem('timetableData') ? 'Present' : 'Not found',
      onboardingMode: localStorage.getItem('onboardingMode') || 'Not set',
      syncStatus: localStorage.getItem('syncStatus') || 'Not set',
      onboardingComplete: localStorage.getItem('onboardingComplete') || 'Not set'
    }
  }

  if (import.meta.env.MODE !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-gray-600 max-w-md text-xs z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Sync Debug Panel</h3>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <div>
          <strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            syncStatus === 'synced' ? 'bg-green-600' :
            syncStatus === 'syncing' ? 'bg-blue-600' :
            syncStatus === 'pending' ? 'bg-yellow-600' :
            syncStatus === 'error' ? 'bg-red-600' : 'bg-gray-600'
          }`}>
            {syncStatus}
          </span>
        </div>
        
        <div>
          <strong>Online:</strong> {isOnline ? '✅' : '❌'}
          {loading && <span className="ml-2 text-blue-400">Loading...</span>}
        </div>
        
        {error && (
          <div className="text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <details className="cursor-pointer">
          <summary className="font-bold">Debug Info</summary>
          <pre className="mt-2 text-xs bg-gray-800 p-2 rounded overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
        
        <div className="flex flex-wrap gap-1 mt-3">
          <button
            onClick={syncToSupabase}
            className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
            disabled={loading}
          >
            Sync to DB
          </button>
          <button
            onClick={loadFromSupabase}
            className="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
            disabled={loading}
          >
            Load from DB
          </button>
          <button
            onClick={clearLocalData}
            className="px-2 py-1 bg-yellow-600 rounded text-xs hover:bg-yellow-700"
            disabled={loading}
          >
            Clear Local
          </button>
          <button
            onClick={resetTimetable}
            className="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
            disabled={loading}
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  )
}

export default SyncDebugPanel
