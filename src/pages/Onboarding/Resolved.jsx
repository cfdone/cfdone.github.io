import { useMemo } from "react";
import TimeTable from "../../assets/timetable.json";

export default function Resolved({ subjects, onPrev, onNext }) {
    // Build custom timetable based on selected subjects from different degrees/sections
    const customTimetable = useMemo(() => {
        if (!subjects || subjects.length === 0) {
            return {};
        }

        const timetable = {};
        
        // Initialize days
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        days.forEach(day => {
            timetable[day] = [];
        });

        // Collect all slots for selected subjects from their respective degrees/sections
        subjects.forEach(subject => {
            const sectionData = TimeTable[subject.degree][subject.semester][subject.section];
            Object.entries(sectionData).forEach(([day, slots]) => {
                slots.forEach(slot => {
                    if (slot.course === subject.name) {
                        timetable[day].push({
                            ...slot,
                            subject: subject.name,
                            degree: subject.degree,
                            semester: subject.semester,
                            section: subject.section
                        });
                    }
                });
            });
        });

        // Sort slots by start time for each day
        Object.keys(timetable).forEach(day => {
            if (timetable[day].length > 1) {
                // Convert time strings to minutes for proper sorting
                const timeToMinutes = (timeStr) => {
                    if (!timeStr || typeof timeStr !== 'string') return 0;
                    
                    // Handle different time formats
                    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
                    if (!timeMatch) return 0;
                    
                    const hours = parseInt(timeMatch[1], 10);
                    const minutes = parseInt(timeMatch[2], 10);
                    
                    // Validate hours and minutes
                    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
                    
                    return hours * 60 + minutes;
                };
                
                timetable[day].sort((a, b) => {
                    const timeA = timeToMinutes(a.start);
                    const timeB = timeToMinutes(b.start);
                    
                    // If either time is invalid, maintain original order
                    if (timeA === 0 || timeB === 0) return 0;
                    
                    return timeA - timeB;
                });
            }
        });

        return timetable;
    }, [subjects]);

    const handleCreateTimetable = () => {
        onNext({
            subjects: subjects,
            timetable: customTimetable,
            isCustom: true
        });
    };

    // Group subjects by degree for display
    const subjectsByDegree = subjects.reduce((acc, subject) => {
        const key = `${subject.degree} - Sem ${subject.semester}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(subject);
        return acc;
    }, {});

    return (
        <>
            <div className="h-full flex flex-col justify-between items-center w-full">
                <div className="flex flex-col items-center gap-3 px-3 py-3 w-full max-w-md mx-auto overflow-y-auto flex-1">
                    
                    <div className="text-center">
                        <p className="text-white text-center mt-1 mb-1 font-product-sans text-sm">
                            Review Your <span className="text-accent">Custom Timetable</span>
                        </p>
                        <p className="text-white/70 text-xs font-product-sans">
                            {subjects.length} Subject{subjects.length !== 1 ? 's' : ''} from Multiple Degrees/Sections
                        </p>
                    </div>
                    
                    <div className="w-full flex flex-col gap-3 items-center">
                        {/* Selected Subjects Summary - Grouped by Degree */}
                        <div className="bg-white/10 rounded-xl p-2 w-full border border-accent/20">
                            <div className="text-center mb-2">
                                <p className="text-accent font-bold text-xs">
                                    {subjects.length} Subject{subjects.length !== 1 ? 's' : ''} Selected
                                </p>
                            </div>
                            <div className="space-y-2 max-h-24 overflow-y-auto">
                                {Object.entries(subjectsByDegree).map(([degreeKey, degreeSubjects]) => (
                                    <div key={degreeKey} className="bg-white/5 rounded-lg p-1.5">
                                        <h6 className="text-accent font-semibold text-xs mb-1 border-b border-white/10 pb-1">
                                            {degreeKey}
                                        </h6>
                                        <div className="flex flex-wrap gap-1">
                                            {degreeSubjects.map((subject, idx) => (
                                                <span key={idx} className="px-1.5 py-0.5 bg-accent text-white text-xs rounded-full">
                                                    {subject.name} (Sec {subject.section})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Compact Timetable Preview */}
                        <div className="bg-white/10 rounded-xl p-2 w-full border border-accent/20">
                            <h4 className="text-accent font-bold text-xs mb-2 text-center">Timetable Overview</h4>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {Object.entries(customTimetable).map(([day, slots]) => {
                                    if (slots.length === 0) return null;
                                    return (
                                        <div key={day} className="bg-white/5 rounded-lg p-1.5">
                                            <h5 className="text-accent font-bold text-xs mb-1 border-b border-white/10 pb-1">{day}</h5>
                                            <div className="space-y-1">
                                                {slots.map((slot, idx) => (
                                                    <div key={idx} className="text-white text-xs bg-white/5 rounded p-1.5">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-accent font-semibold text-xs bg-accent/20 px-1.5 py-0.5 rounded">
                                                                {slot.start} - {slot.end}
                                                            </span>
                                                            <span className="text-white/70 text-xs bg-white/10 px-1.5 py-0.5 rounded">
                                                                {slot.room}
                                                            </span>
                                                        </div>
                                                        <div className="text-white font-medium text-xs mb-1 truncate">
                                                            {slot.course}
                                                        </div>
                                                        <div className="text-white/70 text-xs">
                                                            👨‍🏫 {slot.teacher}
                                                        </div>
                                                        <div className="text-accent/70 text-xs mt-1 truncate">
                                                            {slot.degree} - Sem {slot.semester} - Sec {slot.section}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-2 items-center justify-center w-full max-w-md mx-auto px-3 pb-4">
                    <button
                        className="bg-white/10 border text-white border-accent/10 hover:bg-accent/10 font-product-sans px-3 py-2 rounded-xl w-full text-[14px] transition"
                        onClick={onPrev}
                    >
                        Back
                    </button>
                    <button
                        className="bg-accent text-white font-product-sans px-3 py-2 rounded-xl w-full text-[14px] transition shadow-md"
                        onClick={handleCreateTimetable}
                    >
                        Create Timetable
                    </button>
                </div>
            </div>
        </>
    );
}