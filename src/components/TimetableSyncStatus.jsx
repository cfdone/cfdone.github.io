import React from 'react'
import { SyncStatusIcon, SyncStatusDisplay } from './Loading'
import { RefreshCw } from 'lucide-react'

const TimetableSyncStatus = ({ 
  syncStatus, 
  isOnline, 
  onRetry, 
  compact = false, 
  className = '' 
}) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <SyncStatusIcon status={syncStatus} size={14} />
        {syncStatus === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Retry sync"
          >
            <RefreshCw size={12} className="text-gray-500" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <SyncStatusDisplay 
        status={syncStatus} 
        className="text-xs"
      />
      
      {syncStatus === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
        >
          <RefreshCw size={12} />
          Retry sync
        </button>
      )}
      
      {!isOnline && (
        <p className="text-xs text-gray-500">
          Will sync when online
        </p>
      )}
    </div>
  )
}

export default TimetableSyncStatus
