import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, AlertTriangle, Target, Book, MapPin } from 'lucide-react'
import ShinyText from '../../components/ShinyText'

import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'
import { timeToMinutes, timeRangesOverlap } from '../../utils/timeUtils'
import TimeTable from '../../assets/timetable.json'
import useTimetableSync from '../../hooks/useTimetableSync'
import { verifyTimetableWithGemini } from '../../utils/ai/geminiresolve'
import { Sparkles } from 'lucide-react'

export default function Preview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { saveTimetable } = useTimetableSync()

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

  // Store all possible timetables
  const [allTimetables, setAllTimetables] = useState([])
  // Index of selected timetable
  const [selectedTimetableIdx, setSelectedTimetableIdx] = useState(0)
  // Derived selected timetable
  const resolvedTimetable = allTimetables[selectedTimetableIdx] || null
  const [conflictSubjects, setConflictSubjects] = useState([])
  const [resolutionSuggestions, setResolutionSuggestions] = useState([])

  // Loader states
  // Removed unused isCreating and progress states
  // Add resolving state (not used in this component)
  const [isResolving] = useState(false)
  const [resolutionProgress] = useState(0)

  // Error message for failed timetable creation
  const [errorMsg, setErrorMsg] = useState('')

  // Gemini verification states
  // Removed unused geminiStatus state
  const [geminiSuggestions, setGeminiSuggestions] = useState('')
  const [isReverifying, setIsReverifying] = useState(false)
  const [hasReverified, setHasReverified] = useState(false)

  // Function to check for time conflicts in the timetable
  const detectTimeConflicts = useCallback(timetable => {
    const conflicts = []

    // Check for conflicts in each day's schedule
    Object.values(timetable).forEach(classes => {
      if (classes.length < 2) return // No conflicts possible with 0-1 classes

      // Sort classes by start time
      const sortedClasses = [...classes].sort(
        (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
      )

      // Check for overlaps using the new overlap detection
      for (let i = 0; i < sortedClasses.length - 1; i++) {
        const current = sortedClasses[i]
        const next = sortedClasses[i + 1]

        // Use the improved overlap detection
        if (timeRangesOverlap(current.start, current.end, next.start, next.end)) {
          // Add both subjects to conflicts if they're not already there
          const currentSubject = current.subject || current.course
          const nextSubject = next.subject || next.course

          if (currentSubject && !conflicts.includes(currentSubject)) {
            conflicts.push(currentSubject)
          }
          if (nextSubject && !conflicts.includes(nextSubject)) {
            conflicts.push(nextSubject)
          }
        }
      }
    })

    return conflicts
  }, [])

  // Function to generate resolution suggestions for conflicting subjects
  const generateResolutionSuggestions = useCallback(
    (conflicts, subjects) => {
      // For each conflict, suggest alternate sections/times if available
      return conflicts
        .map(conflictSubject => {
          const subject = subjects.find(s => s.name === conflictSubject)
          if (!subject || !subject.locations || !userPreferences?.parentSection) return null
          // Find alternative locations (sections) for this subject
          const parentSection = userPreferences.parentSection
          const alternatives = subject.locations.filter(loc => {
            // Only suggest if not in parent section
            return (
              loc.degree !== parentSection.degree ||
              loc.semester !== parentSection.semester ||
              loc.section !== parentSection.section
            )
          })
          return {
            subject: subject.name,
            message:
              alternatives.length > 0
                ? 'Try selecting a different section or time slot for this subject to avoid conflicts.'
                : 'No alternate sections available. Manual adjustment may be required.',
            alternatives,
          }
        })
        .filter(Boolean)
    },
    [userPreferences]
  )

  // Effect to get all possible timetables and set selected
  useEffect(() => {
    // Helper: generate all possible non-conflicting timetables
    function generateAllTimetables(subjects) {
      // For each subject, get all possible locations (sections)
      const subjectOptions = subjects.map(subject => {
        return subject.locations && subject.locations.length > 0
          ? subject.locations.map(loc => ({ subject, loc }))
          : [{ subject, loc: null }]
      })
      // Cartesian product of all subject options
      function cartesian(arr) {
        return arr.reduce((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]])
      }
      const combinations = cartesian(subjectOptions)
      // For each combination, build timetable
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      const timetables = combinations.map(combo => {
        const timetable = {}
        days.forEach(day => {
          timetable[day] = []
        })
        combo.forEach(({ subject, loc }) => {
          if (!loc) return
          const sectionData = TimeTable?.[loc.degree]?.[loc.semester]?.[loc.section]
          if (sectionData) {
            Object.entries(sectionData).forEach(([day, slots]) => {
              slots.forEach(slot => {
                if (slot.course === subject.name) {
                  timetable[day].push({
                    ...slot,
                    subject: subject.name,
                    degree: loc.degree,
                    semester: loc.semester,
                    section: loc.section,
                  })
                }
              })
            })
          }
        })
        // Fallback: assign unassigned subjects to first available slot
        combo.forEach(({ subject, loc }) => {
          const alreadyAssigned = days.some(day =>
            timetable[day].some(cls => cls.subject === subject.name)
          )
          if (!alreadyAssigned) {
            for (const day of days) {
              const hasConflict = timetable[day].some(existing =>
                timeRangesOverlap(existing.start, existing.end, '8:45', '10:10')
              )
              if (!hasConflict) {
                timetable[day].push({
                  subject: subject.name,
                  start: '8:45',
                  end: '10:10',
                  course: subject.name,
                  teacher: loc?.teacher || 'TBD',
                  room: loc?.room || 'TBD',
                  degree: loc?.degree || 'TBD',
                  semester: loc?.semester || 'TBD',
                  section: loc?.section || 'TBD',
                })
                break
              }
            }
          }
        })
        return timetable
      })
      // Filter out timetables with time conflicts
      return timetables.filter(tt => detectTimeConflicts(tt).length === 0)
    }

    let timetables = []
    if (location.state?.resolvedTimetable) {
      timetables = [location.state.resolvedTimetable]
    } else if (selectedSubjects.length > 0) {
      timetables = generateAllTimetables(selectedSubjects, userPreferences)
      // If no class-free timetable, fallback to one with conflicts
      if (timetables.length === 0) {
        timetables = [generateMockTimetable(selectedSubjects, userPreferences)]
      }
    }
    setAllTimetables(timetables)
    setSelectedTimetableIdx(0)
    // Set conflict subjects for first timetable
    if (timetables.length > 0) {
      setConflictSubjects(detectTimeConflicts(timetables[0]))
    } else {
      setConflictSubjects([])
    }
    if (location.state?.resolutionSuggestions) {
      setResolutionSuggestions(location.state.resolutionSuggestions)
    }
  }, [location.state, selectedSubjects, userPreferences, detectTimeConflicts])

  // Update conflict subjects and suggestions when selected timetable changes
  useEffect(() => {
    if (resolvedTimetable) {
      const detectedConflicts = detectTimeConflicts(resolvedTimetable)
      setConflictSubjects(detectedConflicts)
      if (detectedConflicts.length > 0 && selectedSubjects.length > 0) {
        setResolutionSuggestions(generateResolutionSuggestions(detectedConflicts, selectedSubjects))
      } else {
        setResolutionSuggestions([])
      }
    }
  }, [resolvedTimetable, selectedSubjects, generateResolutionSuggestions])

  // Helper function to generate a realistic timetable for preview using actual timetable data
  const generateMockTimetable = subjects => {
    const timetable = {}
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    days.forEach(day => {
      timetable[day] = []
    })
    // For each subject, find its actual schedule in the timetable data
    subjects.forEach(subject => {
      if (!subject.locations || subject.locations.length === 0) return
      let assigned = false
      for (const loc of subject.locations) {
        if (!loc.degree || !loc.semester || !loc.section) continue
        const sectionData = TimeTable?.[loc.degree]?.[loc.semester]?.[loc.section]
        if (sectionData) {
          let foundSlot = false
          Object.entries(sectionData).forEach(([day, slots]) => {
            slots.forEach(slot => {
              if (slot.course === subject.name) {
                const hasConflict = timetable[day].some(existing =>
                  timeRangesOverlap(existing.start, existing.end, slot.start, slot.end)
                )
                if (!hasConflict) {
                  timetable[day].push({
                    ...slot,
                    subject: subject.name,
                    degree: loc.degree,
                    semester: loc.semester,
                    section: loc.section,
                  })
                  assigned = true
                  foundSlot = true
                }
              }
            })
          })
          if (foundSlot) break
        }
      }
      // If not assigned, fallback: add to first available day/time without conflict
      if (!assigned) {
        for (const day of days) {
          const hasConflict = timetable[day].some(existing =>
            timeRangesOverlap(existing.start, existing.end, '8:45', '10:10')
          )
          if (!hasConflict) {
            timetable[day].push({
              subject: subject.name,
              start: '8:45',
              end: '10:10',
              course: subject.name,
              teacher: subject.locations[0]?.teacher || 'TBD',
              room: subject.locations[0]?.room || 'TBD',
              degree: subject.locations[0]?.degree || 'TBD',
              semester: subject.locations[0]?.semester || 'TBD',
              section: subject.locations[0]?.section || 'TBD',
            })
            break
          }
        }
      }
    })
    return timetable
  }

  // Weekly timetable preview styled like WeeklySchedule.jsx
  const renderTimetableByDay = timetable => {
    if (!timetable) return null
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    return (
      <div className="space-y-3">
        {days
          .filter(day => Object.prototype.hasOwnProperty.call(timetable, day))
          .map(day => {
            const classes = timetable[day] || []
            return (
              <div key={day}>
                <div className="bg-white/5 rounded-xl border border-accent/10 overflow-hidden">
                  <div className="p-3 border-b border-accent/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white  font-semibold">{day}</h3>
                      </div>
                      <div className="text-white/80 text-sm ">
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
                        <div className="text-accent/60  text-sm">No classes scheduled</div>
                      </div>
                    ) : (
                      classes
                        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
                        .map((cls, idx) => {
                          const isConflict = conflictSubjects.includes(cls.subject || cls.course)
                          return (
                            <div
                              key={idx}
                              className={`p-4 transition-colors ${isConflict ? 'bg-yellow-500/10 border-l-4 border-yellow-500' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                {/* Left: Course info */}
                                <div className="flex-1 pr-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div
                                      className={`w-2 h-2 rounded-full flex-shrink-0 ${isConflict ? 'bg-yellow-400 animate-pulse' : 'bg-accent/40'}`}
                                    ></div>
                                    <h4
                                      className={` font-semibold text-sm ${isConflict ? 'text-yellow-400' : 'text-white'}`}
                                    >
                                      {cls.subject || cls.course}
                                    </h4>
                                    {isConflict && (
                                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs  font-semibold">
                                        Conflict
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs  text-accent/80">
                                      <MapPin className="w-3 h-3" />
                                      <span>{cls.room || 'Room TBD'}</span>
                                    </div>
                                    <div className="text-xs  text-accent/70">
                                      {cls.teacher || 'Teacher TBD'}
                                    </div>
                                    <div className="text-xs  text-accent/50">
                                      {cls.degree || 'N/A'} • S{cls.semester || 'N/A'}-
                                      {cls.section || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                {/* Right: Time info */}
                                <div className="text-right flex-shrink-0">
                                  <div className=" font-semibold text-base text-white">
                                    {cls.start}
                                  </div>
                                  <div className=" text-xs text-accent/60">{cls.end}</div>
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

  return (
    <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe">
      {/* Fixed Header */}
      <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
        <StepTrack currentStep={4} totalSteps={4} />
        <div className="text-center mb-6">
          <h1 className=" text-accent font-semibold text-xl mb-2">Review Your Timetable</h1>
          <p className="text-white/70 text-sm ">
            Review your schedule before creating the final timetable
          </p>
          {errorMsg && <div className="text-red-500 mt-2 text-sm">{errorMsg}</div>}
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
                  <div className="p-6 rounded-xl  text-lg border transition-all duration-200 text-left w-full bg-white/10 text-accent border-accent/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold mb-2">No Subjects Selected</div>
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

              {/* Timetable selection UI */}
              {allTimetables.length > 1 && (
                <div className="mb-2">
                  <div className="font-semibold text-white text-sm mb-1">
                    Select a timetable combination:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTimetables.map((tt, idx) => (
                      <button
                        key={idx}
                        className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${selectedTimetableIdx === idx ? 'bg-accent text-white border-accent' : 'bg-white/10 text-white/70 border-white/20 hover:bg-accent/20'}`}
                        onClick={() => {
                          setSelectedTimetableIdx(idx)
                          setGeminiSuggestions('')
                          setHasReverified(false)
                        }}
                      >
                        Combo {idx + 1}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    Showing {allTimetables.length} possible combinations
                  </div>
                </div>
              )}

              {/* Move Conflict Card and Gemini Card to Top */}
              {resolvedTimetable && !isResolving && (
                <>
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
                      <div className="font-semibold">
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
                        {Object.values(userPreferences.seatAvailability).filter(Boolean).length >
                          0 &&
                          ` • ${Object.values(userPreferences.seatAvailability).filter(Boolean).length} confirmed seats`}
                      </div>
                    )}
                    {/* Prompt user to reverify timetable */}
                    <div className="mt-2 text-xs text-yellow-300 font-semibold">
                      Please reverify your timetable and class times for each day before proceeding.
                    </div>
                  </div>
                  {/* XARVIN AI Review Card with Reverify Button */}
                  <div className="mt-3 p-4 rounded-xl border bg-accent/10 border-accent/20 text-white">
                    <div className="flex items-center justify-between">
                      XARVIN AI Review:
                      {!isReverifying && !geminiSuggestions && (
                        <button
                          className="px-3 py-1  text-white text-xs hover:bg-accent/80 transition rounded-full  font-semibold"
                          style={{
                            background:
                              'linear-gradient(135deg, #a980ff, #182fff99) 0 0 / 200% 200%',
                          }}
                          disabled={hasReverified}
                          onClick={async () => {
                            setIsReverifying(true)
                            setGeminiSuggestions('')
                            setHasReverified(false)
                            const geminiReply = await verifyTimetableWithGemini({
                              timetable: resolvedTimetable,
                              conflictSubjects,
                              resolutionSuggestions,
                              selectedSubjects,
                            })
                            setGeminiSuggestions(geminiReply)
                            setIsReverifying(false)
                            setHasReverified(true)
                          }}
                        >
                          <Sparkles className="w-4 h-4 inline-block mr-1" />
                          Reverify with AI
                        </button>
                      )}
                    </div>

                    {/* Reasoning Animation */}
                    {isReverifying && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-accent/50 animate-pulse flex justify-center items-center">
                          <div className="w-1 h-1 rounded-full bg-accent"></div>
                        </div>
                        <ShinyText
                          text="Xarvin is analyzing your timetable..."
                          disabled={false}
                          speed={3}
                          className="custom-class"
                        />
                      </div>
                    )}
                    {/* AI Response */}
                    {geminiSuggestions && !isReverifying && (
                      <div className="mt-2 text-sm whitespace-pre-line text-white/80">
                        {geminiSuggestions}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-4">
                {/* Timetable by Day */}
                {resolvedTimetable && renderTimetableByDay(resolvedTimetable)}

                {/* Resolution Progress */}
                {isResolving && (
                  <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                      <div className="font-semibold">Resolving Conflicts...</div>
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
                    <div className="font-semibold text-white text-sm mb-2">Suggestions:</div>
                    {resolutionSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="font-semibold text-accent text-sm mb-1">
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
              </div>
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
              className=" px-4 rounded-xl h-full w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10 flex items-center justify-center"
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
              className={` px-4 rounded-xl w-full h-full text-[15px] transition shadow-md flex items-center justify-center
                ${selectedSubjects.length > 0 ? 'bg-accent text-white' : 'bg-accent/40 text-white/60'}
            `}
              disabled={selectedSubjects.length === 0}
              onClick={async () => {
                if (selectedSubjects.length > 0 && resolvedTimetable) {
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
                    await saveTimetable(timetableData, 'lagger')
                    localStorage.setItem('onboardingComplete', 'true')
                    navigate('/home', {
                      state: {
                        ...timetableData,
                        studentType: 'lagger',
                      },
                    })
                  } catch {
                    setErrorMsg('Failed to create timetable. Please try again.')
                  }
                }
              }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
