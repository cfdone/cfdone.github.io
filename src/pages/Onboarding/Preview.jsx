import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, AlertTriangle, Target, Book, MapPin } from 'lucide-react'
import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'
import { timeToMinutes, timeRangesOverlap } from '../../utils/timeUtils'
import TimeTable from '../../assets/timetable.json'

export default function Preview() {
  const navigate = useNavigate()
  const location = useLocation()

  // Get selected subjects and user preferences from location state
  const selectedSubjects = useMemo(() => {
    return location.state?.selectedSubjects || []
  }, [location.state?.selectedSubjects])

  const userPreferences = useMemo(() => {
    return (
      location.state?.userPreferences || {
        parentSection: { degree: '', semester: '', section: '' },
        generalSeatPolicy: 'flexible',
        seatAvailability: {},
      }
    )
  }, [location.state?.userPreferences])

  const [resolvedTimetable, setResolvedTimetable] = useState(null)
  const [conflictSubjects, setConflictSubjects] = useState([])
  const [resolutionSuggestions, setResolutionSuggestions] = useState([])

  // Loader states
  const [isCreating, setIsCreating] = useState(false)
  const [progress, setProgress] = useState(0)
  // Add resolving state (not used in this component)
  const [isResolving] = useState(false)
  const [resolutionProgress] = useState(0)

  // Function to check for time conflicts in the timetable
  const detectTimeConflicts = useCallback((timetable) => {
    const conflicts = [];
    
    // Check for conflicts in each day's schedule
    Object.values(timetable).forEach(classes => {
      if (classes.length < 2) return; // No conflicts possible with 0-1 classes
      
      // Sort classes by start time
      const sortedClasses = [...classes].sort((a, b) => 
        timeToMinutes(a.start) - timeToMinutes(b.start)
      );
      
      // Check for overlaps using the new overlap detection
      for (let i = 0; i < sortedClasses.length - 1; i++) {
        const current = sortedClasses[i];
        const next = sortedClasses[i + 1];
        
        // Use the improved overlap detection
        if (timeRangesOverlap(current.start, current.end, next.start, next.end)) {
          // Add both subjects to conflicts if they're not already there
          const currentSubject = current.subject || current.course;
          const nextSubject = next.subject || next.course;
          
          if (currentSubject && !conflicts.includes(currentSubject)) {
            conflicts.push(currentSubject);
          }
          if (nextSubject && !conflicts.includes(nextSubject)) {
            conflicts.push(nextSubject);
          }
        }
      }
    });
    
    return conflicts;
  }, []);

  // Effect to get the resolved timetable from location state or generate it
  useEffect(() => {
    if (location.state?.resolvedTimetable) {
      setResolvedTimetable(location.state.resolvedTimetable);
      
      // If conflicts aren't provided in location state, detect them
      if (!location.state.conflictSubjects) {
        const detectedConflicts = detectTimeConflicts(location.state.resolvedTimetable);
        setConflictSubjects(detectedConflicts);
      } else {
        setConflictSubjects(location.state.conflictSubjects);
      }
    } else if (selectedSubjects.length > 0) {
      // Generate a simple mock timetable for preview
      const mockTimetable = generateMockTimetable(selectedSubjects, userPreferences);
      setResolvedTimetable(mockTimetable);
      
      // Detect conflicts in the mock timetable
      const detectedConflicts = detectTimeConflicts(mockTimetable);
      setConflictSubjects(detectedConflicts);
    }
    
    if (location.state?.resolutionSuggestions) {
      setResolutionSuggestions(location.state.resolutionSuggestions);
    }
  }, [location.state, selectedSubjects, userPreferences, detectTimeConflicts])
  
  // Helper function to generate a realistic timetable for preview using actual timetable data
  const generateMockTimetable = (subjects, preferences) => {
    const timetable = {}
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    days.forEach(day => {
      timetable[day] = []
    })
    
    // For each subject, find its actual schedule in the timetable data
    subjects.forEach((subject) => {
      const preferredLocation = subject.locations.find(loc => 
        loc.degree === preferences.parentSection.degree &&
        loc.semester === preferences.parentSection.semester &&
        loc.section === preferences.parentSection.section
      ) || subject.locations[0]
      
      if (preferredLocation) {
        // Get the actual timetable data for this degree/semester/section
        const sectionData = TimeTable[preferredLocation.degree]?.[preferredLocation.semester]?.[preferredLocation.section];
        
        if (sectionData) {
          // Find the actual schedule for this subject
          Object.entries(sectionData).forEach(([day, slots]) => {
            slots.forEach(slot => {
              if (slot.course === subject.name) {
                timetable[day].push({
                  ...slot,
                  subject: subject.name,
                  degree: preferredLocation.degree,
                  semester: preferredLocation.semester,
                  section: preferredLocation.section
                });
              }
            });
          });
        } else {
          // Fallback: if no actual data found, create a placeholder with realistic time
          console.warn(`No timetable data found for ${preferredLocation.degree} S${preferredLocation.semester}-${preferredLocation.section}`);
          
          // Add a placeholder entry to Monday with a generic time
          timetable['Monday'].push({
            subject: subject.name,
            start: "8:45",
            end: "10:10", 
            course: subject.name,
            teacher: preferredLocation.teacher || 'TBD',
            room: preferredLocation.room || 'TBD',
            degree: preferredLocation.degree,
            semester: preferredLocation.semester,
            section: preferredLocation.section
          });
        }
      }
    })
    
    return timetable
  }

  return (
    <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe">
      {/* Fixed Header */}
      <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
        <StepTrack currentStep={4} totalSteps={4} />
        <div className="text-center mb-6">
          <h3 className="font-product-sans text-accent font-black text-xl mb-2">
            Review Your Timetable
          </h3>
          <p className="text-white/70 text-sm font-product-sans">
            Review your schedule before creating the final timetable
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
                  <div className="p-6 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left w-full bg-white/10 text-accent border-accent/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold mb-2">No Subjects Selected</div>
                        <div className="text-sm opacity-80">
                          Please go back to select your subjects and preferences
                        </div>
                      </div>
                      <div className="text-2xl ml-4">
                        <Book className="w-8 h-8 text-accent" />
                      </div>
                    </div>
                  </div>
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
                  </div>

                  {/* Resolution Status */}
                  {resolvedTimetable && !isResolving && (
                    <div
                      className={`p-4 rounded-xl border ${
                        conflictSubjects.length === 0
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div>
                          {conflictSubjects.length === 0 ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                        <div className="font-bold">
                          {conflictSubjects.length === 0
                            ? 'Parent Section Schedule Created!'
                            : `${conflictSubjects.length} Subject${conflictSubjects.length > 1 ? 's' : ''} Need${conflictSubjects.length > 1 ? '' : 's'} Attention`}
                        </div>
                      </div>
                      <div className="text-sm opacity-80">
                        {conflictSubjects.length === 0
                          ? `Perfect schedule optimized for your parent section: ${userPreferences.parentSection.degree} • Semester ${userPreferences.parentSection.semester} • Section ${userPreferences.parentSection.section}`
                          : 'Schedule created with parent section optimization, but some subjects may need manual adjustment'}
                      </div>
                      {userPreferences.parentSection.degree && (
                        <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
                          <Target className="w-3 h-3" /> Parent Section:{' '}
                          {userPreferences.parentSection.degree} • Semester{' '}
                          {userPreferences.parentSection.semester} • Section{' '}
                          {userPreferences.parentSection.section}
                          {Object.values(userPreferences.seatAvailability).filter(Boolean)
                            .length > 0 &&
                            ` • ${Object.values(userPreferences.seatAvailability).filter(Boolean).length} confirmed seats`}
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
                        Analyzing {selectedSubjects.length} subjects across all available
                        sections...
                      </div>
                    </div>
                  )}

                  {/* Resolution Suggestions */}
                  {resolutionSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-bold text-white text-sm mb-2">Suggestions:</div>
                      {resolutionSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="font-medium text-accent text-sm mb-1">
                            {suggestion.subject}
                          </div>
                          <div className="text-white/70 text-sm">{suggestion.message}</div>
                          {suggestion.alternatives.length > 0 && (
                            <div className="mt-2 text-xs text-white/50">
                              Available in:{' '}
                              {suggestion.alternatives
                                .map(alt => `${alt.degree} S${alt.semester}-${alt.section}`)
                                .join(', ')}
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
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-accent/10 text-accent border-accent/10 hover:bg-accent/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-bold mb-2 flex items-center gap-2">
                              {subject.name}
                              {conflictSubjects.includes(subject.name) && (
                                <AlertTriangle className="w-3 h-3 text-yellow-400" />
                              )}
                            </div>
                            <div className="text-sm opacity-80 space-y-1">
                              <div className="font-medium">Available in:</div>
                              {subject.locations.slice(0, 3).map((loc, locIdx) => (
                                <div key={locIdx} className="text-xs opacity-70 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {loc.degree} • Semester {loc.semester} • Section {loc.section}
                                </div>
                              ))}
                              {subject.locations.length > 3 && (
                                <div className="text-xs opacity-70">
                                  +{subject.locations.length - 3} more sections...
                                </div>
                              )}
                            </div>
                          </div>
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
          {/* Navigation buttons */}
          <div className="flex flex-row gap-3 items-stretch justify-center w-full h-11">
            <button
              className="font-product-sans px-4 rounded-xl h-full w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10 flex items-center justify-center"
              onClick={() =>
                navigate('/preferences', {
                  state: {
                    selectedSubjects,
                    userPreferences,
                  },
                })
              }
            >
              Back
            </button>
            <button
              className={`font-product-sans px-4 rounded-xl w-full h-full text-[15px] transition shadow-md flex items-center justify-center
                ${
                  selectedSubjects.length > 0
                    ? 'bg-accent text-white'
                    : 'bg-accent/40 text-white/60'
                }
            `}
              disabled={selectedSubjects.length === 0 || isCreating}
              onClick={async () => {
                if (selectedSubjects.length > 0 && resolvedTimetable) {
                  setIsCreating(true)
                  setProgress(0)

                  // Simple progress simulation
                  let currentProgress = 0
                  const progressIncrement = 2
                  const intervalTime = 20

                  while (currentProgress < 100) {
                    currentProgress += progressIncrement
                    setProgress(Math.min(currentProgress, 100))
                    await new Promise(resolve => setTimeout(resolve, intervalTime))
                  }

                  const timetableData = {
                    subjects: selectedSubjects,
                    timetable: resolvedTimetable,
                    isCustom: true,
                    isAutoResolved: true,
                    hasConflicts: conflictSubjects.length > 0,
                    conflictSubjects: conflictSubjects,
                    resolutionSuggestions: resolutionSuggestions,
                    studentType: 'lagger',
                  }

                  try {
                    localStorage.setItem('onboardingComplete', 'true')
                    localStorage.setItem('timetableData', JSON.stringify(timetableData))
                  } catch (error) {
                    console.error('Error saving to localStorage:', error)
                  }

                  navigate('/home', {
                    state: timetableData,
                  })
                }
              }}
            >
              {isCreating ? (
                <div className="flex flex-col items-center w-full">
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full transition-all duration-75 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : conflictSubjects.length === 0 ? (
                'Create Timetable'
              ) : (
                'Create with Conflicts'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
