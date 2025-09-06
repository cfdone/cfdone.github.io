import { Sun } from 'lucide-react'
import ClassCard from './ClassCard'

export default function TodaySchedule({
  sortedTodayClasses,
  currentClass,
  nextClass,
  getCurrentMinutes,
  timeToMinutes,
  selection,
  calculateRemainingTime,
  calculateTimeUntilStart,
  selectedDay,
}) {
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  // Use the selectedDay prop first, then fall back to class day or current day
  const displayDay = selectedDay || sortedTodayClasses[0]?.day || currentDayName;
  const isToday = displayDay === currentDayName;
  
  if (sortedTodayClasses.length === 0) {
    return (
      <div className="bg-white/5 p-6 rounded-xl border border-accent/10 text-center">
        <div className="mb-3 flex justify-center">
          <Sun className="w-10 h-10 text-accent" />
        </div>
        <h3 className="text-white font-product-sans text-lg font-bold mb-2">
          No Classes on {displayDay}
        </h3>
        <p className="text-accent/80 font-product-sans text-sm">
          {isToday ? "Enjoy your free day!" : "This day is free."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Individual Class Cards */}
      {sortedTodayClasses.map((classInfo, idx) => {
        const isCurrentClass = currentClass && currentClass === classInfo
        const isNextClass = nextClass && nextClass === classInfo
        const isPastClass = getCurrentMinutes() >= timeToMinutes(classInfo.end)

        return (
          <ClassCard
            key={idx}
            classInfo={classInfo}
            isCurrentClass={isCurrentClass}
            isNextClass={isNextClass}
            isPastClass={isPastClass}
            selection={selection}
            calculateRemainingTime={calculateRemainingTime}
            calculateTimeUntilStart={calculateTimeUntilStart}
          />
        )
      })}
    </div>
  )
}
