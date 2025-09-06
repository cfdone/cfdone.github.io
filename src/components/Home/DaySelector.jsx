import { useState, useEffect } from 'react'

export default function DaySelector({ onDaySelect, currentDay }) {
  const [selectedDay, setSelectedDay] = useState(currentDay)
  const [weekDays, setWeekDays] = useState([])
  useEffect(() => {
    const days = []
    const today = new Date()
    const fullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const shortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(today)
    const dayOfWeek = today.getDay()
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    
    // Generate all 7 days of the week
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      const dayNum = day.getDay()
      
      const isToday = day.toDateString() === today.toDateString();
      const dayInfo = {
        fullName: fullNames[dayNum],
        shortName: shortNames[dayNum],
        date: day.getDate(),
        month: day.toLocaleDateString('en-US', { month: 'short' }),
        isToday
      };
      
      days.push(dayInfo)
    }
    setWeekDays(days)
    setSelectedDay(currentDay || days.find(d => d.isToday)?.fullName || days[0]?.fullName)
  }, [currentDay])

  const handleDayClick = (dayName) => {
    setSelectedDay(dayName)
    onDaySelect(dayName)
  }

  return (
    <div className="flex overflow-x-auto no-scrollbar w-full mb-2">
      <div className="flex w-full justify-between space-x-1">
        {weekDays.map((day, index) => {
          const dayClasses = selectedDay === day.fullName 
            ? 'bg-accent/20 border-accent/30 text-white'
            : day.isToday
              ? 'bg-white/10 border-white/20 text-white/80'
              : 'bg-white/5 border-white/10 text-white/70';
              
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day.fullName)}
              className={`flex-shrink-0 flex flex-col items-center p-1 rounded-lg border min-w-[50px] transition-all ${dayClasses}`}
            >
              <span className="text-xs font-medium">{day.shortName}</span>
              <span className={`text-sm font-bold ${day.isToday ? 'text-accent' : ''}`}>{day.date}</span>
              <span className="text-[9px] text-accent/80">{day.isToday ? 'Today' : day.month}</span>
            </button>
          );
        })}
      </div>
    </div>
  )
}
