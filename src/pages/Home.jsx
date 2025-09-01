import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/logo.svg";

export default function Home() {
    const location = useLocation();
    const selection = location.state || null;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [viewWeekly, setViewWeekly] = useState(false);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Get current day
    const getCurrentDay = useCallback(() => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return days[currentTime.getDay()];
    }, [currentTime]);

    // Get greeting based on time
    const getGreeting = useCallback(() => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    }, [currentTime]);

    // Get formatted time
    const getFormattedTime = useCallback(() => {
        return currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }, [currentTime]);

    // Parse time string to minutes (handles both AM/PM and 24-hour format)
    const timeToMinutes = useCallback((timeStr) => {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (!timeMatch) return 0;
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        
        // Convert to 24-hour format based on typical class schedule logic
        // Times before 8:00 are considered PM (afternoon/evening classes)
        // Times 8:00 and after are considered AM (morning classes) until they reach afternoon
        if (hours >= 1 && hours < 8 && hours !== 12) {
            // This is likely a PM time (1:00-7:59 PM)
            hours += 12;
        }
        
        return hours * 60 + minutes;
    }, []);

    // Get current time in minutes
    const getCurrentMinutes = useCallback(() => {
        return currentTime.getHours() * 60 + currentTime.getMinutes();
    }, [currentTime]);

    // Calculate remaining time
    const calculateRemainingTime = useCallback((endTime) => {
        const endMinutes = timeToMinutes(endTime);
        const currentMinutes = getCurrentMinutes();
        const diff = endMinutes - currentMinutes;
        
        if (diff <= 0) return "Ended";
        
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    }, [timeToMinutes, getCurrentMinutes]);

    // Calculate time until start
    const calculateTimeUntilStart = useCallback((startTime) => {
        const startMinutes = timeToMinutes(startTime);
        const currentMinutes = getCurrentMinutes();
        const diff = startMinutes - currentMinutes;
        
        if (diff <= 0) return "Started";
        
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        
        if (hours > 0) {
            return `Starts in ${hours}h ${minutes}m`;
        }
        return `Starts in ${minutes}m`;
    }, [timeToMinutes, getCurrentMinutes]);

    // Get timetable data
    const timetableData = useMemo(() => {
        if (!selection) return {};
        if (selection.passtimetable) {
            return selection.passtimetable;
        }
        if (selection.timetable) {
            return selection.timetable;
        }
        return {};
    }, [selection]);

    const todayClasses = useMemo(() => {
        const currentDay = getCurrentDay();
        return timetableData[currentDay] || [];
    }, [timetableData, getCurrentDay]);

    // Sort today's classes by time
    const sortedTodayClasses = useMemo(() => {
        return [...todayClasses].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    }, [todayClasses, timeToMinutes]);

    // Find current and next class
    const { currentClass, nextClass, totalClasses, doneClasses } = useMemo(() => {
        const currentMinutes = getCurrentMinutes();
        let current = null;
        let next = null;
        let done = 0;

        for (const classInfo of sortedTodayClasses) {
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
            currentClass: current,
            nextClass: next,
            totalClasses: sortedTodayClasses.length,
            doneClasses: done
        };
    }, [sortedTodayClasses, getCurrentMinutes, timeToMinutes]);

    if (!selection) {
        return (
            <div className="fixed inset-0 bg-black">
                <div className="h-full overflow-y-auto no-scrollbar flex flex-col items-center justify-center px-4">
                    <h2 className="font-playfair text-accent font-medium text-xl mb-2 text-center">No timetable data provided.</h2>
                    <p className="text-white/70 text-center">Please go back and select your degree, semester, and section.</p>
                </div>
                <Navbar currentPage="home" />
            </div>
        );
    }

    const currentDay = getCurrentDay();

    return (
        <div className="fixed inset-0 bg-black">
            <div className="h-full overflow-y-auto no-scrollbar">
                <div className="min-h-full bg-black text-white pb-28">
                    {/* Header matching the attached image */}
                    <div className="p-2 pt-8 max-w-md mx-auto">
                        <div className="flex items-center justify-between mb-6 px-4">
                            <div>
                                <h1 className="font-playfair text-white text-2xl font-medium mb-1">{getGreeting()}</h1>
                                <p className="text-accent font-product-sans">Today is {currentDay}</p>
                                <p className="text-white text-xl font-product-sans">{getFormattedTime()}</p>
                            </div>
                           <img src={logo} alt="" className="h-10 w-10" />
                        </div>

                    {/* Highlight Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6 px-4">
                        {/* Total Classes Today */}
                        <div className="bg-white/10 p-4 rounded-xl border border-accent/10">
                            <div className="text-accent text-3xl font-bold mb-1">{totalClasses}</div>
                            <div className="text-white/70 text-sm font-product-sans">Total Classes Today</div>
                        </div>
                        
                        {/* Done Classes Today */}
                        <div className="bg-white/10 p-4 rounded-xl border border-accent/10">
                            <div className="text-green-400 text-3xl font-bold mb-1">{doneClasses}</div>
                            <div className="text-white/70 text-sm font-product-sans">Done Classes Today</div>
                        </div>
                    </div>

                    {/* Current and Next Class Row */}
                    <div className="mb-6 px-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Current Ongoing Class Column */}
                            <div>
                                <h3 className="font-playfair text-accent font-medium text-base mb-2">Current Class</h3>
                                {currentClass ? (
                                    <div className="bg-red-500/10 p-3 rounded-xl border border-red-400/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-white font-bold text-sm">{currentClass.course}</h4>
                                            <div className="flex items-center gap-1 text-red-400 text-xs font-medium">
                                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                                                LIVE
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mb-2">
                                            <div>
                                                <div className="text-white/50 text-xs font-product-sans uppercase">Time</div>
                                                <div className="text-accent font-bold text-sm">{currentClass.start} - {currentClass.end}</div>
                                            </div>
                                            <div>
                                                <div className="text-white/50 text-xs font-product-sans uppercase">Room</div>
                                                <div className="text-white font-semibold text-sm">{currentClass.room}</div>
                                            </div>
                                            <div>
                                                <div className="text-white/50 text-xs font-product-sans uppercase">Teacher</div>
                                                <div className="text-white font-semibold text-sm">{currentClass.teacher}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-black/20 p-2 rounded-lg">
                                            <div className="text-white/50 text-xs font-product-sans uppercase mb-1">Time Remaining</div>
                                            <div className="text-red-400 font-bold text-sm">
                                                {calculateRemainingTime(currentClass.end)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/10 p-3 rounded-xl border border-accent/20 text-center">
                                        <div className="flex flex-col items-center justify-center py-3">
                                            <div className="text-2xl mb-2">⏸️</div>
                                            <h4 className="text-white font-bold text-sm mb-1">No Ongoing Class</h4>
                                            <p className="text-white/70 font-product-sans text-xs">
                                                Take a break!
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Next Class Column */}
                            <div>
                                <h3 className="font-playfair text-accent font-medium text-base mb-2">Next Class</h3>
                                {nextClass ? (
                                    <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-400/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-white font-bold text-sm">{nextClass.course}</h4>
                                            <div className="flex items-center gap-1 text-blue-400 text-xs font-medium">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                                UPCOMING
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mb-2">
                                            <div>
                                                <div className="text-white/50 text-xs font-product-sans uppercase">Time</div>
                                                <div className="text-accent font-bold text-sm">{nextClass.start} - {nextClass.end}</div>
                                            </div>
                                            <div>
                                                <div className="text-white/50 text-xs font-product-sans uppercase">Room</div>
                                                <div className="text-white font-semibold text-sm">{nextClass.room}</div>
                                            </div>
                                            <div>
                                                <div className="text-white/50 text-xs font-product-sans uppercase">Teacher</div>
                                                <div className="text-white font-semibold text-sm">{nextClass.teacher}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-black/20 p-2 rounded-lg">
                                            <div className="text-white/50 text-xs font-product-sans uppercase mb-1">Time to Start</div>
                                            <div className="text-blue-400 font-bold text-sm">
                                                {calculateTimeUntilStart(nextClass.start)}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/10 p-3 rounded-xl border border-accent/20 text-center">
                                        <div className="flex flex-col items-center justify-center py-3">
                                            <div className="text-2xl mb-2">
                                                {totalClasses === 0 ? '📚' : doneClasses === totalClasses ? '🎉' : '⏭️'}
                                            </div>
                                            <h4 className="text-white font-bold text-sm mb-1">
                                                {totalClasses === 0 ? 'No Classes Today' : doneClasses === totalClasses ? 'All Done!' : 'No More Classes'}
                                            </h4>
                                            <p className="text-white/70 font-product-sans text-xs">
                                                {totalClasses === 0 
                                                    ? 'Free day!' 
                                                    : doneClasses === totalClasses 
                                                        ? 'Great job!' 
                                                        : 'Time to relax!'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Classes List */}
                    <div className="px-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-playfair text-accent font-medium text-lg">
                                {viewWeekly ? "Weekly Schedule" : "Today's Classes"}
                            </h3>
                            <button 
                                onClick={() => setViewWeekly(!viewWeekly)}
                                className="text-accent font-product-sans text-sm underline hover:text-accent/80 transition-colors duration-200"
                            >
                                {viewWeekly ? "View Today" : "View Weekly"}
                            </button>
                        </div>
                        
                        {viewWeekly ? (
                            // Weekly view
                            <div className="space-y-4">
                                {Object.entries(timetableData).map(([day, classes]) => (
                                    <div key={day} className="bg-white/10 rounded-xl border border-accent/10 overflow-hidden">
                                        <div className="bg-accent/10 p-3 border-b border-accent/10">
                                            <h4 className="text-accent font-bold">{day}</h4>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            {classes.length === 0 ? (
                                                <div className="text-white/50 text-sm font-product-sans">No classes</div>
                                            ) : (
                                                classes
                                                    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
                                                    .map((classInfo, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                                            <div>
                                                                <div className="text-white font-medium text-sm">{classInfo.course}</div>
                                                                <div className="text-white/70 text-xs font-product-sans">
                                                                    {classInfo.teacher} • {classInfo.room}
                                                                </div>
                                                            </div>
                                                            <div className="text-accent text-sm font-product-sans">
                                                                {classInfo.start} - {classInfo.end}
                                                            </div>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Today's classes
                            <div className="space-y-3">
                                {sortedTodayClasses.length === 0 ? (
                                    <div className="bg-white/10 p-4 rounded-xl border border-accent/10 text-center">
                                        <div className="text-white/70 font-product-sans">No classes today</div>
                                    </div>
                                ) : (
                                    sortedTodayClasses.map((classInfo, idx) => {
                                        const isCurrentClass = currentClass && currentClass === classInfo;
                                        const isNextClass = nextClass && nextClass === classInfo;
                                        const isPastClass = getCurrentMinutes() >= timeToMinutes(classInfo.end);

                                        return (
                                            <div 
                                                key={idx} 
                                                className={`p-4 rounded-xl border transition-all duration-200 ${
                                                    isCurrentClass 
                                                        ? "bg-accent/10 border-accent text-accent" 
                                                        : isNextClass 
                                                            ? "bg-white/10 border-accent/20 text-white" 
                                                            : isPastClass 
                                                                ? "bg-white/5 border-accent/10 text-white/50" 
                                                                : "bg-white/10 border-accent/10 text-white"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-base">{classInfo.course}</h4>
                                                    <div className="text-sm">
                                                        {isCurrentClass && "🔴 Live"}
                                                        {isNextClass && "⏱️ Next"}
                                                        {isPastClass && "✅ Done"}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-product-sans opacity-80 mb-1">
                                                    {classInfo.start} - {classInfo.end} • {classInfo.room}
                                                </div>
                                                <div className="text-sm font-product-sans opacity-80">
                                                    Teacher: {classInfo.teacher}
                                                </div>
                                                {isCurrentClass && (
                                                    <div className="text-accent font-medium text-sm mt-2">
                                                        {calculateRemainingTime(classInfo.end)}
                                                    </div>
                                                )}
                                                {isNextClass && (
                                                    <div className="text-accent font-medium text-sm mt-2">
                                                        {calculateTimeUntilStart(classInfo.start)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
            <div className="flex justify-center items-center w-full">
                <Navbar currentPage="home" />
                </div>

        </div>
    );
}
