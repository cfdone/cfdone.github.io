import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  Header,
  CurrentClassCard,
  NextClassCard,
  StatusCard,
  TodaySchedule,
  WeeklySchedule,
  NoTimetableData,
  ViewToggle,
} from '../components/Home'

export default function Home() {
  const location = useLocation()
  const [selection, setSelection] = useState(location.state || null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [viewWeekly, setViewWeekly] = useState(false)

  // Load data from localStorage if not provided via location state
  useEffect(() => {
    if (!selection) {
      try {
        const savedTimetableData = localStorage.getItem('timetableData')
        if (savedTimetableData) {
          const parsedData = JSON.parse(savedTimetableData)
          setSelection(parsedData)
        }
      } catch (error) {
        console.error('Error loading timetable data from localStorage:', error)
      }
    }
  }, [selection])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Get current day
  const getCurrentDay = useCallback(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    return days[currentTime.getDay()]
  }, [currentTime])

  // Get greeting based on time
  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }, [currentTime])

  // Get formatted time
  const getFormattedTime = useCallback(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }, [currentTime])

  // Parse time string to minutes (handles both AM/PM and 24-hour format)
  const timeToMinutes = useCallback(timeStr => {
    if (!timeStr || typeof timeStr !== 'string') return 0
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
    if (!timeMatch) return 0
    let hours = parseInt(timeMatch[1], 10)
    const minutes = parseInt(timeMatch[2], 10)

    if (hours >= 1 && hours < 8 && hours !== 12) {
      // This is likely a PM time (1:00-7:59 PM)
      hours += 12
    }

    return hours * 60 + minutes
  }, [])

  // Get current time in minutes
  const getCurrentMinutes = useCallback(() => {
    return currentTime.getHours() * 60 + currentTime.getMinutes()
  }, [currentTime])

  // Calculate remaining time
  const calculateRemainingTime = useCallback(
    endTime => {
      const endMinutes = timeToMinutes(endTime)
      const currentMinutes = getCurrentMinutes()
      const diff = endMinutes - currentMinutes

      if (diff <= 0) return 'Ended'

      const hours = Math.floor(diff / 60)
      const minutes = diff % 60

      if (hours > 0) {
        return `${hours}h ${minutes}m remaining`
      }
      return `${minutes}m remaining`
    },
    [timeToMinutes, getCurrentMinutes]
  )

  // Calculate time until start
  const calculateTimeUntilStart = useCallback(
    startTime => {
      const startMinutes = timeToMinutes(startTime)
      const currentMinutes = getCurrentMinutes()
      const diff = startMinutes - currentMinutes

      if (diff <= 0) return 'Started'

      const hours = Math.floor(diff / 60)
      const minutes = diff % 60

      if (hours > 0) {
        return `Starts in ${hours}h ${minutes}m`
      }
      return `Starts in ${minutes}m`
    },
    [timeToMinutes, getCurrentMinutes]
  )

  // Get timetable data
  const timetableData = useMemo(() => {
    if (!selection) return {}

    // Handle data from localStorage or navigation state
    if (selection.timetable) {
      return selection.timetable
    }

    // Legacy support for passtimetable
    if (selection.passtimetable) {
      return selection.passtimetable
    }

    return {}
  }, [selection])

  const todayClasses = useMemo(() => {
    const currentDay = getCurrentDay()
    return timetableData[currentDay] || []
  }, [timetableData, getCurrentDay])

  // Sort today's classes by time
  const sortedTodayClasses = useMemo(() => {
    return [...todayClasses].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
  }, [todayClasses, timeToMinutes])

  // Find current and next class
  const { currentClass, nextClass, totalClasses, doneClasses } = useMemo(() => {
    const currentMinutes = getCurrentMinutes()
    let current = null
    let next = null
    let done = 0

    for (const classInfo of sortedTodayClasses) {
      const startMinutes = timeToMinutes(classInfo.start)
      const endMinutes = timeToMinutes(classInfo.end)

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        current = classInfo
      } else if (currentMinutes < startMinutes && !next) {
        next = classInfo
      } else if (currentMinutes >= endMinutes) {
        done++
      }
    }

    return {
      currentClass: current,
      nextClass: next,
      totalClasses: sortedTodayClasses.length,
      doneClasses: done,
    }
  }, [sortedTodayClasses, getCurrentMinutes, timeToMinutes])

  if (!selection) {
    return <NoTimetableData />
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Simplified background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-48 h-48 bg-accent/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-64 h-64 bg-purple-500/2 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Fixed Header with Current Class */}
        <Header
          greeting={getGreeting()}
          currentDay={getCurrentDay()}
          formattedTime={getFormattedTime()}
          selection={selection}
          doneClasses={doneClasses}
          totalClasses={totalClasses}
        />

        {/* Current/Next Class in Header */}
        <div className="flex-shrink-0 max-w-md mx-auto w-full px-4">
          <CurrentClassCard
            currentClass={currentClass}
            sortedTodayClasses={sortedTodayClasses}
            totalClasses={totalClasses}
            calculateRemainingTime={calculateRemainingTime}
          />

          <NextClassCard
            nextClass={nextClass}
            currentClass={currentClass}
            sortedTodayClasses={sortedTodayClasses}
            totalClasses={totalClasses}
            calculateTimeUntilStart={calculateTimeUntilStart}
          />

          <StatusCard
            currentClass={currentClass}
            nextClass={nextClass}
            totalClasses={totalClasses}
            doneClasses={doneClasses}
          />

          <ViewToggle viewWeekly={viewWeekly} setViewWeekly={setViewWeekly} />
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto no-scrollbar p-4 max-w-md mx-auto text-white">
            {/* Enhanced Schedule Display */}
            <div>
              {viewWeekly ? (
                <WeeklySchedule
                  timetableData={timetableData}
                  getCurrentDay={getCurrentDay}
                  timeToMinutes={timeToMinutes}
                  getCurrentMinutes={getCurrentMinutes}
                  currentClass={currentClass}
                  nextClass={nextClass}
                  selection={selection}
                  calculateRemainingTime={calculateRemainingTime}
                  calculateTimeUntilStart={calculateTimeUntilStart}
                />
              ) : (
                <TodaySchedule
                  sortedTodayClasses={sortedTodayClasses}
                  currentClass={currentClass}
                  nextClass={nextClass}
                  getCurrentMinutes={getCurrentMinutes}
                  timeToMinutes={timeToMinutes}
                  selection={selection}
                  calculateRemainingTime={calculateRemainingTime}
                  calculateTimeUntilStart={calculateTimeUntilStart}
                />
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navbar */}
        <div className="flex-shrink-0 flex justify-center p-4">
          <Navbar currentPage="home" />
        </div>
      </div>
    </div>
  )
}
