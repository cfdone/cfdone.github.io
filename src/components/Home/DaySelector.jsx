import { useState, useEffect } from 'react'

export default function DaySelector({ onDaySelect, currentDay }) {
  const [selectedDay, setSelectedDay] = useState(currentDay)
  const [weekDays, setWeekDays] = useState([])
  useEffect(() => {
    const today = new Date()
    const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const days = []
    // Find the next Monday from today
    let startDate = new Date(today)
    while (startDate.getDay() !== 1) {
      startDate.setDate(startDate.getDate() + 1)
    }
    // Generate Monday to Friday
    for (let i = 0; i < 5; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      const dayNum = day.getDay() - 1 // 0 for Monday
      const isToday = day.toDateString() === today.toDateString()
      const dayInfo = {
        fullName: fullNames[dayNum],
        shortName: shortNames[dayNum],
        date: day.getDate(),
        month: day.toLocaleDateString('en-US', { month: 'short' }),
        isToday,
      }
      days.push(dayInfo)
    }
    setWeekDays(days)
    setSelectedDay(currentDay || days.find(d => d.isToday)?.fullName || days[0]?.fullName)
  }, [currentDay])

  const handleDayClick = dayName => {
    setSelectedDay(dayName)
    onDaySelect(dayName)
  }

  return (
    <div className="flex overflow-x-auto no-scrollbar w-full mb-2">
      <div className="flex w-full justify-between space-x-1">
        {weekDays.map((day, index) => {
          const dayClasses =
            selectedDay === day.fullName
              ? 'bg-accent/20 border-accent/30 text-white'
              : day.isToday
                ? 'bg-white/10 border-white/20 text-white/80'
                : 'bg-white/5 border-white/10 text-white/70'

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day.fullName)}
              className={`flex-shrink-0 flex flex-col items-center p-1 rounded-lg border min-w-[50px] transition-all ${dayClasses}`}
            >
              <span className="text-xs font-semibold">{day.shortName}</span>
              <span className={`text-sm font-semibold ${day.isToday ? 'text-accent' : ''}`}>
                {day.date}
              </span>
              <span className="text-[9px] text-accent/80">{day.isToday ? 'Today' : day.month}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
