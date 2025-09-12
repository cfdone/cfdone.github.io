import { Trophy, Coffee, Sun } from 'lucide-react'

export default function StatusCard({ currentClass, totalClasses, doneClasses }) {
  // Show progress summary if there's an ongoing class
  if (currentClass) {
    return (
      <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 rounded-xl border border-accent/10 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-accent font-semibold text-sm">Today's Schedule</span>
          </div>
          <div className="text-accent/80 text-sm">
            {doneClasses} of {totalClasses} completed
          </div>
        </div>
        <div className="bg-white/10 rounded-full h-1.5">
          <div
            className="bg-accent rounded-full h-full transition-all duration-500"
            style={{ width: `${totalClasses > 0 ? (doneClasses / totalClasses) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    )
  }

  // If no classes today
  if (totalClasses === 0) {
    return (
      <div className="bg-white/5 p-3 rounded-lg border border-accent/10 text-center mb-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sun className="w-5 h-5 text-accent" />
          <span className="text-accent text-sm font-semibold">No Classes Today</span>
        </div>
        <div className="text-accent/80 text-xs">0 of 0 completed</div>
        <div className="bg-white/10 rounded-full h-1.5 mt-1">
          <div className="bg-accent rounded-full h-full transition-all duration-500" style={{ width: '0%' }}></div>
        </div>
      </div>
    )
  }

  // Otherwise, show status and progress
  return (
    <div className="bg-white/5 p-3 rounded-lg border border-accent/10 text-center mb-3">
      <div className="flex items-center justify-center gap-2 mb-2">
        {doneClasses === totalClasses ? (
          <>
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-accent text-sm font-semibold">All Classes Complete!</span>
          </>
        ) : (
          <>
            <Coffee className="w-5 h-5 text-accent" />
            <span className="text-accent text-sm font-semibold">Free Time</span>
          </>
        )}
      </div>
      <div className="text-accent/80 text-xs">{doneClasses} of {totalClasses} completed</div>
      <div className="bg-white/10 rounded-full h-1.5 mt-1">
        <div
          className="bg-accent rounded-full h-full transition-all duration-500"
          style={{ width: `${totalClasses > 0 ? (doneClasses / totalClasses) * 100 : 0}%` }}
        ></div>
      </div>
    </div>
  )
}
