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

    // Add user preference states
    const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
    const [userPreferences, setUserPreferences] = useState({
        parentSection: {
            degree: '',
            semester: '',
            section: ''
        },
        seatAvailability: {} // subjectName-sectionKey: boolean
    });
    const [pendingSubjects, setPendingSubjects] = useState([]);

    // Get available degrees, semesters, and sections from selected subjects
    const getAvailableOptions = useMemo(() => {
        const degrees = new Set();
        const semesters = new Set();
        const sectionsByDegreeSem = {};
        
        selectedSubjects.forEach(subject => {
            subject.locations.forEach(loc => {
                degrees.add(loc.degree);
                semesters.add(loc.semester);
                
                const key = `${loc.degree}-${loc.semester}`;
                if (!sectionsByDegreeSem[key]) {
                    sectionsByDegreeSem[key] = new Set();
                }
                sectionsByDegreeSem[key].add(loc.section);
            });
        });
        
        return {
            degrees: Array.from(degrees).sort(),
            semesters: Array.from(semesters).sort(),
            sectionsByDegreeSem: Object.fromEntries(
                Object.entries(sectionsByDegreeSem).map(([key, sections]) => [
                    key, 
                    Array.from(sections).sort()
                ])
            )
        };
    }, [selectedSubjects]);

    // Enhanced CSP Algorithm with Parent Section Preferences
    const resolveSubjectsAsync = useCallback(async () => {
        // First check if we need user preferences
        if (selectedSubjects.length > 0 && !userPreferences.parentSection.degree) {
            setPendingSubjects(selectedSubjects);
            setShowPreferencesDialog(true);
            setIsResolving(false);
            return;
        }

        // Time conversion utility
        const timeToMinutes = (timeStr) => {
            if (!timeStr || typeof timeStr !== 'string') return 0;
            const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
            if (!timeMatch) return 0;
            const hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;
            return hours * 60 + minutes;
        };

        // Check if two time slots overlap
        const doTimeSlotsOverlap = (slot1, slot2) => {
            const start1 = timeToMinutes(slot1.start);
            const end1 = timeToMinutes(slot1.end);
            const start2 = timeToMinutes(slot2.start);
            const end2 = timeToMinutes(slot2.end);
            return start1 < end2 && start2 < end1;
        };

        // Get all time slots for a subject-section combination
        const getTimeSlots = (subjectName, location) => {
            const slots = [];
            const sectionData = TimeTable[location.degree]?.[location.semester]?.[location.section];
            if (!sectionData) return slots;
            
            Object.entries(sectionData).forEach(([day, daySlots]) => {
                daySlots.forEach(slot => {
                    if (slot.course === subjectName) {
                        slots.push({ 
                            ...slot, 
                            day, 
                            subject: subjectName,
                            location 
                        });
                    }
                });
            });
            return slots;
        };

        // Calculate preference score for a section (higher = more preferred)
        const calculatePreferenceScore = (location, subjectName) => {
            let score = 0;
            const { parentSection } = userPreferences;
            
            // Parent section gets MAXIMUM preference (highest priority)
            const isExactParentMatch = (
                location.degree === parentSection.degree &&
                location.semester === parentSection.semester &&
                location.section === parentSection.section
            );
            
            if (isExactParentMatch) {
                score += 5000; // Massive bonus for exact parent section match
            } else {
                // Partial parent section matches (still high priority)
                if (location.degree === parentSection.degree) {
                    score += 2000; // High bonus for same degree
                }
                if (location.semester === parentSection.semester) {
                    score += 1500; // High bonus for same semester
                }
                if (location.section === parentSection.section) {
                    score += 1000; // Bonus for same section (even if different degree/semester)
                }
            }
            
            // Seat availability (critical factor)
            const sectionKey = `${location.degree}-${location.semester}-${location.section}`;
            const availabilityKey = `${subjectName}-${sectionKey}`;
            if (userPreferences.seatAvailability[availabilityKey] === true) {
                score += 800; // High bonus for confirmed seat availability
            } else if (userPreferences.seatAvailability[availabilityKey] === false) {
                score -= 1000; // Heavy penalty for no seats available
            }
            
            // Teacher preference (small bonus)
            if (location.teacher) {
                score += 50;
            }
            
            return score;
        };

        // Enhanced CSP Solver with Parent Section Preferences
        class ParentSectionAwareCSPSolver {
            constructor(subjects, preferences) {
                this.subjects = subjects;
                this.preferences = preferences;
                this.domains = {}; // Available sections for each subject
                this.assignment = {}; // Current assignments
                this.constraints = []; // Time conflict constraints
                this.backtracks = 0;
                this.parentSectionAssignments = 0; // Track how many subjects got parent section
                this.initializeDomains();
                this.generateConstraints();
            }

            // Initialize domains with parent section preference-based sorting
            initializeDomains() {
                this.subjects.forEach(subject => {
                    // Sort locations by preference score (highest first)
                    const sortedLocations = [...subject.locations].sort((a, b) => {
                        const scoreA = calculatePreferenceScore(a, subject.name);
                        const scoreB = calculatePreferenceScore(b, subject.name);
                        return scoreB - scoreA; // Descending order (highest preference first)
                    });
                    
                    this.domains[subject.name] = sortedLocations;
                    
                    // Log parent section matches for debugging
                    const parentMatches = sortedLocations.filter(loc => 
                        loc.degree === this.preferences.parentSection.degree &&
                        loc.semester === this.preferences.parentSection.semester &&
                        loc.section === this.preferences.parentSection.section
                    );
                    
                    if (parentMatches.length > 0) {
                        console.log(`📍 ${subject.name} available in parent section ${this.preferences.parentSection.degree}-${this.preferences.parentSection.semester}-${this.preferences.parentSection.section}`);
                    }
                });
            }

            // Generate all pairwise time conflict constraints
            generateConstraints() {
                const subjectNames = this.subjects.map(s => s.name);
                
                for (let i = 0; i < subjectNames.length; i++) {
                    for (let j = i + 1; j < subjectNames.length; j++) {
                        const subject1 = subjectNames[i];
                        const subject2 = subjectNames[j];
                        
                        this.constraints.push({
                            subject1,
                            subject2,
                            check: (location1, location2) => {
                                const slots1 = getTimeSlots(subject1, location1);
                                const slots2 = getTimeSlots(subject2, location2);
                                
                                return !slots1.some(slot1 => 
                                    slots2.some(slot2 => 
                                        slot1.day === slot2.day && doTimeSlotsOverlap(slot1, slot2)
                                    )
                                );
                            }
                        });
                    }
                }
            }

            // Check if current assignment satisfies all constraints
            isConsistent(subject, location) {
                // First check seat availability - hard constraint
                const sectionKey = `${location.degree}-${location.semester}-${location.section}`;
                const availabilityKey = `${subject}-${sectionKey}`;
                if (this.preferences.seatAvailability[availabilityKey] === false) {
                    return false; // Don't assign to sections with no seats
                }
                
                return this.constraints.every(constraint => {
                    const { subject1, subject2, check } = constraint;
                    
                    if (subject === subject1 && this.assignment[subject2]) {
                        return check(location, this.assignment[subject2]);
                    } else if (subject === subject2 && this.assignment[subject1]) {
                        return check(this.assignment[subject1], location);
                    }
                    
                    return true;
                });
            }

            // Enhanced variable selection prioritizing subjects available in parent section
            selectUnassignedVariable() {
                const unassigned = this.subjects.filter(s => !this.assignment[s.name]);
                if (unassigned.length === 0) return null;
                
                // First, try to find subjects that can be assigned to parent section
                const canAssignToParent = unassigned.filter(subject => {
                    return this.domains[subject.name].some(location => {
                        const isParentSection = (
                            location.degree === this.preferences.parentSection.degree &&
                            location.semester === this.preferences.parentSection.semester &&
                            location.section === this.preferences.parentSection.section
                        );
                        
                        if (isParentSection) {
                            // Check if this assignment would be consistent
                            return this.isConsistent(subject.name, location);
                        }
                        return false;
                    });
                });
                
                if (canAssignToParent.length > 0) {
                    // Among parent-section candidates, choose most constrained
                    return canAssignToParent.reduce((best, current) => {
                        const bestDomainSize = this.domains[best.name].length;
                        const currentDomainSize = this.domains[current.name].length;
                        return currentDomainSize < bestDomainSize ? current : best;
                    });
                }
                
                // Fallback to standard MCV heuristic
                return unassigned.reduce((best, current) => {
                    const bestDomainSize = this.domains[best.name].length;
                    const currentDomainSize = this.domains[current.name].length;
                    
                    if (currentDomainSize < bestDomainSize) {
                        return current;
                    } else if (currentDomainSize === bestDomainSize) {
                        // Tie-breaker: prefer subjects with higher parent section preference
                        const bestTopScore = this.domains[best.name].length > 0 
                            ? calculatePreferenceScore(this.domains[best.name][0], best.name) : 0;
                        const currentTopScore = this.domains[current.name].length > 0 
                            ? calculatePreferenceScore(this.domains[current.name][0], current.name) : 0;
                        
                        return currentTopScore > bestTopScore ? current : best;
                    }
                    
                    return best;
                });
            }

            // Domain values already sorted by parent section preference
            orderDomainValues(subject) {
                return this.domains[subject.name]; // Already sorted with parent section first
            }

            // Forward checking with parent section awareness
            forwardCheck(subject, location) {
                const removedValues = {};
                
                // Track parent section assignment
                const isParentSectionAssignment = (
                    location.degree === this.preferences.parentSection.degree &&
                    location.semester === this.preferences.parentSection.semester &&
                    location.section === this.preferences.parentSection.section
                );
                
                if (isParentSectionAssignment) {
                    this.parentSectionAssignments++;
                    console.log(`🎯 Assigned ${subject} to parent section! (${this.parentSectionAssignments} total)`);
                }
                
                this.constraints.forEach(constraint => {
                    const { subject1, subject2, check } = constraint;
                    let otherSubject = null;
                    
                    if (subject === subject1) {
                        otherSubject = subject2;
                    } else if (subject === subject2) {
                        otherSubject = subject1;
                    }
                    
                    if (otherSubject && !this.assignment[otherSubject]) {
                        const originalDomain = [...this.domains[otherSubject]];
                        this.domains[otherSubject] = this.domains[otherSubject].filter(otherLocation => {
                            // Check seat availability
                            const sectionKey = `${otherLocation.degree}-${otherLocation.semester}-${otherLocation.section}`;
                            const availabilityKey = `${otherSubject}-${sectionKey}`;
                            if (this.preferences.seatAvailability[availabilityKey] === false) {
                                return false;
                            }
                            
                            // Check time conflicts
                            if (subject === subject1) {
                                return check(location, otherLocation);
                            } else {
                                return check(otherLocation, location);
                            }
                        });
                        
                        if (this.domains[otherSubject].length < originalDomain.length) {
                            removedValues[otherSubject] = originalDomain.filter(
                                loc => !this.domains[otherSubject].includes(loc)
                            );
                        }
                    }
                });
                
                return removedValues;
            }

            // Restore removed values during backtracking
            restoreValues(removedValues) {
                Object.entries(removedValues).forEach(([subject, values]) => {
                    this.domains[subject] = [...this.domains[subject], ...values];
                    // Re-sort by parent section preference
                    this.domains[subject].sort((a, b) => {
                        const scoreA = calculatePreferenceScore(a, subject);
                        const scoreB = calculatePreferenceScore(b, subject);
                        return scoreB - scoreA;
                    });
                });
            }

            // Backtracking search
            async backtrack() {
                // Check for domain wipeout
                for (const subject of this.subjects) {
                    if (!this.assignment[subject.name] && this.domains[subject.name].length === 0) {
                        return false;
                    }
                }
                
                const subject = this.selectUnassignedVariable();
                if (!subject) {
                    return true; // All variables assigned
                }
                
                const orderedValues = this.orderDomainValues(subject);
                
                for (const location of orderedValues) {
                    if (this.backtracks % 15 === 0) {
                        const progress = 30 + (Object.keys(this.assignment).length / this.subjects.length) * 60;
                        setResolutionProgress(Math.min(progress, 90));
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                    
                    if (this.isConsistent(subject.name, location)) {
                        this.assignment[subject.name] = location;
                        const removedValues = this.forwardCheck(subject.name, location);
                        
                        const result = await this.backtrack();
                        if (result) {
                            return true;
                        }
                        
                        delete this.assignment[subject.name];
                        this.restoreValues(removedValues);
                        this.backtracks++;
                    }
                }
                
                return false;
            }

            async solve() {
                const success = await this.backtrack();
                return {
                    success,
                    assignment: this.assignment,
                    backtracks: this.backtracks,
                    parentSectionAssignments: this.parentSectionAssignments
                };
            }
        }

        try {
            setResolutionProgress(5);
            
            const solver = new ParentSectionAwareCSPSolver(selectedSubjects, userPreferences);
            setResolutionProgress(20);
            
            const result = await solver.solve();
            setResolutionProgress(95);
            
            if (result.success) {
                // Build timetable from optimal assignment
                const timetable = {};
                const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                days.forEach(day => { timetable[day] = []; });
                
                Object.entries(result.assignment).forEach(([subjectName, location]) => {
                    const slots = getTimeSlots(subjectName, location);
                    slots.forEach(slot => {
                        timetable[slot.day].push({
                            ...slot,
                            degree: location.degree,
                            semester: location.semester,
                            section: location.section
                        });
                    });
                });
                
                Object.keys(timetable).forEach(day => {
                    timetable[day].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
                });
                
                setResolvedTimetable(timetable);
                setConflictSubjects([]);
                setResolutionSuggestions([]);
                
                console.log(`✅ Parent-section-aware solution found: ${result.parentSectionAssignments}/${selectedSubjects.length} subjects in parent section with ${result.backtracks} backtracks`);
                
            } else {
                // Fallback with relaxed seat availability constraints
                console.log(`⚠️ No solution with strict preferences, trying relaxed constraints...`);
                
                // Try again with relaxed seat availability
                const relaxedPreferences = { ...userPreferences };
                Object.keys(relaxedPreferences.seatAvailability).forEach(key => {
                    if (relaxedPreferences.seatAvailability[key] === false) {
                        delete relaxedPreferences.seatAvailability[key];
                    }
                });
                
                const relaxedSolver = new ParentSectionAwareCSPSolver(selectedSubjects, relaxedPreferences);
                const relaxedResult = await relaxedSolver.solve();
                
                if (relaxedResult.success) {
                    // Build timetable but mark seat availability issues
                    const timetable = {};
                    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    days.forEach(day => { timetable[day] = []; });
                    
                    const seatIssueSubjects = [];
                    
                    Object.entries(relaxedResult.assignment).forEach(([subjectName, location]) => {
                        const sectionKey = `${location.degree}-${location.semester}-${location.section}`;
                        const availabilityKey = `${subjectName}-${sectionKey}`;
                        
                        if (userPreferences.seatAvailability[availabilityKey] === false) {
                            seatIssueSubjects.push(subjectName);
                        }
                        
                        const slots = getTimeSlots(subjectName, location);
                        slots.forEach(slot => {
                            timetable[slot.day].push({
                                ...slot,
                                degree: location.degree,
                                semester: location.semester,
                                section: location.section
                            });
                        });
                    });
                    
                    Object.keys(timetable).forEach(day => {
                        timetable[day].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
                    });
                    
                    const suggestions = seatIssueSubjects.map(subjectName => ({
                        subject: subjectName,
                        message: `${subjectName} may have seat availability issues - verify with administration`,
                        alternatives: []
                    }));
                    
                    setResolvedTimetable(timetable);
                    setConflictSubjects(seatIssueSubjects);
                    setResolutionSuggestions(suggestions);
                    
                    console.log(`⚠️ Relaxed solution: ${relaxedResult.parentSectionAssignments}/${selectedSubjects.length} subjects in parent section`);
                } else {
                    // Complete fallback
                    console.log(`❌ No solution possible even with relaxed constraints`);
                    setConflictSubjects(['Multiple subjects']);
                    setResolutionSuggestions([{
                        subject: 'Schedule Conflict',
                        message: 'No valid schedule possible with current subject selections and parent section preferences',
                        alternatives: []
                    }]);
                }
            }
            
            setResolutionProgress(100);
            
            setTimeout(() => {
                setIsResolving(false);
                setResolutionProgress(0);
            }, 300);
            
        } catch (error) {
            console.error('Parent-section-aware CSP error:', error);
            setIsResolving(false);
            setResolutionProgress(0);
        }
    }, [selectedSubjects, userPreferences]);

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
                                    {resolvedTimetable && !isResolving && (
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
                                                        ? "Parent Section Schedule Created!" 
                                                        : `${conflictSubjects.length} Subject${conflictSubjects.length > 1 ? 's' : ''} Need${conflictSubjects.length > 1 ? '' : 's'} Attention`
                                                    }
                                                </div>
                                            </div>
                                            <div className="text-sm opacity-80">
                                                {conflictSubjects.length === 0 
                                                    ? `Perfect schedule optimized for your parent section: ${userPreferences.parentSection.degree} • Semester ${userPreferences.parentSection.semester} • Section ${userPreferences.parentSection.section}`
                                                    : "Schedule created with parent section optimization, but some subjects may need manual adjustment"
                                                }
                                            </div>
                                            {userPreferences.parentSection.degree && (
                                                <div className="mt-2 text-xs opacity-70">
                                                    🎯 Parent Section: {userPreferences.parentSection.degree} • Semester {userPreferences.parentSection.semester} • Section {userPreferences.parentSection.section}
                                                    {Object.values(userPreferences.seatAvailability).filter(Boolean).length > 0 && 
                                                        ` • ${Object.values(userPreferences.seatAvailability).filter(Boolean).length} confirmed seats`
                                                    }
                                                </div>
                                            )}
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

            {/* Preferences Dialog */}
            {showPreferencesDialog && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4">
                    <div className="bg-black border border-accent/20 rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                        <h3 className="font-playfair text-accent font-medium text-xl mb-4">Set Your Parent Section Preferences</h3>
                        <p className="text-white/70 text-sm mb-6">
                            Choose your parent section (degree + semester + section) for maximum preference. The algorithm will prioritize placing as many subjects as possible in this section.
                        </p>
                        
                        {/* Parent Section Selection */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="text-xl">🎯</div>
                                <h4 className="text-accent font-medium">Parent Section (Highest Priority)</h4>
                            </div>
                            <p className="text-white/60 text-sm mb-4">
                                This is your main section where you want most of your subjects. Select degree, semester, and specific section.
                            </p>
                            
                            {/* Degree Selection */}
                            <div className="mb-4">
                                <label className="block text-white font-medium mb-3">
                                    Parent Degree <span className="text-red-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {getAvailableOptions.degrees.map(degree => (
                                        <button
                                            key={degree}
                                            onClick={() => setUserPreferences(prev => ({ 
                                                ...prev, 
                                                parentSection: { 
                                                    degree, 
                                                    semester: '', 
                                                    section: '' 
                                                } 
                                            }))}
                                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                                userPreferences.parentSection.degree === degree
                                                    ? 'bg-accent text-white border-accent'
                                                    : 'bg-white/5 text-white/70 border-white/10 hover:border-accent/30'
                                            }`}
                                        >
                                            {degree}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Semester Selection */}
                            {userPreferences.parentSection.degree && (
                                <div className="mb-4">
                                    <label className="block text-white font-medium mb-3">
                                        Parent Semester <span className="text-red-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {getAvailableOptions.semesters.map(semester => (
                                            <button
                                                key={semester}
                                                onClick={() => setUserPreferences(prev => ({ 
                                                    ...prev, 
                                                    parentSection: { 
                                                        ...prev.parentSection,
                                                        semester, 
                                                        section: '' 
                                                    } 
                                                }))}
                                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                                    userPreferences.parentSection.semester === semester
                                                        ? 'bg-accent text-white border-accent'
                                                        : 'bg-white/5 text-white/70 border-white/10 hover:border-accent/30'
                                                }`}
                                            >
                                                Semester {semester}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section Selection */}
                            {userPreferences.parentSection.degree && userPreferences.parentSection.semester && (
                                <div className="mb-4">
                                    <label className="block text-white font-medium mb-3">
                                        Parent Section <span className="text-red-400">*</span>
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {getAvailableOptions.sectionsByDegreeSem[`${userPreferences.parentSection.degree}-${userPreferences.parentSection.semester}`]?.map(section => (
                                            <button
                                                key={section}
                                                onClick={() => setUserPreferences(prev => ({ 
                                                    ...prev, 
                                                    parentSection: { 
                                                        ...prev.parentSection,
                                                        section 
                                                    } 
                                                }))}
                                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                                    userPreferences.parentSection.section === section
                                                        ? 'bg-accent text-white border-accent'
                                                        : 'bg-white/5 text-white/70 border-white/10 hover:border-accent/30'
                                                }`}
                                            >
                                                Section {section}
                                            </button>
                                        )) || (
                                            <div className="col-span-6 text-white/50 text-sm">
                                                No sections available for this combination
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Parent Section Summary */}
                            {userPreferences.parentSection.degree && userPreferences.parentSection.semester && userPreferences.parentSection.section && (
                                <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                                    <div className="text-accent font-medium text-sm mb-1">Selected Parent Section:</div>
                                    <div className="text-accent/80 text-lg font-bold">
                                        {userPreferences.parentSection.degree} • Semester {userPreferences.parentSection.semester} • Section {userPreferences.parentSection.section}
                                    </div>
                                    <div className="text-accent/60 text-xs mt-2">
                                        Algorithm will prioritize placing subjects in this exact section combination
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Seat Availability Check */}
                        <div className="mb-6">
                            <label className="block text-white font-medium mb-3">
                                Seat Availability Check (Critical Constraint)
                            </label>
                            <p className="text-white/60 text-sm mb-4">
                                For each subject and section, mark seat availability. Sections with "No Seats" will be avoided unless absolutely necessary.
                            </p>
                            
                            <div className="space-y-4">
                                {pendingSubjects.map(subject => (
                                    <div key={subject.name} className="border border-white/10 rounded-lg p-4">
                                        <h4 className="text-accent font-medium mb-3 flex items-center gap-2">
                                            📚 {subject.name}
                                            <span className="text-xs text-white/50">
                                                ({subject.locations.length} sections available)
                                            </span>
                                        </h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {subject.locations.map((location, idx) => {
                                                const sectionKey = `${location.degree}-${location.semester}-${location.section}`;
                                                const availabilityKey = `${subject.name}-${sectionKey}`;
                                                const currentStatus = userPreferences.seatAvailability[availabilityKey];
                                                
                                                // Check if this is the parent section
                                                const isParentSection = (
                                                    location.degree === userPreferences.parentSection.degree &&
                                                    location.semester === userPreferences.parentSection.semester &&
                                                    location.section === userPreferences.parentSection.section
                                                );
                                                
                                                return (
                                                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${
                                                        isParentSection 
                                                            ? 'bg-accent/10 border border-accent/20' 
                                                            : 'bg-white/5'
                                                    }`}>
                                                        <div className="flex-1">
                                                            <div className="text-white text-sm font-medium flex items-center gap-2">
                                                                {location.degree} • Semester {location.semester} • Section {location.section}
                                                                {isParentSection && (
                                                                    <span className="text-xs bg-accent text-white px-2 py-1 rounded">
                                                                        🎯 PARENT SECTION
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {location.teacher && (
                                                                <div className="text-white/60 text-xs mt-1">
                                                                    Teacher: {location.teacher}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 ml-4">
                                                            <button
                                                                onClick={() => setUserPreferences(prev => ({
                                                                    ...prev,
                                                                    seatAvailability: {
                                                                        ...prev.seatAvailability,
                                                                        [availabilityKey]: true
                                                                    }
                                                                }))}
                                                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                                                    currentStatus === true
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-white/10 text-white/70 hover:bg-green-500/20'
                                                                }`}
                                                            >
                                                                ✓ Seats Available
                                                            </button>
                                                            <button
                                                                onClick={() => setUserPreferences(prev => ({
                                                                    ...prev,
                                                                    seatAvailability: {
                                                                        ...prev.seatAvailability,
                                                                        [availabilityKey]: false
                                                                    }
                                                                }))}
                                                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                                                    currentStatus === false
                                                                        ? 'bg-red-500 text-white'
                                                                        : 'bg-white/10 text-white/70 hover:bg-red-500/20'
                                                                }`}
                                                            >
                                                                ✗ No Seats
                                                            </button>
                                                            <button
                                                                onClick={() => setUserPreferences(prev => {
                                                                    const newPrefs = { ...prev };
                                                                    delete newPrefs.seatAvailability[availabilityKey];
                                                                    return newPrefs;
                                                                })}
                                                                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                                                                    currentStatus === undefined
                                                                        ? 'bg-yellow-500 text-black'
                                                                        : 'bg-white/10 text-white/70 hover:bg-yellow-500/20'
                                                                }`}
                                                            >
                                                                ? Unknown
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                            <button
                                onClick={() => {
                                    setShowPreferencesDialog(false);
                                    setIsResolving(false);
                                }}
                                className="flex-1 p-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowPreferencesDialog(false);
                                    // Trigger resolution with parent section preferences
                                    setTimeout(() => {
                                        setIsResolving(true);
                                        resolveSubjectsAsync();
                                    }, 100);
                                }}
                                disabled={!userPreferences.parentSection.degree || !userPreferences.parentSection.semester || !userPreferences.parentSection.section}
                                className={`flex-1 p-3 rounded-xl font-medium transition-all ${
                                    (userPreferences.parentSection.degree && userPreferences.parentSection.semester && userPreferences.parentSection.section)
                                        ? 'bg-accent text-white hover:bg-accent/80'
                                        : 'bg-accent/40 text-white/60 cursor-not-allowed'
                                }`}
                            >
                                Create Parent Section Timetable
                            </button>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="text-blue-400 text-sm">
                                <div className="font-medium mb-1">🎯 Parent Section Algorithm Benefits:</div>
                                <div className="text-xs space-y-1 text-blue-300/80">
                                    <div>• Maximum preference to your chosen degree-semester-section combination</div>
                                    <div>• Tries to place as many subjects as possible in your parent section</div>
                                    <div>• Avoids sections marked as having no available seats</div>
                                    <div>• Smart fallback when parent section preferences can't be fully satisfied</div>
                                    <div>• Shows exactly how many subjects were placed in parent section</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
