import React from 'react'
import { Loader2, Wifi, WifiOff, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'

const LoadingSpinner = ({ size = 20, className = '' }) => (
  <Loader2 className={`animate-spin ${className}`} size={size} />
)

const SyncStatusIcon = ({ status, size = 16, className = '' }) => {
  const accentClass = 'text-accent';
  const icons = {
    synced: <CheckCircle className={`${accentClass} ${className}`} size={size} />,
    syncing: <LoadingSpinner size={size} className={`${accentClass} ${className}`} />,
    pending: <Clock className={`${accentClass} ${className}`} size={size} />,
    error: <AlertCircle className={`${accentClass} ${className}`} size={size} />,
    offline: <WifiOff className={`${accentClass} ${className}`} size={size} />,
    online: <Wifi className={`${accentClass} ${className}`} size={size} />
  }
  return icons[status] || icons.offline
}

const SyncStatusDisplay = ({ status, message, className = '' }) => {
  const statusMessages = {
    synced: 'Synced',
    syncing: 'Syncing...',
    pending: 'Pending sync',
    error: 'Sync failed',
    offline: 'Offline',
    online: 'Online'
  }
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SyncStatusIcon status={status} />
      <span className="text-sm text-gray-600">
        {message || statusMessages[status] || 'Unknown'}
      </span>
    </div>
  )
}

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
