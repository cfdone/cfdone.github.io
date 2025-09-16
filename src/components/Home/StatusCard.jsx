import { Trophy, Coffee, Sun, Clock, CheckCircle2 } from 'lucide-react'

export default function StatusCard({ currentClass, totalClasses, doneClasses }) {
  if (currentClass) {
    return (
      <div className="relative overflow-hidden  bg-gradient-to-r from-transparent via-white/5 to-transparent p-6 rounded-3xl border border-accent/5 mb-4 backdrop-blur-sm shadow-lg transition-all duration-300">
        {/* Subtle animated background pattern */}
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-full">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-accent font-semibold text-base">In Progress</h3>
                <p className="text-accent/70 text-xs">Currently in session</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-accent font-bold text-lg">
                {doneClasses}
                <span className="text-accent/60">/{totalClasses}</span>
              </div>
              <div className="text-accent/60 text-xs">completed</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If no classes today
  if (totalClasses === 0) {
    return (
      <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent p-6 rounded-3xl border mb-3 border-accent/5 backdrop-blur-sm transition-all duration-300">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-accent/15 rounded-full">
            <Sun className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-accent font-semibold text-lg mb-1">Free Day</h3>
            <p className="text-accent/70 text-sm">No classes scheduled today</p>
          </div>
        </div>
      </div>
    )
  }

  // All classes complete or free time
  const isComplete = doneClasses === totalClasses
  return (
    <div
      className={`bg-gradient-to-r from-transparent via-white/5 to-transparent p-6 rounded-3xl border border-accent/5 mb-3 text-center transition-all duration-300 ${
        isComplete ? 'bg-white/2 border-accent/5' : 'bg-white/8 border-accent/15'
      }`}
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="p-2 bg-accent/20 rounded-full">
          {isComplete ? (
            <Trophy className="w-5 h-5 text-accent" />
          ) : (
            <Coffee className="w-5 h-5 text-accent" />
          )}
        </div>
      </div>
      <div>
        <h3 className="text-accent font-semibold text-base mb-1">
          {isComplete ? 'All Complete!' : 'Break Time'}
        </h3>
        <p className="text-accent/70 text-sm mb-3">
          {doneClasses} of {totalClasses} classes completed
        </p>
      </div>
    </div>
  )
}
