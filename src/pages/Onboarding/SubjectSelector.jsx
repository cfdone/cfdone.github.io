import { useState, useMemo } from "react";
import TimeTable from "../../assets/timetable.json";

export default function SubjectSelector({ onPrev, onNext }) {
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [currentDegree, setCurrentDegree] = useState("");
    const [currentSemester, setCurrentSemester] = useState("");
    const [currentSection, setCurrentSection] = useState("");

    // Get all available degrees, semesters, and sections
    const degreeNames = Object.keys(TimeTable);
    const semesterNames = currentDegree ? Object.keys(TimeTable[currentDegree]) : [];
    const sectionNames = currentDegree && currentSemester
        ? Object.keys(TimeTable[currentDegree][currentSemester])
        : [];

    // Get subjects for current selection
    const availableSubjects = useMemo(() => {
        if (!currentDegree || !currentSemester || !currentSection) return [];
        
        const subjects = new Set();
        const sectionData = TimeTable[currentDegree][currentSemester][currentSection];
        
        Object.values(sectionData).forEach(daySlots => {
            daySlots.forEach(slot => {
                if (slot.course) {
                    subjects.add(slot.course);
                }
            });
        });
        
        return Array.from(subjects).sort();
    }, [currentDegree, currentSemester, currentSection]);

    const handleSubjectToggle = (subject) => {
        setSelectedSubjects(prev => {
            // Check if this subject is already selected from any section
            const isAlreadySelected = prev.some(s => s.name === subject);
            
            if (isAlreadySelected) {
                // Remove the subject from all sections if it exists
                return prev.filter(s => s.name !== subject);
            } else {
                // Add the subject from current selection
                return [...prev, {
                    name: subject,
                    degree: currentDegree,
                    semester: currentSemester,
                    section: currentSection
                }];
            }
        });
    };

    const isSubjectSelected = (subject) => {
        // Check if subject is selected from any section (not just current one)
        return selectedSubjects.some(s => s.name === subject);
    };

    const handleNext = () => {
        if (selectedSubjects.length > 0) {
            onNext({
                subjects: selectedSubjects
            });
        }
    };

    const removeSubject = (subjectToRemove) => {
        setSelectedSubjects(prev => prev.filter(s => s !== subjectToRemove));
    };

    const clearAll = () => {
        setSelectedSubjects([]);
    };

    return (
        <>
            <div className="h-full flex flex-col justify-between items-center w-full">
                <div className="flex flex-col items-center gap-4 px-4 py-4 w-full max-w-md mx-auto overflow-y-auto flex-1">
                    
                    <div className="text-center">
                        <p className="text-white text-center mt-2 mb-2 font-product-sans">
                            Select <span className="text-accent">Subjects</span> from Any Degree/Section
                        </p>
                        <p className="text-white/70 text-sm font-product-sans">
                            Browse different degrees and sections to build your custom timetable
                        </p>
                        <p className="text-white/50 text-xs font-product-sans mt-1">
                            Note: Each subject can only be selected once
                        </p>
                    </div>
                    
                    {/* Degree/Semester/Section Selector */}
                    <div className="w-full flex flex-col gap-3">
                        {/* Degree Selection */}
                        <div className="w-full">
                            <p className="text-white text-center mb-2 font-product-sans text-sm">
                                Choose Degree
                            </p>
                            <div className="flex flex-row flex-wrap gap-1 justify-center overflow-x-auto pb-2">
                                {degreeNames.map((deg) => (
                                    <button
                                        key={deg}
                                        type="button"
                                        className={`min-w-[90px] px-2 py-1 rounded-full font-product-sans text-[15px] border transition shadow-sm
                                            ${currentDegree === deg
                                                ? "bg-accent text-white border-accent shadow-md"
                                                : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                            }
                                        `}
                                        onClick={() => {
                                            setCurrentDegree(deg);
                                            setCurrentSemester("");
                                            setCurrentSection("");
                                        }}
                                    >
                                        {deg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Semester Selection */}
                        {currentDegree && (
                            <div className="w-full">
                                <p className="text-white text-center mb-2 font-product-sans text-sm">
                                    Choose Semester
                                </p>
                                <div className="flex flex-row flex-wrap gap-1 justify-center overflow-x-auto pb-2">
                                    {semesterNames.map((sem) => (
                                        <button
                                            key={sem}
                                            type="button"
                                            className={`min-w-[60px] px-2 py-1 rounded-full font-product-sans text-[15px] border transition shadow-sm
                                                ${currentSemester === sem
                                                    ? "bg-accent text-white border-accent shadow-md"
                                                    : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                                }
                                            `}
                                            onClick={() => {
                                                setCurrentSemester(sem);
                                                setCurrentSection("");
                                            }}
                                        >
                                            {sem}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section Selection */}
                        {currentSemester && (
                            <div className="w-full">
                                <p className="text-white text-center mb-2 font-product-sans text-sm">
                                    Choose Section
                                </p>
                                <div className="flex flex-row flex-wrap gap-1 justify-center overflow-x-auto pb-2">
                                    {sectionNames.map((sec) => (
                                        <button
                                            key={sec}
                                            type="button"
                                            className={`min-w-[60px] px-2 py-1 rounded-full font-product-sans text-[15px] border transition shadow-sm
                                                ${currentSection === sec
                                                    ? "bg-accent text-white border-accent shadow-md"
                                                    : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                                }
                                            `}
                                            onClick={() => setCurrentSection(sec)}
                                        >
                                            {sec}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subject Selection */}
                    {currentSection && (
                        <div className="w-full flex flex-col gap-3">
                            <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
                                <p className="text-accent text-center font-semibold text-sm mb-2">
                                    {currentDegree} - Semester {currentSemester} - Section {currentSection}
                                </p>
                                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                    {availableSubjects.map((subject) => {
                                        const isSelected = isSubjectSelected(subject);
                                        const isFromCurrentSection = selectedSubjects.some(s => 
                                            s.name === subject && 
                                            s.degree === currentDegree && 
                                            s.semester === currentSemester && 
                                            s.section === currentSection
                                        );
                                        const isFromOtherSection = isSelected && !isFromCurrentSection;
                                        
                                        return (
                                            <button
                                                key={subject}
                                                type="button"
                                                disabled={isFromOtherSection}
                                                className={`w-full px-3 py-2 rounded-lg font-product-sans text-[14px] border transition-all duration-200 shadow-sm flex items-center justify-between
                                                    ${isFromOtherSection
                                                        ? "bg-gray-500/30 text-gray-400 border-gray-500/30 cursor-not-allowed"
                                                        : isSelected
                                                        ? "bg-accent text-white border-accent shadow-md"
                                                        : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                                    }
                                                `}
                                                onClick={() => handleSubjectToggle(subject)}
                                            >
                                                <span className="font-medium">{subject}</span>
                                                {isSelected && (
                                                    <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {isFromOtherSection && (
                                                    <div className="text-xs text-gray-400 ml-2">
                                                        Already selected
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Selected Subjects Summary */}
                    {selectedSubjects.length > 0 && (
                        <div className="w-full">
                            <div className="bg-accent/10 rounded-xl p-3 border border-accent/20">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-accent font-semibold text-sm">
                                        {selectedSubjects.length} Subject{selectedSubjects.length !== 1 ? 's' : ''} Selected
                                    </span>
                                    <button
                                        onClick={clearAll}
                                        className="text-accent/70 hover:text-accent text-xs underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {selectedSubjects.map((subject, idx) => (
                                        <div key={idx} className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="text-white font-medium text-xs">{subject.name}</div>
                                                <div className="text-white/70 text-xs">
                                                    {subject.degree} - Sem {subject.semester} - Sec {subject.section}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeSubject(subject)}
                                                className="ml-2 text-white/70 hover:text-white text-sm bg-white/20 rounded-full w-6 h-6 flex items-center justify-center"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-row gap-3 items-center justify-center w-full max-w-md mx-auto px-4 pb-6">
                    <button
                        className="bg-white/10 border text-white border-accent/10 hover:bg-accent/10 font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition"
                        onClick={onPrev}
                    >
                        Back
                    </button>
                    
                    <button
                        className={`font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md
                            ${selectedSubjects.length > 0
                                ? "bg-accent text-white"
                                : "bg-accent/40 text-white/60"
                            }
                        `}
                        disabled={selectedSubjects.length === 0}
                        onClick={handleNext}
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}
