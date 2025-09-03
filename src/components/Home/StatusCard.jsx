import { Trophy, Coffee, Sun } from 'lucide-react'

export default function StatusCard({ currentClass, nextClass, totalClasses, doneClasses }) {
  if (currentClass || nextClass) return null

  if (totalClasses === 0) {
    return (
      <div className="bg-white/5 p-3 rounded-lg border border-accent/10 text-center mb-3">
        <div className="flex items-center justify-center gap-2">
          <Sun className="w-5 h-5 text-accent" />
          <span className="text-accent font-product-sans text-sm font-bold">No Classes Today</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 p-3 rounded-lg border border-accent/10 text-center mb-3">
      <div className="flex items-center justify-center gap-2">
        {doneClasses === totalClasses ? (
          <>
            <Trophy className="w-5 h-5 text-accent" />
            <span className="text-accent font-product-sans text-sm font-bold">
              All Classes Complete!
            </span>
          </>
        ) : (
          <>
            <Coffee className="w-5 h-5 text-accent" />
            <span className="text-accent font-product-sans text-sm font-bold">Free Time</span>
          </>
        )}
      </div>
    </div>
  )
}
