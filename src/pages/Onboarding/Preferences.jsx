import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  Target,
  Book,
  CheckCircle,
  Settings,
  Check,
  X,
} from 'lucide-react'
import TimeTable from '../../assets/timetable.json'
import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'

export default function Preferences() {
  const navigate = useNavigate()
  const location = useLocation()

  // Memoize selectedSubjects to prevent useMemo dependency changes
  const selectedSubjects = useMemo(() => {
    return location.state?.selectedSubjects || []
  }, [location.state?.selectedSubjects])

  // Get all subjects from timetable data if no subjects are provided
  const allSubjectsData = useMemo(() => {
    const subjectsMap = new Map()

    Object.entries(TimeTable).forEach(([degree, semesters]) => {
      Object.entries(semesters).forEach(([semester, sections]) => {
        Object.entries(sections).forEach(([section, dayData]) => {
          Object.values(dayData).forEach(daySlots => {
            daySlots.forEach(slot => {
              if (slot.course) {
                const key = slot.course
                if (!subjectsMap.has(key)) {
                  subjectsMap.set(key, [])
                }
                // Avoid duplicate locations
                const existingLocation = subjectsMap
                  .get(key)
                  .find(
                    loc =>
                      loc.degree === degree && loc.semester === semester && loc.section === section
                  )
                if (!existingLocation) {
                  subjectsMap.get(key).push({
                    degree,
                    semester,
                    section,
                    teacher: slot.teacher,
                    room: slot.room,
                  })
                }
              }
            })
          })
        })
      })
    })

    // Convert to array format
    return Array.from(subjectsMap.entries())
      .map(([subject, locations]) => ({
        name: subject,
        locations: locations,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Use selectedSubjects if provided, otherwise use all subjects for general preferences
  const subjectsForPreferences = selectedSubjects.length > 0 ? selectedSubjects : allSubjectsData

  const [userPreferences, setUserPreferences] = useState(() => {
    return (
      location.state?.userPreferences || {
        parentSection: {
          degree: '',
          semester: '',
          section: '',
        },
        generalSeatPolicy: 'custom',
        seatAvailability: {},
      }
    )
  })

  const [expandedSubjects, setExpandedSubjects] = useState(new Set())

  // Get available degrees, semesters, and sections from subjects
  const getAvailableOptions = useMemo(() => {
    const degrees = new Set()
    const semestersByDegree = {}
    const sectionsByDegreeSem = {}

    subjectsForPreferences.forEach(subject => {
      subject.locations.forEach(loc => {
        degrees.add(loc.degree)

        // Group semesters by degree
        if (!semestersByDegree[loc.degree]) {
          semestersByDegree[loc.degree] = new Set()
        }
        semestersByDegree[loc.degree].add(loc.semester)

        const key = `${loc.degree}-${loc.semester}`
        if (!sectionsByDegreeSem[key]) {
          sectionsByDegreeSem[key] = new Set()
        }
        sectionsByDegreeSem[key].add(loc.section)
      })
    })

    return {
      degrees: Array.from(degrees).sort(),
      semestersByDegree: Object.fromEntries(
        Object.entries(semestersByDegree).map(([degree, semesters]) => [
          degree,
          Array.from(semesters).sort(),
        ])
      ),
      sectionsByDegreeSem: Object.fromEntries(
        Object.entries(sectionsByDegreeSem).map(([key, sections]) => [
          key,
          Array.from(sections).sort(),
        ])
      ),
    }
  }, [subjectsForPreferences])

  const toggleSubjectExpansion = subjectName => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectName)) {
      newExpanded.delete(subjectName)
    } else {
      newExpanded.add(subjectName)
    }
    setExpandedSubjects(newExpanded)
  }

  // Loader state for button
  const [isCreating, setIsCreating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleCreateTimetable = async () => {
    setIsCreating(true)
    setProgress(0)
    let currentProgress = 0
    const progressIncrement = 2
    const intervalTime = 20
    while (currentProgress < 100) {
      currentProgress += progressIncrement
      setProgress(Math.min(currentProgress, 100))
      await new Promise(resolve => setTimeout(resolve, intervalTime))
    }
    // Go to preview step with selected subjects and preferences
    navigate('/preview', {
      state: {
        selectedSubjects: selectedSubjects,
        userPreferences,
      },
    })
  }

  // Check if all sections for all subjects are marked as full
  const allSectionsFullForAllSubjects =
    subjectsForPreferences.length > 0 &&
    subjectsForPreferences.every(subject => {
      return (
        subject.locations.length > 0 &&
        subject.locations.every(loc => {
          const sectionKey = `${subject.name}-${loc.degree}-${loc.semester}-${loc.section}`
          return userPreferences.seatAvailability[sectionKey] === false
        })
      )
    })

  const canContinue =
    userPreferences.parentSection.degree &&
    userPreferences.parentSection.semester &&
    userPreferences.parentSection.section &&
    !allSectionsFullForAllSubjects

  return (
    <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe-offset-3">
      {/* Fixed Header */}
      <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
        <StepTrack currentStep={3} totalSteps={4} />
        <div className="text-center mb-6">
          <h1 className=" text-accent font-semibold text-xl mb-2">Set Your Preferences</h1>
          <p className="text-white/70 text-sm ">
            {selectedSubjects.length > 0
              ? 'Choose your parent section and seat availability preferences'
              : 'Set general preferences for automatic clash resolution'}
          </p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar min-h-0">
        <div className="flex flex-col gap-6 px-2 py-4 pb-8">
          {/* Parent Section Card */}
          <div className="bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 rounded-3xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h4 className="text-accent font-semibold text-lg">Parent Section</h4>
                <p className="text-white/60 text-sm">
                  Your main section for maximum subject placement
                </p>
              </div>
            </div>

            {/* Degree Selection */}
            <div className="mb-4">
              <label className="block text-white font-semibold mb-3 text-sm">
                Choose Your Degree <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {getAvailableOptions.degrees.map(degree => (
                  <button
                    key={degree}
                    onClick={() =>
                      setUserPreferences(prev => ({
                        ...prev,
                        parentSection: {
                          degree,
                          semester: '',
                          section: '',
                        },
                      }))
                    }
                    className={`p-2 rounded-3xl border text-xs font-semibold transition-all ${
                      userPreferences.parentSection.degree === degree
                        ? 'bg-accent text-white border-accent shadow-lg'
                        : 'bg-white/2 text-white/70 border-white/10 hover:border-accent/30 hover:bg-accent/5'
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
                <label className="block text-white font-semibold mb-3 text-sm">
                  Choose Your Semester <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {getAvailableOptions.semestersByDegree[userPreferences.parentSection.degree]?.map(
                    semester => (
                      <button
                        key={semester}
                        onClick={() =>
                          setUserPreferences(prev => ({
                            ...prev,
                            parentSection: {
                              ...prev.parentSection,
                              semester,
                              section: '',
                            },
                          }))
                        }
                        className={`p-2 rounded-3xl border text-xs font-semibold transition-all ${
                          userPreferences.parentSection.semester === semester
                            ? 'bg-accent text-white border-accent shadow-lg'
                            : 'bg-white/2 text-white/70 border-white/10 hover:border-accent/30 hover:bg-accent/5'
                        }`}
                      >
                        Sem {semester}
                      </button>
                    )
                  )}
                  {(!getAvailableOptions.semestersByDegree[userPreferences.parentSection.degree] ||
                    getAvailableOptions.semestersByDegree[userPreferences.parentSection.degree]
                      .length === 0) && (
                    <div className="col-span-4 text-white/50 text-sm text-center py-4">
                      No semesters available for this degree
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section Selection */}
            {userPreferences.parentSection.degree && userPreferences.parentSection.semester && (
              <div className="mb-4">
                <label className="block text-white font-semibold mb-3 text-sm">
                  Choose Your Section <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {getAvailableOptions.sectionsByDegreeSem[
                    `${userPreferences.parentSection.degree}-${userPreferences.parentSection.semester}`
                  ]?.map(section => (
                    <button
                      key={section}
                      onClick={() =>
                        setUserPreferences(prev => ({
                          ...prev,
                          parentSection: {
                            ...prev.parentSection,
                            section,
                          },
                        }))
                      }
                      className={`p-2 rounded-3xl border text-xs font-semibold transition-all ${
                        userPreferences.parentSection.section === section
                          ? 'bg-accent text-white border-accent shadow-lg'
                          : 'bg-white/2 text-white/70 border-white/10 hover:border-accent/30 hover:bg-accent/5'
                      }`}
                    >
                      {section}
                    </button>
                  )) || (
                    <div className="col-span-8 text-white/50 text-sm text-center py-4">
                      No sections available for this combination
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Parent Section Summary */}
            {userPreferences.parentSection.degree &&
              userPreferences.parentSection.semester &&
              userPreferences.parentSection.section && (
                <div className="mt-4 p-3 bg-accent/20 border border-accent/30 rounded-3xl">
                  <div className="text-accent font-semibold text-sm mb-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Selected Parent Section:
                  </div>
                  <div className="text-accent text-lg font-semibold">
                    {userPreferences.parentSection.degree} • Semester{' '}
                    {userPreferences.parentSection.semester} • Section{' '}
                    {userPreferences.parentSection.section}
                  </div>
                </div>
              )}
          </div>

          {/* Manual Seat Selection */}
          <div className="bg-white/2 border border-white/10 rounded-3xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-lg">
                <Settings className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Manual Seat Selection</h4>
                <p className="text-white/60 text-sm">
                  Specify exact seat availability for each subject-section combination
                </p>
              </div>
            </div>

            {/* Manual Seat Selection Content */}
            <div className="mb-4">
              <h4 className="text-white font-semibold text-lg mb-2">
                Subject-Specific Seat Availability
              </h4>
              <p className="text-white/60 text-sm">
                Set exact seat availability for each subject-section combination.
              </p>
            </div>

            <div className="space-y-3">
              {subjectsForPreferences.map(subject => {
                const isExpanded = expandedSubjects.has(subject.name)
                // Handler: Check if all sections for this subject are marked as Full
                const allFull =
                  subject.locations.length > 0 &&
                  subject.locations.every(loc => {
                    const sectionKey = `${subject.name}-${loc.degree}-${loc.semester}-${loc.section}`
                    return userPreferences.seatAvailability[sectionKey] === false
                  })
                return (
                  <div key={subject.name} className="border border-white/10 rounded-3xl">
                    <button
                      onClick={() => toggleSubjectExpansion(subject.name)}
                      className="w-full p-3 text-left hover:bg-white/2 rounded-3xl transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-lg">
                            <Book className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <div className="text-accent font-semibold">{subject.name}</div>
                            <div className="text-white/60 text-sm">
                              {subject.locations.length} sections available
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-white/60" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/60" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 space-y-2">
                        {/* Handler: Show warning if all sections are full for this subject */}
                        {allFull && (
                          <div className="p-3 mb-2 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 text-sm font-semibold">
                            All sections for <span className="font-bold">{subject.name}</span> are
                            marked as Full. This subject will not be included in your timetable.
                          </div>
                        )}
                        {subject.locations.map(location => {
                          const sectionKey = `${subject.name}-${location.degree}-${location.semester}-${location.section}`
                          const isFull = userPreferences.seatAvailability[sectionKey] === false
                          return (
                            <div
                              key={sectionKey}
                              className={`flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-2xl border border-white/10 bg-white/5 ${isFull ? 'opacity-60' : ''}`}
                            >
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-white text-sm">
                                  {location.degree} • Sem {location.semester} • Sec{' '}
                                  {location.section}
                                </div>
                                <div className="text-xs text-white/60">
                                  Teacher: {location.teacher || 'N/A'} | Room:{' '}
                                  {location.room || 'N/A'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2 md:mt-0">
                                <button
                                  className={`px-3 py-1 rounded-2xl text-xs font-semibold border transition-all ${isFull ? 'bg-yellow-500/20 border-yellow-500 text-yellow-700' : 'bg-green-500/20 border-green-500 text-green-700'}`}
                                  onClick={() => {
                                    setUserPreferences(prev => ({
                                      ...prev,
                                      seatAvailability: {
                                        ...prev.seatAvailability,
                                        [sectionKey]: isFull ? true : false,
                                      },
                                    }))
                                  }}
                                >
                                  {isFull ? 'Mark Available' : 'Mark Full'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Error message if all sections full for all subjects */}
      {allSectionsFullForAllSubjects && (
        <div className="w-full max-w-md mx-auto px-2 pb-2">
          <div className="p-3 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-700 text-sm font-semibold text-center">
            All sections full for all subjects, can't proceed.
          </div>
        </div>
      )}

      {/* Fixed Navigation Buttons */}
      <div className="flex flex-row gap-3 items-stretch justify-center w-full max-w-md mx-auto px-2 pb-6 pt-2 bg-gradient-to-b from-transparent to-black h-20">
        <button
          className=" px-4 py-3 rounded-3xl w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/5 hover:bg-accent/10"
          onClick={() =>
            navigate('/resolve', {
              state: {
                selectedSubjects,
                step: 'subject-selection',
              },
            })
          }
        >
          Back
        </button>

        <button
          className={`px-4 rounded-3xl w-full h-full text-[15px] transition shadow-md flex items-center justify-center
                          ${
                            canContinue
                              ? 'bg-accent text-white hover:bg-accent/80'
                              : 'bg-accent/40 text-white/60 cursor-not-allowed'
                          }
                      `}
          disabled={!canContinue || isCreating}
          onClick={handleCreateTimetable}
        >
          {isCreating ? (
            <div className="flex flex-col items-center w-full">
              <div className="w-full  bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            'Create Timetable'
          )}
        </button>
      </div>
    </div>
  )
}
