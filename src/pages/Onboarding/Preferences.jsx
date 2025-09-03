import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, Target, Book } from 'lucide-react'
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

  const [userPreferences, setUserPreferences] = useState({
    parentSection: {
      degree: '',
      semester: '',
      section: '',
    },
    generalSeatPolicy: '',
    seatAvailability: {},
  })

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [expandedSubjects, setExpandedSubjects] = useState(new Set())

  // Get available degrees, semesters, and sections from subjects
  const getAvailableOptions = useMemo(() => {
    const degrees = new Set()
    const semesters = new Set()
    const sectionsByDegreeSem = {}

    subjectsForPreferences.forEach(subject => {
      subject.locations.forEach(loc => {
        degrees.add(loc.degree)
        semesters.add(loc.semester)
        const key = `${loc.degree}-${loc.semester}`
        if (!sectionsByDegreeSem[key]) {
          sectionsByDegreeSem[key] = new Set()
        }
        sectionsByDegreeSem[key].add(loc.section)
      })
    })

    return {
      degrees: Array.from(degrees).sort(),
      semesters: Array.from(semesters).sort(),
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

  const handleContinue = () => {
    // Go to resolution step with selected subjects and preferences
    navigate('/resolve', {
      state: {
        selectedSubjects: selectedSubjects,
        userPreferences,
        step: 'resolution',
      },
    })
  }

  const canContinue =
    userPreferences.parentSection.degree &&
    userPreferences.parentSection.semester &&
    userPreferences.parentSection.section &&
    userPreferences.generalSeatPolicy

  return (
    <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe">
      {/* Fixed Header */}
      <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
        <StepTrack currentStep={4} totalSteps={5} />
        <div className="text-center mb-6">
          <h3 className="font-product-sans text-accent font-medium text-xl mb-2">
            Set Your Preferences
          </h3>
          <p className="text-white/70 text-sm font-product-sans">
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
          <div className="bg-gradient-to-r from-accent/10 to-blue-500/10 border border-accent/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h4 className="text-accent font-medium text-lg">Parent Section</h4>
                <p className="text-white/60 text-sm">
                  Your main section for maximum subject placement
                </p>
              </div>
            </div>

            {/* Degree Selection */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-3 text-sm">
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
                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                      userPreferences.parentSection.degree === degree
                        ? 'bg-accent text-white border-accent shadow-lg'
                        : 'bg-white/5 text-white/70 border-white/10 hover:border-accent/30 hover:bg-accent/5'
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
                <label className="block text-white font-medium mb-3 text-sm">
                  Choose Your Semester <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {getAvailableOptions.semesters.map(semester => (
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
                      className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                        userPreferences.parentSection.semester === semester
                          ? 'bg-accent text-white border-accent shadow-lg'
                          : 'bg-white/5 text-white/70 border-white/10 hover:border-accent/30 hover:bg-accent/5'
                      }`}
                    >
                      Sem {semester}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section Selection */}
            {userPreferences.parentSection.degree && userPreferences.parentSection.semester && (
              <div className="mb-4">
                <label className="block text-white font-medium mb-3 text-sm">
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
                      className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                        userPreferences.parentSection.section === section
                          ? 'bg-accent text-white border-accent shadow-lg'
                          : 'bg-white/5 text-white/70 border-white/10 hover:border-accent/30 hover:bg-accent/5'
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
                <div className="mt-4 p-3 bg-accent/20 border border-accent/30 rounded-lg">
                  <div className="text-accent font-medium text-sm mb-1">
                    ✅ Selected Parent Section:
                  </div>
                  <div className="text-accent text-lg font-bold">
                    {userPreferences.parentSection.degree} • Semester{' '}
                    {userPreferences.parentSection.semester} • Section{' '}
                    {userPreferences.parentSection.section}
                  </div>
                </div>
              )}
          </div>

          {/* Seat Availability Policy Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🪑</div>
              <div>
                <h4 className="text-white font-medium text-lg">Seat Availability</h4>
                <p className="text-white/60 text-sm">
                  How strict should we be about seat availability?
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() =>
                  setUserPreferences(prev => ({
                    ...prev,
                    generalSeatPolicy: 'flexible',
                    seatAvailability: {},
                  }))
                }
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  userPreferences.generalSeatPolicy === 'flexible'
                    ? 'bg-green-500/20 border-green-500/40 text-green-300'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-green-500/30 hover:bg-green-500/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg">✅</div>
                  <div>
                    <div className="font-medium text-sm">Flexible - Seats Generally Available</div>
                    <div className="text-xs opacity-80 mt-0.5">
                      I can get seats in most sections. Focus on parent section first, then best
                      schedule.
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setUserPreferences(prev => ({
                    ...prev,
                    generalSeatPolicy: 'moderate',
                    seatAvailability: {},
                  }))
                }
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  userPreferences.generalSeatPolicy === 'moderate'
                    ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-yellow-500/30 hover:bg-yellow-500/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg">⚠️</div>
                  <div>
                    <div className="font-medium text-sm">Moderate - Some Sections May Be Full</div>
                    <div className="text-xs opacity-80 mt-0.5">
                      Parent section is priority, but be cautious with popular sections.
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() =>
                  setUserPreferences(prev => ({
                    ...prev,
                    generalSeatPolicy: 'strict',
                    seatAvailability: {},
                  }))
                }
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  userPreferences.generalSeatPolicy === 'strict'
                    ? 'bg-red-500/20 border-red-500/40 text-red-300'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-red-500/30 hover:bg-red-500/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg">🔒</div>
                  <div>
                    <div className="font-medium text-sm">
                      Strict - Only Confirmed Available Sections
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">
                      Many sections are full. Heavily favor parent section and avoid risky options.
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="w-full p-3 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg">⚙️</div>
                <div className="text-left">
                  <div className="font-medium text-sm">Advanced Seat Configuration</div>
                  <div className="text-xs opacity-80">
                    Specify exact seat availability per section
                  </div>
                </div>
              </div>
              {showAdvancedOptions ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Advanced Options Content */}
          {showAdvancedOptions && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="mb-4">
                <h4 className="text-white font-medium text-lg mb-2">
                  Subject-Specific Seat Availability
                </h4>
                <p className="text-white/60 text-sm">
                  Set exact seat availability for each subject-section combination. This overrides
                  the general policy.
                </p>
              </div>

              <div className="space-y-3">
                {subjectsForPreferences.map(subject => {
                  const isExpanded = expandedSubjects.has(subject.name)
                  return (
                    <div key={subject.name} className="border border-white/10 rounded-lg">
                      <button
                        onClick={() => toggleSubjectExpansion(subject.name)}
                        className="w-full p-3 text-left hover:bg-white/5 rounded-lg transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg">
                              <Book className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                              <div className="text-accent font-medium">{subject.name}</div>
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
                          {subject.locations.map((location, idx) => {
                            const sectionKey = `${location.degree}-${location.semester}-${location.section}`
                            const availabilityKey = `${subject.name}-${sectionKey}`
                            const currentStatus = userPreferences.seatAvailability[availabilityKey]

                            const isParentSection =
                              location.degree === userPreferences.parentSection.degree &&
                              location.semester === userPreferences.parentSection.semester &&
                              location.section === userPreferences.parentSection.section

                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg ${
                                  isParentSection
                                    ? 'bg-accent/10 border border-accent/20'
                                    : 'bg-white/5'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="text-white text-sm font-medium flex items-center gap-2">
                                      {location.degree} • Semester {location.semester} • Section{' '}
                                      {location.section}
                                      {isParentSection && (
                                        <span className="text-xs bg-accent text-white px-2 py-1 rounded flex items-center gap-1">
                                          <Target className="w-3 h-3" /> PARENT
                                        </span>
                                      )}
                                    </div>
                                    {location.teacher && (
                                      <div className="text-white/60 text-xs mt-1">
                                        Teacher: {location.teacher}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() =>
                                      setUserPreferences(prev => ({
                                        ...prev,
                                        generalSeatPolicy: 'custom',
                                        seatAvailability: {
                                          ...prev.seatAvailability,
                                          [availabilityKey]: true,
                                        },
                                      }))
                                    }
                                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                                      currentStatus === true
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white/10 text-white/70 hover:bg-green-500/20'
                                    }`}
                                  >
                                    ✓ Available
                                  </button>
                                  <button
                                    onClick={() =>
                                      setUserPreferences(prev => ({
                                        ...prev,
                                        generalSeatPolicy: 'custom',
                                        seatAvailability: {
                                          ...prev.seatAvailability,
                                          [availabilityKey]: false,
                                        },
                                      }))
                                    }
                                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                                      currentStatus === false
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white/10 text-white/70 hover:bg-red-500/20'
                                    }`}
                                  >
                                    ✗ Full
                                  </button>
                                  <button
                                    onClick={() =>
                                      setUserPreferences(prev => {
                                        const newSeatAvailability = { ...prev.seatAvailability }
                                        delete newSeatAvailability[availabilityKey]
                                        return {
                                          ...prev,
                                          seatAvailability: newSeatAvailability,
                                        }
                                      })
                                    }
                                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                                      currentStatus === undefined
                                        ? 'bg-yellow-500 text-black'
                                        : 'bg-white/10 text-white/70 hover:bg-yellow-500/20'
                                    }`}
                                  >
                                    ? Auto
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
          )}
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="flex-shrink-0 w-full max-w-md mx-auto px-2 pt-4 pb-6">
        <div className="flex flex-row gap-3 items-center justify-center w-full">
          <button
            className="font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10"
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
            className={`font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md
                            ${
                              canContinue
                                ? 'bg-accent text-white hover:bg-accent/80'
                                : 'bg-accent/40 text-white/60 cursor-not-allowed'
                            }
                        `}
            disabled={!canContinue}
            onClick={handleContinue}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
