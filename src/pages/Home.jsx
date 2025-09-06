import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  Header,
  CurrentClassCard,
  StatusCard,
  TodaySchedule,
  WeeklySchedule,
  NoTimetableData,
  ViewToggle,
  DaySelector,
} from '../components/Home'
import { timeToMinutes } from '../utils/timeUtils'
import useTimetableSync from '../hooks/useTimetableSync'
import TimetableSyncStatus from '../components/TimetableSyncStatus'
export default function Home() {
  const location = useLocation()
  const { 
    timetableData: syncedTimetableData, 
   
    syncStatus, 
    isOnline, 
    hasTimetable,
    retrySyncAction 
  } = useTimetableSync()
  
  const [selection, setSelection] = useState(location.state || null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [viewWeekly, setViewWeekly] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')

  // Load data from timetable sync hook or localStorage fallback
  useEffect(() => {
    if (hasTimetable() && syncedTimetableData) {
      setSelection(syncedTimetableData)
    } else if (!selection) {
      try {
        const savedTimetableData = localStorage.getItem('timetableData')
        if (savedTimetableData) {
          const parsedData = JSON.parse(savedTimetableData)
          setSelection(parsedData)
        }
      } catch {
        // Error loading data
      }
    }
  }, [selection, syncedTimetableData, hasTimetable])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Get actual current day (for Header)
  const getActualCurrentDay = useCallback(() => {
    // All days of the week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = currentTime.getDay();
    return days[dayIndex];
  }, [currentTime])

  // Get selected day for schedule display
  const getCurrentDay = useCallback(() => {
    // All days of the week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // If a specific day is selected, use that
    if (selectedDay) {
      return selectedDay;
    }
    
    // Otherwise use current day
    const dayIndex = currentTime.getDay();
    return days[dayIndex];
  }, [currentTime, selectedDay])

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

  // Parse time string to minutes (using consistent utility)
  // Note: timeToMinutes is imported from utils

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
    [getCurrentMinutes]
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
    [getCurrentMinutes]
  )

  // Get timetable data
  const timetableData = useMemo(() => {
    if (!selection) return {}

    // Extract data from either source
    let data = {}
    if (selection.timetable) {
      data = selection.timetable
    } else if (selection.passtimetable) {
      // Legacy support for passtimetable
      data = selection.passtimetable
    }

    // Return all data including weekends
    return data
  }, [selection])

  const todayClasses = useMemo(() => {
    const currentDay = getCurrentDay()
    return timetableData[currentDay] || []
  }, [timetableData, getCurrentDay])

  // Sort today's classes by time (for the selected day)
  const sortedTodayClasses = useMemo(() => {
    // Add the current day to each class object
    return [...todayClasses].map(classItem => ({
      ...classItem,
      day: getCurrentDay()
    })).sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
  }, [todayClasses, getCurrentDay])

  // Get actual today's classes for progress tracking and today's cards
  const actualTodayClasses = useMemo(() => {
    const actualDay = getActualCurrentDay()
    return timetableData[actualDay] || []
  }, [timetableData, getActualCurrentDay])
  
  // Sort actual today's classes (for the current/next class cards)
  const sortedActualTodayClasses = useMemo(() => {
    return [...actualTodayClasses].map(classItem => ({
      ...classItem,
      day: getActualCurrentDay()
    })).sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
  }, [actualTodayClasses, getActualCurrentDay])
  
  // Calculate actual today's progress for header and get today's current/next classes
  const { actualTotalClasses, actualDoneClasses, actualCurrentClass, actualNextClass } = useMemo(() => {
    const currentMinutes = getCurrentMinutes()
    let done = 0;
    let current = null;
    let next = null;
    
    // Sort actual today's classes
    const sortedActualClasses = [...actualTodayClasses].sort(
      (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
    );
    
    for (const classInfo of sortedActualClasses) {
      const startMinutes = timeToMinutes(classInfo.start);
      const endMinutes = timeToMinutes(classInfo.end);
      
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        current = classInfo;
      } else if (currentMinutes < startMinutes && !next) {
        next = classInfo;
      } else if (currentMinutes >= endMinutes) {
        done++;
      }
    }
    
    return {
      actualTotalClasses: sortedActualClasses.length,
      actualDoneClasses: done,
      actualCurrentClass: current,
      actualNextClass: next
    };
  }, [actualTodayClasses, getCurrentMinutes])

  // We don't need to calculate this anymore since we're using actual values everywhere

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
        {/* Fixed Header with Current Class and Next Class */}
        <Header
          greeting={getGreeting()}
          currentDay={getActualCurrentDay()}
          formattedTime={getFormattedTime()}
          selection={selection}
          doneClasses={actualDoneClasses}
          totalClasses={actualTotalClasses}
          nextClass={actualNextClass}
          currentClass={actualCurrentClass}
          sortedTodayClasses={sortedActualTodayClasses}
          calculateTimeUntilStart={calculateTimeUntilStart}
          calculateRemainingTime={calculateRemainingTime}
          syncStatus={syncStatus}
          isOnline={isOnline}
          onRetrySync={retrySyncAction}
        />

        {/* Status Card in Header */}
        <div className="flex-shrink-0 max-w-md mx-auto w-full px-4">
          <StatusCard
            currentClass={actualCurrentClass}
            nextClass={actualNextClass}
            totalClasses={actualTotalClasses}
            doneClasses={actualDoneClasses}
          />

          <ViewToggle 
            viewWeekly={viewWeekly} 
            setViewWeekly={setViewWeekly} 
            onResetDay={() => setSelectedDay('')}
          />
          
          {!viewWeekly && (
            <DaySelector 
              onDaySelect={(day) => setSelectedDay(day)} 
              currentDay={getActualCurrentDay()}
            />
          )}
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
                  currentClass={actualCurrentClass}
                  nextClass={actualNextClass}
                  selection={selection}
                  calculateRemainingTime={calculateRemainingTime}
                  calculateTimeUntilStart={calculateTimeUntilStart}
                />
              ) : (
                <TodaySchedule
                  sortedTodayClasses={sortedTodayClasses}
                  currentClass={actualCurrentClass}
                  nextClass={actualNextClass}
                  getCurrentMinutes={getCurrentMinutes}
                  timeToMinutes={timeToMinutes}
                  selection={selection}
                  calculateRemainingTime={calculateRemainingTime}
                  calculateTimeUntilStart={calculateTimeUntilStart}
                  selectedDay={getCurrentDay()}
                />
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navbar */}
        <div className="flex-shrink-0 flex justify-center px-4">
          <Navbar currentPage="home" />
        </div>
      </div>
      
      
    </div>
  )
}
