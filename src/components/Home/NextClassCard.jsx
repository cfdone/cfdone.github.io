import { Clock, MapPin } from 'lucide-react'

export default function NextClassCard({
  nextClass,
  currentClass,
  sortedTodayClasses,
  totalClasses,
  calculateTimeUntilStart,
}) {
  if (!nextClass || currentClass) return null

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 p-3 rounded-lg border border-blue-400/40 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        <span className="text-blue-400 font-product-sans font-bold text-xs uppercase tracking-wide">
          ↗ UP NEXT
        </span>
        <div className="flex-1"></div>
        <div className="text-blue-400/80 font-product-sans text-xs">
          Class {sortedTodayClasses.findIndex(c => c === nextClass) + 1} of {totalClasses}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white font-product-sans text-base font-bold mb-1">
            {nextClass.course}
          </h3>
          <div className="flex items-center gap-3 text-xs text-white/80">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {nextClass.start} - {nextClass.end}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {nextClass.room}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-blue-300 font-bold text-sm">
            {calculateTimeUntilStart(nextClass.start)}
          </div>
        </div>
      </div>
    </div>
  )
}
