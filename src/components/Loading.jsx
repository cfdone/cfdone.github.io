import React from 'react'
import { Loader2, Wifi, WifiOff, CheckCircle, AlertCircle, Clock } from 'lucide-react'

const LoadingSpinner = ({ size = 20, className = '' }) => (
  <Loader2 className={`animate-spin ${className}`} size={size} />
)

const SyncStatusIcon = ({ status, size = 16, className = '' }) => {
  const icons = {
    synced: <CheckCircle className={`text-green-500 ${className}`} size={size} />,
    syncing: <LoadingSpinner size={size} className={`text-blue-500 ${className}`} />,
    pending: <Clock className={`text-yellow-500 ${className}`} size={size} />,
    error: <AlertCircle className={`text-red-500 ${className}`} size={size} />,
    offline: <WifiOff className={`text-gray-500 ${className}`} size={size} />,
    online: <Wifi className={`text-green-500 ${className}`} size={size} />
  }
  
  return icons[status] || icons.offline
}

const LoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3 max-w-sm mx-4">
      <LoadingSpinner size={32} className="text-blue-500" />
      <p className="text-gray-700 text-center">{message}</p>
    </div>
  </div>
)

const InlineLoading = ({ message = 'Loading...', size = 16 }) => (
  <div className="flex items-center gap-2 text-gray-600">
    <LoadingSpinner size={size} />
    <span className="text-sm">{message}</span>
  </div>
)

const ButtonLoading = ({ loading, children, ...props }) => (
  <button 
    {...props} 
    disabled={loading || props.disabled}
    className={`flex items-center justify-center gap-2 ${props.className || ''}`}
  >
    {loading && <LoadingSpinner size={16} />}
    {children}
  </button>
)

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

export {
  LoadingSpinner,
  SyncStatusIcon,
  LoadingOverlay,
  InlineLoading,
  ButtonLoading,
  SyncStatusDisplay
}
