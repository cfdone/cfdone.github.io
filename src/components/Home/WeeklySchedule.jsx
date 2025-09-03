import { Star, Clock, MapPin } from 'lucide-react'

export default function WeeklySchedule({
  timetableData,
  getCurrentDay,
  timeToMinutes,
  getCurrentMinutes,
  currentClass,
  nextClass,
  selection,
  calculateRemainingTime,
  calculateTimeUntilStart,
}) {
  // Only show weekdays (Monday-Friday)
  const weekdaysOnly = (day) => {
    // Only include Monday through Friday
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day);
  }
  
  return (
    <div className="space-y-3">
      {Object.entries(timetableData)
        .filter(([day]) => weekdaysOnly(day))
        .map(([day, classes]) => {
          const isToday = day === getCurrentDay()
          return (
            <div key={day}>
              <div className="bg-white/5 rounded-xl border border-accent/10 overflow-hidden">
              <div
                className={`p-3 border-b border-accent/10 ${isToday ? 'bg-accent/10' : 'bg-white/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isToday && (
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    )}
                    <h3 className="text-white font-product-sans font-bold">
                      {day} {isToday && <span className="text-accent text-sm">(Today)</span>}
                    </h3>
                  </div>
                  <div className="text-white/80 text-sm font-product-sans">
                    {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-accent/5">
                {classes.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="mb-2 flex justify-center">
                      <Star className="w-6 h-6 text-accent/60" />
                    </div>
                    <div className="text-accent/60 font-product-sans text-sm">
                      No classes scheduled
                    </div>
                  </div>
                ) : (
                  classes
                    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
                    .map((classInfo, idx) => {
                      // Check if this is current/past class for today
                      const isCurrentToday = isToday && currentClass && currentClass === classInfo
                      const isNextToday = isToday && nextClass && nextClass === classInfo
                      const isPastToday =
                        isToday && getCurrentMinutes() >= timeToMinutes(classInfo.end)

                      return (
                        <div
                          key={idx}
                          className={`p-4 transition-colors ${
                            isCurrentToday ? 'bg-red-500/10' : isNextToday ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            {/* Left: Course info */}
                            <div className="flex-1 pr-4">
                              <div className="flex items-center gap-2 mb-2">
                                {/* Status indicator */}
                                <div
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    isCurrentToday
                                      ? 'bg-red-400 animate-pulse'
                                      : isNextToday
                                        ? 'bg-blue-400'
                                        : isPastToday
                                          ? 'bg-green-400'
                                          : 'bg-accent/40'
                                  }`}
                                ></div>
                                <h4
                                  className={`font-product-sans font-bold text-sm ${
                                    isPastToday ? 'text-white/60' : 'text-white'
                                  }`}
                                >
                                  {classInfo.course}
                                </h4>
                                {isCurrentToday && (
                                  <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-product-sans font-medium">
                                    Live
                                  </span>
                                )}
                                {isNextToday && (
                                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs font-product-sans font-medium">
                                    Next
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div
                                  className={`flex items-center gap-2 text-xs font-product-sans ${
                                    isPastToday ? 'text-accent/50' : 'text-accent/80'
                                  }`}
                                >
                                  <MapPin className="w-3 h-3" />
                                  <span>{classInfo.room}</span>
                                </div>
                                <div
                                  className={`text-xs font-product-sans ${
                                    isPastToday ? 'text-accent/40' : 'text-accent/70'
                                  }`}
                                >
                                  {classInfo.teacher}
                                </div>
                                {/* Show degree/section for lagger students */}
                                {selection &&
                                  selection.studentType === 'lagger' &&
                                  classInfo.degree && (
                                    <div
                                      className={`text-xs font-product-sans ${
                                        isPastToday ? 'text-accent/30' : 'text-accent/50'
                                      }`}
                                    >
                                      {classInfo.degree} • S{classInfo.semester}-{classInfo.section}
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Right: Time info */}
                            <div className="text-right flex-shrink-0">
                              <div
                                className={`font-product-sans font-bold text-base ${
                                  isPastToday ? 'text-white/50' : 'text-white'
                                }`}
                              >
                                {classInfo.start}
                              </div>
                              <div
                                className={`font-product-sans text-xs ${
                                  isPastToday ? 'text-accent/30' : 'text-accent/60'
                                }`}
                              >
                                {classInfo.end}
                              </div>

                              {/* Status messages for today's classes */}
                              {isCurrentToday && (
                                <div className="text-red-400 font-product-sans text-xs font-medium mt-1">
                                  {calculateRemainingTime(classInfo.end)}
                                </div>
                              )}
                              {isNextToday && (
                                <div className="text-blue-400 font-product-sans text-xs font-medium mt-1">
                                  {calculateTimeUntilStart(classInfo.start)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
