import { Clock, MapPin } from 'lucide-react'

export default function NextClassCard({
  nextClass,
  currentClass,
  sortedTodayClasses,
  totalClasses,
  calculateTimeUntilStart,
  referenceMinutes,
}) {
  if (!nextClass || currentClass) return null

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 p-3 rounded-xl border border-blue-400/40 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        <span className="text-blue-400  font-semibold text-xs uppercase tracking-wide">
          ↗ UP NEXT
        </span>
        <div className="flex-1"></div>
        <div className="text-blue-400/80  text-xs">
          Class {sortedTodayClasses.findIndex(c => c === nextClass) + 1} of {totalClasses}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-white  text-base font-semibold mb-1">
            {nextClass.course}
            {nextClass.section && (
              <span className="text-xs text-white/60 ml-1">(Section {nextClass.section})</span>
            )}
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
          <div className="text-blue-300 font-semibold text-sm">
            {calculateTimeUntilStart(nextClass.start, referenceMinutes)}
          </div>
        </div>
      </div>
    </div>
  )
}
