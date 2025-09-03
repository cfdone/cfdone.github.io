import { Clock, MapPin } from 'lucide-react'

export default function CurrentClassCard({
  currentClass,
  sortedTodayClasses,
  totalClasses,
  calculateRemainingTime,
}) {
  if (!currentClass) return null

  return (
    <div className="bg-gradient-to-r from-red-900/40 to-red-800/30 p-3 rounded-lg border border-red-400/40 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        <span className="text-red-400 font-product-sans font-bold text-xs uppercase tracking-wide">
          ● LIVE NOW
        </span>
        <div className="flex-1"></div>
        <div className="text-red-400/80 font-product-sans text-xs">
          Class {sortedTodayClasses.findIndex(c => c === currentClass) + 1} of {totalClasses}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white font-product-sans text-base font-bold mb-1">
            {currentClass.course}
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
          <div className="text-red-300 font-bold text-sm">
            {calculateRemainingTime(currentClass.end)}
          </div>
        </div>
      </div>
    </div>
  )
}
