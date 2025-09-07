import React from 'react'
import { Loader2, Wifi, WifiOff, CheckCircle, AlertCircle, Clock } from 'lucide-react'
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

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <LoadingSpinner size={32} className="text-accent" />
  </div>
)

const InlineLoading = ({ message = 'Loading...', size = 16 }) => (
  <div className="flex items-center gap-2 text-accent">
    <LoadingSpinner size={size} className="text-accent" />
    <span className="text-sm">{message}</span>
  </div>
)

const ButtonLoading = ({ loading, children, ...props }) => (
  <button 
    {...props} 
    disabled={loading || props.disabled}
    className={`flex items-center justify-center gap-2 ${props.className || ''}`}
  >
    {loading && <LoadingSpinner size={16} className="text-accent" />}
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

