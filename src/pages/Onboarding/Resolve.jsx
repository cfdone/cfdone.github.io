import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import TimeTable from "../../assets/timetable.json";
import logo from "../../assets/logo.svg";
import StepTrack from "../../components/Onboarding/StepTrack";

// Memoized SubjectItem component for better performance
const SubjectItem = memo(({ subjectData, isSelected, onToggle, isResolving }) => {
    return (
        <button
            type="button"
            className={`p-4 rounded-xl font-product-sans text-base border transition-all duration-200 text-left w-full
                ${isSelected
                    ? "bg-accent text-white border-accent shadow-lg"
                    : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                }
                ${isResolving ? "opacity-70 cursor-not-allowed" : ""}
            `}
            onClick={() => !isResolving && onToggle(subjectData)}
            disabled={isResolving}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="font-bold mb-2 flex items-center gap-2">
                        {subjectData.name}
                        {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {isResolving && isSelected && (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                    </div>
                    <div className="text-sm opacity-80 space-y-1">
                        <div className="font-medium">Available in {subjectData.locations.length} section{subjectData.locations.length > 1 ? 's' : ''}:</div>
                        {subjectData.locations.slice(0, 2).map((loc, locIdx) => (
                            <div key={locIdx} className="text-xs opacity-70">
                                📍 {loc.degree} • S{loc.semester}-{loc.section} {loc.teacher ? `• ${loc.teacher}` : ''}
                            </div>
                        ))}
                        {subjectData.locations.length > 2 && (
                            <div className="text-xs opacity-70">
                                +{subjectData.locations.length - 2} more sections available
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-xl ml-3">📚</div>
            </div>
        </button>
    );
});

SubjectItem.displayName = 'SubjectItem';

export default function Resolve() {
    const navigate = useNavigate();
    
    // Initial subject selection state
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [resolvedTimetable, setResolvedTimetable] = useState(null);
    const [conflictSubjects, setConflictSubjects] = useState([]);
    const [resolutionSuggestions, setResolutionSuggestions] = useState([]);
    const [showSubjectSelector, setShowSubjectSelector] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [displayLimit, setDisplayLimit] = useState(20); // Start with 20 subjects
    
    // Loader states
    const [isCreating, setIsCreating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState("");

    // Debounced search term
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            // Reset display limit when search changes
            setDisplayLimit(20);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Get all unique subjects with their degree/section information (memoized)
    const allSubjectsWithInfo = useMemo(() => {
        const subjectsMap = new Map();
        
        Object.entries(TimeTable).forEach(([degree, semesters]) => {
            Object.entries(semesters).forEach(([semester, sections]) => {
                Object.entries(sections).forEach(([section, dayData]) => {
                    Object.values(dayData).forEach(daySlots => {
                        daySlots.forEach(slot => {
                            if (slot.course) {
                                const key = slot.course;
                                if (!subjectsMap.has(key)) {
                                    subjectsMap.set(key, []);
                                }
                                // Avoid duplicate locations
                                const existingLocation = subjectsMap.get(key).find(loc => 
                                    loc.degree === degree && loc.semester === semester && loc.section === section
                                );
                                if (!existingLocation) {
                                    subjectsMap.get(key).push({
                                        degree,
                                        semester,
                                        section,
                                        teacher: slot.teacher,
                                        room: slot.room
                                    });
                                }
                            }
                        });
                    });
                });
            });
        });

        // Convert to array and sort
        return Array.from(subjectsMap.entries()).map(([subject, locations]) => ({
            name: subject,
            locations: locations
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    // Filter subjects based on search term (memoized and debounced)
    const filteredSubjects = useMemo(() => {
        if (!debouncedSearchTerm.trim()) return allSubjectsWithInfo;
        const searchLower = debouncedSearchTerm.toLowerCase();
        return allSubjectsWithInfo.filter(subject => 
            subject.name.toLowerCase().includes(searchLower) ||
            subject.locations.some(loc => 
                loc.degree.toLowerCase().includes(searchLower) ||
                loc.teacher?.toLowerCase().includes(searchLower)
            )
        );
    }, [allSubjectsWithInfo, debouncedSearchTerm]);

    // Limited subjects for display to prevent performance issues
    const displayedSubjects = useMemo(() => {
        return filteredSubjects.slice(0, displayLimit);
    }, [filteredSubjects, displayLimit]);

    // Load more subjects function
    const loadMoreSubjects = useCallback(() => {
        setDisplayLimit(prev => Math.min(prev + 20, filteredSubjects.length));
    }, [filteredSubjects.length]);

    // Add resolving state
    const [isResolving, setIsResolving] = useState(false);
    const [resolutionProgress, setResolutionProgress] = useState(0);

    // Async resolution function with progress tracking
    const resolveSubjectsAsync = useCallback(async () => {
        // Time conversion utility - Fixed to handle both "1:45" and "01:45" formats
        const timeToMinutes = (timeStr) => {
            if (!timeStr || typeof timeStr !== 'string') return 0;
            const timeMatch = timeStr.match(/(\d{1,2}):(\d{1,2})/);
            if (!timeMatch) return 0;
            const hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
            return hours * 60 + minutes;
        };

        // Check if two time slots overlap - Enhanced with debugging
        const doTimeSlotsOverlap = (slot1, slot2) => {
            const start1 = timeToMinutes(slot1.start);
            const end1 = timeToMinutes(slot1.end);
            const start2 = timeToMinutes(slot2.start);
            const end2 = timeToMinutes(slot2.end);
            
            // Check for invalid times
            if (start1 === 0 || end1 === 0 || start2 === 0 || end2 === 0) {
                console.warn(`Invalid time detected:`, { 
                    slot1: { start: slot1.start, end: slot1.end, startMin: start1, endMin: end1 },
                    slot2: { start: slot2.start, end: slot2.end, startMin: start2, endMin: end2 }
                });
                return false;
            }
            
            const overlaps = start1 < end2 && start2 < end1;
            
            // Debug overlapping slots
            if (overlaps && slot1.subject && slot2.subject) {
                console.log(`Overlap detected: ${slot1.subject} (${slot1.start}-${slot1.end}) overlaps with ${slot2.subject} (${slot2.start}-${slot2.end})`);
            }
            
            return overlaps;
        };

        // Build timetable from a combination and count clashes
        const buildTimetableFromCombination = (combination) => {
            const timetable = {};
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            days.forEach(day => {
                timetable[day] = [];
            });

            let totalClashes = 0;
            const clashPairs = new Set(); // Track unique clash pairs to avoid double counting

            Object.entries(combination).forEach(([subject, locationInfo]) => {
                const sectionData = TimeTable[locationInfo.degree]?.[locationInfo.semester]?.[locationInfo.section];
                if (!sectionData) return;
                
                Object.entries(sectionData).forEach(([day, slots]) => {
                    if (!Array.isArray(slots)) return; // Safety check
                    
                    slots.forEach(slot => {
                        if (slot.course === subject) {
                            const newSlot = {
                                ...slot,
                                subject,
                                degree: locationInfo.degree,
                                semester: locationInfo.semester,
                                section: locationInfo.section
                            };

                            // Check for clashes with existing slots on the same day
                            const existingSlots = timetable[day];
                            
                            existingSlots.forEach(existingSlot => {
                                if (doTimeSlotsOverlap(newSlot, existingSlot)) {
                                    // Create unique identifier for this clash pair to avoid double counting
                                    const pairId = [newSlot.subject, existingSlot.subject].sort().join('-');
                                    if (!clashPairs.has(pairId)) {
                                        clashPairs.add(pairId);
                                        totalClashes++;
                                    }
                                }
                            });

                            timetable[day].push(newSlot);
                        }
                    });
                });
            });

            // Sort slots by time
            Object.keys(timetable).forEach(day => {
                timetable[day].sort((a, b) => {
                    const timeA = timeToMinutes(a.start);
                    const timeB = timeToMinutes(b.start);
                    return timeA - timeB;
                });
            });

            return { timetable, clashes: totalClashes };
        };

        // Optimized combination finder with better early termination logic
        const findBestCombination = async (subjects) => {
            let bestCombination = null;
            let minClashes = Infinity;
            let bestTimetable = null;
            let combinationsChecked = 0;
            let totalCombinations = 1;
            let perfectSolutionFound = false;

            // Calculate total combinations for progress tracking
            subjects.forEach(subject => {
                totalCombinations *= Math.min(subject.locations.length, 8); // Increased limit for better results
            });

            // Adjust limits based on complexity
            const MAX_COMBINATIONS = totalCombinations > 50000 ? 15000 : 25000;
            const shouldLimitCombinations = totalCombinations > MAX_COMBINATIONS;

            console.log(`Total possible combinations: ${totalCombinations}, Will check: ${Math.min(totalCombinations, MAX_COMBINATIONS)}`);

            // Generate combinations with better progress tracking
            const generateCombinations = async (subjectIndex = 0, currentCombination = {}) => {
                if (perfectSolutionFound || (shouldLimitCombinations && combinationsChecked >= MAX_COMBINATIONS)) {
                    return;
                }

                if (subjectIndex === subjects.length) {
                    const { timetable, clashes } = buildTimetableFromCombination(currentCombination);
                    combinationsChecked++;

                    if (clashes < minClashes) {
                        minClashes = clashes;
                        bestCombination = { ...currentCombination };
                        bestTimetable = timetable;

                        console.log(`New best combination found with ${clashes} clashes (checked ${combinationsChecked})`);

                        // Early termination only if perfect solution found
                        if (clashes === 0) {
                            perfectSolutionFound = true;
                            console.log(`Perfect solution found after checking ${combinationsChecked} combinations!`);
                            return;
                        }
                    }

                    // Update progress more frequently for better UX
                    if (combinationsChecked % 25 === 0) {
                        const maxToCheck = Math.min(totalCombinations, MAX_COMBINATIONS);
                        const progress = Math.min((combinationsChecked / maxToCheck) * 95, 95);
                        setResolutionProgress(progress);
                        
                        // Yield control to prevent UI freezing
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                    return;
                }

                const subject = subjects[subjectIndex];
                const availableLocations = subject.locations || [];
                
                // Use more locations for better results, but limit to prevent explosion
                const limitedLocations = availableLocations.slice(0, 8);

                for (const location of limitedLocations) {
                    if (perfectSolutionFound) break;
                    
                    currentCombination[subject.name] = location;
                    await generateCombinations(subjectIndex + 1, currentCombination);
                }
            };

            await generateCombinations();
            
            console.log(`Resolution complete: Best solution has ${minClashes} clashes after checking ${combinationsChecked} combinations`);
            
            return {
                combination: bestCombination,
                clashes: minClashes,
                timetable: bestTimetable,
                combinationsChecked,
                perfectSolutionFound
            };
        };

        // Find subjects that have conflicts - Improved detection logic
        const findConflictedSubjects = (timetable) => {
            const conflicted = new Set();
            
            Object.entries(timetable).forEach(([day, daySlots]) => {
                if (!Array.isArray(daySlots)) return; // Safety check
                
                for (let i = 0; i < daySlots.length; i++) {
                    for (let j = i + 1; j < daySlots.length; j++) {
                        const slot1 = daySlots[i];
                        const slot2 = daySlots[j];
                        
                        if (doTimeSlotsOverlap(slot1, slot2)) {
                            console.log(`Conflict detected on ${day}: ${slot1.subject} (${slot1.start}-${slot1.end}) vs ${slot2.subject} (${slot2.start}-${slot2.end})`);
                            conflicted.add(slot1.subject);
                            conflicted.add(slot2.subject);
                        }
                    }
                }
            });
            
            const conflictedArray = Array.from(conflicted);
            console.log(`Total conflicted subjects: ${conflictedArray.length}`, conflictedArray);
            return conflictedArray;
        };

        // Generate suggestions for resolving conflicts
        const generateResolutionSuggestions = (conflictedSubjects) => {
            const suggestions = [];
            
            conflictedSubjects.forEach(subjectName => {
                const subjectData = selectedSubjects.find(s => s.name === subjectName);
                if (!subjectData) return;
                
                const alternativeLocations = subjectData.locations.slice(1); // Show alternatives after the first one
                
                if (alternativeLocations.length > 0) {
                    suggestions.push({
                        subject: subjectName,
                        message: `${subjectName} has conflicts - try different sections`,
                        alternatives: alternativeLocations.slice(0, 3) // Show top 3 alternatives
                    });
                } else {
                    suggestions.push({
                        subject: subjectName,
                        message: `${subjectName} needs manual adjustment - limited sections available`,
                        alternatives: []
                    });
                }
            });
            
            return suggestions;
        };

        try {
            setResolutionProgress(5); // Start progress
            
            console.log(`Starting resolution for ${selectedSubjects.length} subjects...`);
            const result = await findBestCombination(selectedSubjects);
            
            setResolutionProgress(100);
            
            console.log(`Resolution result:`, {
                clashes: result.clashes,
                combinationsChecked: result.combinationsChecked,
                perfectSolution: result.perfectSolutionFound
            });
            
            if (result.clashes === 0) {
                // Perfect resolution found
                console.log('Perfect resolution - no conflicts!');
                setResolvedTimetable(result.timetable);
                setConflictSubjects([]);
                setResolutionSuggestions([]);
            } else {
                // Clashes exist, provide suggestions
                console.log(`Resolution found with ${result.clashes} clashes, analyzing conflicts...`);
                const conflicted = findConflictedSubjects(result.timetable);
                setConflictSubjects(conflicted);
                setResolutionSuggestions(generateResolutionSuggestions(conflicted));
                setResolvedTimetable(result.timetable);
            }
            
            // Small delay to show completion
            setTimeout(() => {
                setIsResolving(false);
                setResolutionProgress(0);
            }, 300);
            
        } catch (error) {
            console.error('Resolution error:', error);
            setIsResolving(false);
            setResolutionProgress(0);
        }
    }, [selectedSubjects]);

    // Debounced resolution - prevent immediate resolution on every subject change
    useEffect(() => {
        if (selectedSubjects.length === 0) {
            setResolvedTimetable(null);
            setConflictSubjects([]);
            setResolutionSuggestions([]);
            setIsResolving(false);
            return;
        }

        setIsResolving(true);
        setResolutionProgress(0);

        // Debounce the resolution by 500ms to prevent lag during rapid selections
        const timeoutId = setTimeout(() => {
            resolveSubjectsAsync();
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [selectedSubjects, resolveSubjectsAsync]);

    // Handle subject selection (memoized for performance)
    const handleSubjectToggle = useCallback((subjectData) => {
        const subjectName = subjectData.name;
        
        // Provide immediate visual feedback by updating state first
        setSelectedSubjects(prev => {
            const isAlreadySelected = prev.some(s => s.name === subjectName);
            if (isAlreadySelected) {
                return prev.filter(s => s.name !== subjectName);
            } else {
                // Add the subject with its first available location (the system will auto-resolve conflicts)
                return [...prev, {
                    name: subjectName,
                    locations: subjectData.locations,
                    selectedLocation: subjectData.locations[0] // Default to first location
                }];
            }
        });
        
        // Clear previous resolution state for immediate feedback
        if (!selectedSubjects.some(s => s.name === subjectName)) {
            // Adding a subject - show that we're about to resolve
            setIsResolving(true);
            setResolutionProgress(0);
        }
    }, [selectedSubjects]);

    const isSubjectSelected = useCallback((subjectName) => {
        return selectedSubjects.some(s => s.name === subjectName);
    }, [selectedSubjects]);

    const removeSubject = useCallback((subjectToRemove) => {
        setSelectedSubjects(prev => prev.filter(s => s !== subjectToRemove));
    }, []);

    const handleAddMore = useCallback(() => {
        setShowSubjectSelector(true);
    }, []);

    const clearAll = useCallback(() => {
        setSelectedSubjects([]);
    }, []);

    return (
        <>
        <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe">
            {/* Fixed Header */}
            <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
                <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
                <StepTrack currentStep={3} totalSteps={3} />
                <div className="text-center mb-6">
                    <h3 className=" font-playfair text-accent font-medium text-xl mb-2">Auto Clash Resolution</h3>
                    <p className="text-white/70 text-sm font-product-sans">
                        Select subjects and we'll automatically find the best sections to minimize conflicts
                    </p>
                </div>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar min-h-0">
                <div className="flex flex-col items-center gap-4 px-2 py-4 pb-8">
                    <div className="w-full">
                        <div className="flex flex-col gap-4">
                            {/* Initial Add Subjects Button */}
                            {selectedSubjects.length === 0 && (
                                <div className="text-center">
                                    <button
                                        onClick={handleAddMore}
                                        className="p-6 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left w-full bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold mb-2">Select Subjects</div>
                                                <div className="text-sm opacity-80">We'll automatically resolve any conflicts</div>
                                            </div>
                                            <div className="text-2xl ml-4">🎯</div>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {/* Selected Subjects and Resolution Status */}
                            {selectedSubjects.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold text-white flex items-center gap-2">
                                            Selected Subjects ({selectedSubjects.length})
                                            {isResolving && (
                                                <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                                            )}
                                        </div>
                                        <button
                                            onClick={clearAll}
                                            className="text-accent/70 hover:text-accent text-sm underline transition-colors"
                                            disabled={isResolving}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    
                                    {/* Resolution Status */}
                                    {resolvedTimetable && (
                                        <div className={`p-4 rounded-xl border ${
                                            conflictSubjects.length === 0 
                                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                                        }`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="text-xl">
                                                    {conflictSubjects.length === 0 ? "✅" : "⚠️"}
                                                </div>
                                                <div className="font-bold">
                                                    {conflictSubjects.length === 0 
                                                        ? "Perfect Resolution Found!" 
                                                        : `${conflictSubjects.length} Subject${conflictSubjects.length > 1 ? 's' : ''} Need${conflictSubjects.length > 1 ? '' : 's'} Manual Adjustment`
                                                    }
                                                </div>
                                            </div>
                                            <div className="text-sm opacity-80">
                                                {conflictSubjects.length === 0 
                                                    ? "All subjects have been automatically scheduled without conflicts"
                                                    : "We've minimized conflicts, but some subjects still clash and need manual resolution"
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Resolution Progress */}
                                    {isResolving && (
                                        <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-400">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                                                <div className="font-bold">Resolving Conflicts...</div>
                                                <div className="text-sm">({Math.round(resolutionProgress)}%)</div>
                                            </div>
                                            <div className="w-full bg-blue-400/20 rounded-full h-1.5 mb-2">
                                                <div 
                                                    className="bg-blue-400 h-1.5 rounded-full transition-all duration-200 ease-out" 
                                                    style={{ width: `${resolutionProgress}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-sm opacity-80">
                                                Analyzing {selectedSubjects.length} subjects across all available sections...
                                            </div>
                                        </div>
                                    )}

                                    {/* Resolution Suggestions */}
                                    {resolutionSuggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="font-bold text-white text-sm mb-2">Suggestions:</div>
                                            {resolutionSuggestions.map((suggestion, idx) => (
                                                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <div className="font-medium text-accent text-sm mb-1">
                                                        {suggestion.subject}
                                                    </div>
                                                    <div className="text-white/70 text-sm">
                                                        {suggestion.message}
                                                    </div>
                                                    {suggestion.alternatives.length > 0 && (
                                                        <div className="mt-2 text-xs text-white/50">
                                                            Available in: {suggestion.alternatives.map(alt => 
                                                                `${alt.degree} S${alt.semester}-${alt.section}`
                                                            ).join(", ")}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Selected Subjects List */}
                                    <div className="space-y-2">
                                        {selectedSubjects.map((subject, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left ${
                                                    conflictSubjects.includes(subject.name)
                                                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                                        : "bg-accent/10 text-accent border-accent/10 hover:bg-accent/20"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-bold mb-2 flex items-center gap-2">
                                                            {subject.name}
                                                            {conflictSubjects.includes(subject.name) && (
                                                                <span className="text-xs">⚠️</span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm opacity-80 space-y-1">
                                                            <div className="font-medium">Available in:</div>
                                                            {subject.locations.slice(0, 3).map((loc, locIdx) => (
                                                                <div key={locIdx} className="text-xs opacity-70">
                                                                    📍 {loc.degree} • Semester {loc.semester} • Section {loc.section}
                                                                </div>
                                                            ))}
                                                            {subject.locations.length > 3 && (
                                                                <div className="text-xs opacity-70">
                                                                    +{subject.locations.length - 3} more sections...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeSubject(subject)}
                                                        className="text-accent/70 hover:text-accent text-xl ml-4 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Fixed Navigation Buttons */}
            <div className="flex-shrink-0 w-full max-w-md mx-auto px-2 pt-4 pb-6">
                <div className="flex flex-col gap-3 w-full">
                    {/* Add More Subjects Button */}
                    {selectedSubjects.length > 0 && (
                        <button
                            onClick={handleAddMore}
                            className="w-full p-3 rounded-xl font-product-sans text-[15px] border transition-all duration-200 bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span>Add More Subjects</span>
                                <span className="text-lg">+</span>
                            </div>
                        </button>
                    )}
                    
                    {/* Navigation buttons */}
                    <div className="flex flex-row gap-3 items-center justify-center w-full">
                        <button
                            className="font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10"
                            onClick={() => navigate("/lagger")}
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
                            disabled={selectedSubjects.length === 0 || isCreating}
                            onClick={async () => {
                                if (selectedSubjects.length > 0 && resolvedTimetable) {
                                    setIsCreating(true);
                                    setProgress(0);
                                    
                                    // Fake progress simulation with Mars theme
                                    const steps = [
                                        { text: "Connecting to Mars servers...", duration: 800 },
                                        { text: "Analyzing subject conflicts...", duration: 1000 },
                                        { text: "Auto-resolving schedule clashes...", duration: 900 },
                                        { text: "Creating your timetable on Mars...", duration: 1200 },
                                        { text: "Applying final optimizations...", duration: 600 }
                                    ];

                                    let currentProgress = 0;
                                    
                                    for (let i = 0; i < steps.length; i++) {
                                        setProgressText(steps[i].text);
                                        const targetProgress = ((i + 1) / steps.length) * 100;
                                        
                                        // Animate progress smoothly
                                        while (currentProgress < targetProgress) {
                                            currentProgress += 2;
                                            setProgress(Math.min(currentProgress, targetProgress));
                                            await new Promise(resolve => setTimeout(resolve, 20));
                                        }
                                        
                                        // Wait for step duration
                                        await new Promise(resolve => setTimeout(resolve, steps[i].duration));
                                    }

                                    const timetableData = {
                                        subjects: selectedSubjects,
                                        timetable: resolvedTimetable,
                                        isCustom: true,
                                        isAutoResolved: true,
                                        hasConflicts: conflictSubjects.length > 0,
                                        conflictSubjects: conflictSubjects,
                                        resolutionSuggestions: resolutionSuggestions,
                                        studentType: 'lagger'
                                    };

                                    try {
                                        localStorage.setItem('onboardingComplete', 'true');
                                        localStorage.setItem('timetableData', JSON.stringify(timetableData));
                                    } catch (error) {
                                        console.error('Error saving to localStorage:', error);
                                    }

                                    navigate("/", {
                                        state: timetableData
                                    });
                                }
                            }}
                        >
                            {isCreating ? (
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="text-sm">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
                                        <div 
                                            className="bg-white h-1.5 rounded-full transition-all duration-75 ease-out" 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs opacity-80">{progressText}</div>
                                </div>
                            ) : (
                                conflictSubjects.length === 0 ? "Create Timetable" : "Create with Conflicts"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Subject Selection Popup */}
            {showSubjectSelector && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
                    <div className="bg-black border border-accent/20 rounded-xl p-4 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                            <h3 className="font-playfair text-accent font-medium text-lg mb-2">Select Subjects</h3>
                            <button
                                onClick={() => setShowSubjectSelector(false)}
                                className="text-white/70 hover:text-white text-xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="text-white/60 text-sm mb-3 flex-shrink-0">
                            💡 Choose any subject - we'll show you which degrees/sections it's available in and automatically resolve conflicts
                        </div>
                        
                        {/* Stats */}
                        <div className="text-white/40 text-xs mb-3 flex-shrink-0 flex items-center justify-between">
                            <span>Showing {displayedSubjects.length} of {filteredSubjects.length} subjects</span>
                            {selectedSubjects.length > 0 && (
                                <span>{selectedSubjects.length} selected</span>
                            )}
                        </div>
                        
                        {/* Search Bar */}
                        <div className="mb-4 flex-shrink-0">
                            <input
                                type="text"
                                placeholder="🔍 Search subjects, degrees, or teachers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                            {searchTerm !== debouncedSearchTerm && (
                                <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                                    Searching...
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                            {displayedSubjects.map((subjectData, idx) => (
                                <SubjectItem
                                    key={`${subjectData.name}-${idx}`}
                                    subjectData={subjectData}
                                    isSelected={isSubjectSelected(subjectData.name)}
                                    onToggle={handleSubjectToggle}
                                    isResolving={isResolving}
                                />
                            ))}
                            
                            {/* Load More Button */}
                            {displayedSubjects.length < filteredSubjects.length && (
                                <button
                                    onClick={loadMoreSubjects}
                                    className="w-full p-3 rounded-xl font-product-sans text-base border transition-all duration-200 bg-white/5 text-accent border-accent/10 hover:bg-accent/10"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span>Load More ({filteredSubjects.length - displayedSubjects.length} remaining)</span>
                                        <span className="text-lg">⬇️</span>
                                    </div>
                                </button>
                            )}
                            
                            {filteredSubjects.length === 0 && (
                                <div className="text-center py-8 text-white/50">
                                    <div className="text-3xl mb-2">🔍</div>
                                    <div className="font-medium">No subjects found</div>
                                    <div className="text-sm">Try a different search term</div>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-shrink-0 pt-4 border-t border-white/10 mt-4">
                            <button
                                onClick={() => setShowSubjectSelector(false)}
                                className="w-full p-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/80 transition-colors"
                            >
                                Done ({selectedSubjects.length} selected)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
