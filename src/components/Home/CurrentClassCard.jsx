import { Clock, MapPin } from 'lucide-react'
export default function CurrentClassCard({
  currentClass,
  sortedTodayClasses,
  totalClasses,
  calculateRemainingTime,
  syncStatus,
  isOnline,
  onRetrySync,
}) {
  if (!currentClass) return null

  return (
    <div className="bg-gradient-to-r from-red-900/40 to-red-800/30 p-3 rounded-lg border border-red-400/40 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        <span className="text-red-400  font-semibold text-xs uppercase tracking-wide">
          LIVE NOW
        </span>
        <div className="flex-1"></div>
        <TimetableSyncStatus
          syncStatus={syncStatus}
          isOnline={isOnline}
          onRetry={onRetrySync}
          compact={true}
        />
        <div className="text-red-400/80  text-xs">
          Class {sortedTodayClasses.findIndex(c => c === currentClass) + 1} of {totalClasses}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white  text-base font-semibold mb-1">
            {currentClass.course}
            {currentClass.section && (
              <span className="text-xs text-white/60 ml-1">(Section {currentClass.section})</span>
            )}
          </h3>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {currentClass.start} - {currentClass.end}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {currentClass.room}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-red-300 font-semibold text-sm">
            {calculateRemainingTime(currentClass.end)}
          </div>
        </div>
      </div>
    </div>
  )
}
