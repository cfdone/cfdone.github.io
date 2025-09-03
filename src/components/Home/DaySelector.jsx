import { useState, useEffect } from 'react'

export default function DaySelector({ onDaySelect, currentDay }) {
  const [selectedDay, setSelectedDay] = useState(currentDay)
  const [weekDays, setWeekDays] = useState([])
  useEffect(() => {
    const days = []
    const today = new Date()
    const startDay = new Date(today)
    const fullNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', '']
    const shortNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', '']
    
    for (let i = 0, count = 0; count < 5 && i < 10; i++) {
      const day = new Date(startDay)
      day.setDate(startDay.getDate() + i)
      const dayNum = day.getDay()
      
      if (dayNum === 0 || dayNum === 6) continue // Skip weekends
      
      const isToday = day.toDateString() === today.toDateString();
      const dayInfo = {
        fullName: fullNames[dayNum],
        shortName: shortNames[dayNum],
        date: day.getDate(),
        month: day.toLocaleDateString('en-US', { month: 'short' }),
        isToday
      };
      
      days.push(dayInfo)
      
      count++
    }
    setWeekDays(days)
    setSelectedDay(currentDay || days[0]?.fullName)
  }, [currentDay])

  const handleDayClick = (dayName) => {
    setSelectedDay(dayName)
    onDaySelect(dayName)
  }

  return (
    <div className="flex justify-between overflow-x-auto no-scrollbar w-full mb-3">
      <div className="flex w-full justify-between space-x-2">
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
              className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border min-w-[70px] transition-all ${dayClasses}`}
            >
              <span className="text-xs font-medium">{day.shortName}</span>
              <span className={`text-lg font-bold mt-1 ${day.isToday ? 'text-accent' : ''}`}>{day.date}</span>
              <span className="text-[10px] text-accent/80 mt-1">{day.isToday ? 'Today' : day.month}</span>
            </button>
          );
        })}
      </div>
    </div>
  )
}
