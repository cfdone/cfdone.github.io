import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, CheckCircle, AlertTriangle, Book, Target, MapPin } from 'lucide-react'
import TimeTable from '../../assets/timetable.json'
import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'

export default function Resolve() {
  const navigate = useNavigate()
  const location = useLocation()

  // Determine current step from location state
  const currentStep = location.state?.step || 'resolution'

  // State for selected subjects (editable in subject selection step)
  const [selectedSubjects, setSelectedSubjects] = useState(() => {
    return location.state?.selectedSubjects || []
  })

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
  // Add resolving state
  const [isResolving, setIsResolving] = useState(false)
  const [resolutionProgress, setResolutionProgress] = useState(0)

  // Get all available subjects from timetable data
  const allAvailableSubjects = useMemo(() => {
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

    // Convert to array and sort
    return Array.from(subjectsMap.entries())
      .map(([subject, locations]) => ({
        name: subject,
        locations: locations,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Subject selection handlers
  const handleSubjectToggle = useCallback(subject => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.name === subject.name)
      if (isSelected) {
        return prev.filter(s => s.name !== subject.name)
      } else {
        return [...prev, subject]
      }
    })
  }, [])

  // Navigation handlers
  const handleContinueToPreferences = () => {
    navigate('/preferences', {
      state: {
        selectedSubjects,
        userPreferences: null,
      },
    })
  }

  // Get all unique subjects with their degree/section information (memoized)
  // Enhanced CSP Algorithm with General Seat Policies
  const resolveSubjectsAsync = useCallback(async () => {
    // First check if we need user preferences (now handled in separate step)
    if (selectedSubjects.length === 0) {
      console.log('No subjects selected')
      setIsResolving(false)
      return
    }

    // Time conversion utility
    const timeToMinutes = timeStr => {
      if (!timeStr || typeof timeStr !== 'string') return 0
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
      if (!timeMatch) return 0
      const hours = parseInt(timeMatch[1], 10)
      const minutes = parseInt(timeMatch[2], 10)
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0
      return hours * 60 + minutes
    }

    // Check if two time slots overlap
    const doTimeSlotsOverlap = (slot1, slot2) => {
      const start1 = timeToMinutes(slot1.start)
      const end1 = timeToMinutes(slot1.end)
      const start2 = timeToMinutes(slot2.start)
      const end2 = timeToMinutes(slot2.end)
      return start1 < end2 && start2 < end1
    }

    // Get all time slots for a subject-section combination
    const getTimeSlots = (subjectName, location) => {
      const slots = []
      const sectionData = TimeTable[location.degree]?.[location.semester]?.[location.section]
      if (!sectionData) return slots

      Object.entries(sectionData).forEach(([day, daySlots]) => {
        if (Array.isArray(daySlots)) {
          daySlots.forEach(slot => {
            if (slot.course === subjectName) {
              slots.push({
                day,
                start: slot.start,
                end: slot.end,
                subject: subjectName,
                teacher: slot.teacher,
                room: slot.room,
              })
            }
          })
        }
      })
      return slots
    }

    // Calculate preference score for a section (higher = more preferred)
    const calculatePreferenceScore = (location, subjectName) => {
      let score = 0
      const { parentSection, generalSeatPolicy } = userPreferences

      // Parent section gets MAXIMUM preference (highest priority)
      const isExactParentMatch =
        location.degree === parentSection.degree &&
        location.semester === parentSection.semester &&
        location.section === parentSection.section

      if (isExactParentMatch) {
        score += 1000 // Highest possible score for exact parent section match
      } else {
        // Partial matches get progressively lower scores
        if (location.degree === parentSection.degree) {
          score += 100 // Same degree
          if (location.semester === parentSection.semester) {
            score += 50 // Same degree and semester
          }
        }
      }

      // Apply general seat policy bonuses/penalties
      switch (generalSeatPolicy) {
        case 'flexible':
          // Flexible policy - slight bonus for all sections, massive bonus for parent
          if (isExactParentMatch) {
            score += 200 // Extra bonus for parent section
          } else {
            score += 10 // Small bonus for other sections (assume seats available)
          }
          break

        case 'moderate':
          // Moderate policy - strong preference for parent section, neutral for others
          if (isExactParentMatch) {
            score += 300 // Higher bonus for parent section
          }
          // No bonus/penalty for other sections (neutral assumption)
          break

        case 'strict':
          // Strict policy - heavily favor parent section, penalize others
          if (isExactParentMatch) {
            score += 500 // Very high bonus for parent section
          } else {
            score -= 100 // Penalty for non-parent sections (assume risky)
          }
          break

        case 'custom': {
          // Custom policy - use specific seat availability settings
          const sectionKey = `${location.degree}-${location.semester}-${location.section}`
          const availabilityKey = `${subjectName}-${sectionKey}`
          if (userPreferences.seatAvailability[availabilityKey] === true) {
            score += 200 // High bonus for confirmed seat availability
          } else if (userPreferences.seatAvailability[availabilityKey] === false) {
            score -= 500 // Heavy penalty for no seats
          }
          // Unknown seat availability gets neutral score
          break
        }

        default:
          // No seat policy specified - neutral approach
          break
      }

      // Teacher preference (small bonus)
      if (location.teacher) {
        score += 5 // Small bonus for having teacher info
      }

      return score
    }

    // Enhanced CSP Solver with Parent Section Preferences
    class ParentSectionAwareCSPSolver {
      constructor(subjects, preferences) {
        this.subjects = subjects
        this.preferences = preferences
        this.domains = {}
        this.assignment = {}
        this.constraints = []
        this.initializeDomains()
        this.generateConstraints()
      }

      // Initialize domains with parent section preference-based sorting
      initializeDomains() {
        this.subjects.forEach(subject => {
          // Sort locations by preference score (highest first)
          const sortedLocations = [...subject.locations].sort((a, b) => {
            const scoreA = calculatePreferenceScore(a, subject.name)
            const scoreB = calculatePreferenceScore(b, subject.name)
            return scoreB - scoreA // Higher scores first
          })

          this.domains[subject.name] = sortedLocations
        })
      }

      // Generate all pairwise time conflict constraints
      generateConstraints() {
        for (let i = 0; i < this.subjects.length; i++) {
          for (let j = i + 1; j < this.subjects.length; j++) {
            const subject1 = this.subjects[i].name
            const subject2 = this.subjects[j].name
            this.constraints.push([subject1, subject2])
          }
        }
      }

      // Check if current assignment satisfies all constraints
      isConsistent(subject, location) {
        const timeSlots1 = getTimeSlots(subject, location)

        for (const [s1, s2] of this.constraints) {
          if (subject === s1 && this.assignment[s2]) {
            const timeSlots2 = getTimeSlots(s2, this.assignment[s2])
            for (const slot1 of timeSlots1) {
              for (const slot2 of timeSlots2) {
                if (slot1.day === slot2.day && doTimeSlotsOverlap(slot1, slot2)) {
                  return false
                }
              }
            }
          } else if (subject === s2 && this.assignment[s1]) {
            const timeSlots2 = getTimeSlots(s1, this.assignment[s1])
            for (const slot1 of timeSlots1) {
              for (const slot2 of timeSlots2) {
                if (slot1.day === slot2.day && doTimeSlotsOverlap(slot1, slot2)) {
                  return false
                }
              }
            }
          }
        }
        return true
      }

      // Enhanced variable selection prioritizing subjects available in parent section
      selectUnassignedVariable() {
        const unassigned = this.subjects.filter(s => !this.assignment[s.name])
        if (unassigned.length === 0) return null

        // Prioritize subjects that have sections in parent section
        const { parentSection } = this.preferences
        const parentSectionSubjects = unassigned.filter(subject =>
          subject.locations.some(
            loc =>
              loc.degree === parentSection.degree &&
              loc.semester === parentSection.semester &&
              loc.section === parentSection.section
          )
        )

        if (parentSectionSubjects.length > 0) {
          // Among parent section subjects, choose the most constrained (MRV heuristic)
          return parentSectionSubjects.reduce((most, current) => {
            const currentDomainSize = this.domains[current.name]?.length || 0
            const mostDomainSize = this.domains[most.name]?.length || 0
            return currentDomainSize < mostDomainSize ? current : most
          })
        }

        // Fallback to most constrained variable
        return unassigned.reduce((most, current) => {
          const currentDomainSize = this.domains[current.name]?.length || 0
          const mostDomainSize = this.domains[most.name]?.length || 0
          return currentDomainSize < mostDomainSize ? current : most
        })
      }

      // Domain values already sorted by parent section preference
      orderDomainValues(subject) {
        return this.domains[subject.name] || []
      }

      // Forward checking with parent section awareness
      forwardCheck(subject, location) {
        const removedValues = {}

        for (const [s1, s2] of this.constraints) {
          let targetSubject = null
          if (subject.name === s1 && !this.assignment[s2]) {
            targetSubject = s2
          } else if (subject.name === s2 && !this.assignment[s1]) {
            targetSubject = s1
          }

          if (targetSubject) {
            const timeSlots1 = getTimeSlots(subject.name, location)
            const toRemove = []

            for (const candidateLocation of this.domains[targetSubject]) {
              const timeSlots2 = getTimeSlots(targetSubject, candidateLocation)
              let hasConflict = false

              for (const slot1 of timeSlots1) {
                for (const slot2 of timeSlots2) {
                  if (slot1.day === slot2.day && doTimeSlotsOverlap(slot1, slot2)) {
                    hasConflict = true
                    break
                  }
                }
                if (hasConflict) break
              }

              if (hasConflict) {
                toRemove.push(candidateLocation)
              }
            }

            if (toRemove.length > 0) {
              if (!removedValues[targetSubject]) {
                removedValues[targetSubject] = []
              }
              removedValues[targetSubject] = [...toRemove]
              this.domains[targetSubject] = this.domains[targetSubject].filter(
                loc => !toRemove.includes(loc)
              )

              // Domain wipeout check
              if (this.domains[targetSubject].length === 0) {
                return { success: false, removedValues }
              }
            }
          }
        }

        return { success: true, removedValues }
      }

      // Restore removed values during backtracking
      restoreValues(removedValues) {
        Object.entries(removedValues).forEach(([subject, values]) => {
          this.domains[subject] = [...this.domains[subject], ...values]
          // Re-sort by preference after restoration
          const subjectData = this.subjects.find(s => s.name === subject)
          if (subjectData) {
            this.domains[subject] = this.domains[subject].sort((a, b) => {
              const scoreA = calculatePreferenceScore(a, subject)
              const scoreB = calculatePreferenceScore(b, subject)
              return scoreB - scoreA
            })
          }
        })
      }

      // Backtracking search
      async backtrack() {
        const variable = this.selectUnassignedVariable()
        if (!variable) return true // All variables assigned successfully

        const values = this.orderDomainValues(variable)

        for (const value of values) {
          if (this.isConsistent(variable, value)) {
            this.assignment[variable.name] = value

            const forwardCheckResult = this.forwardCheck(variable, value)

            if (forwardCheckResult.success) {
              const result = await this.backtrack()
              if (result) return true
            }

            // Backtrack
            delete this.assignment[variable.name]
            this.restoreValues(forwardCheckResult.removedValues)
          }
        }

        return false
      }

      async solve() {
        const success = await this.backtrack()
        return {
          success,
          assignment: { ...this.assignment },
          parentSectionMatches: this.countParentSectionMatches(),
        }
      }

      countParentSectionMatches() {
        const { parentSection } = this.preferences
        let matches = 0

        Object.entries(this.assignment).forEach(([, location]) => {
          if (
            location.degree === parentSection.degree &&
            location.semester === parentSection.semester &&
            location.section === parentSection.section
          ) {
            matches++
          }
        })

        return matches
      }
    }

    try {
      setResolutionProgress(5)

      const solver = new ParentSectionAwareCSPSolver(selectedSubjects, userPreferences)
      setResolutionProgress(20)

      const result = await solver.solve()
      setResolutionProgress(95)

      if (result.success) {
        // Build timetable from the solution
        const timetable = {}
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        days.forEach(day => {
          timetable[day] = []
        })

        Object.entries(result.assignment).forEach(([subject, location]) => {
          const sectionData = TimeTable[location.degree]?.[location.semester]?.[location.section]
          if (!sectionData) return

          Object.entries(sectionData).forEach(([day, slots]) => {
            if (Array.isArray(slots)) {
              slots.forEach(slot => {
                if (slot.course === subject) {
                  timetable[day].push({
                    ...slot,
                    subject,
                    degree: location.degree,
                    semester: location.semester,
                    section: location.section,
                  })
                }
              })
            }
          })
        })

        // Sort slots by time
        Object.keys(timetable).forEach(day => {
          timetable[day].sort((a, b) => {
            const timeA = timeToMinutes(a.start)
            const timeB = timeToMinutes(b.start)
            return timeA - timeB
          })
        })

        setResolvedTimetable(timetable)
        setConflictSubjects([])
        setResolutionSuggestions([])

        console.log(
          `Perfect parent section solution found! ${result.parentSectionMatches}/${selectedSubjects.length} subjects placed in parent section`
        )
      } else {
        // CSP failed, fall back to best effort combination
        console.log('CSP solver failed, falling back to best effort...')
        setResolutionProgress(50)

        // Use the original combination-based approach as fallback
        const fallbackResult = await findBestCombination(selectedSubjects)
        if (fallbackResult.clashes === 0) {
          setResolvedTimetable(fallbackResult.timetable)
          setConflictSubjects([])
          setResolutionSuggestions([])
        } else {
          const conflicted = findConflictedSubjects(fallbackResult.timetable)
          setConflictSubjects(conflicted)
          setResolutionSuggestions(generateResolutionSuggestions(conflicted))
          setResolvedTimetable(fallbackResult.timetable)
        }
      }

      setResolutionProgress(100)

      setTimeout(() => {
        setIsResolving(false)
        setResolutionProgress(0)
      }, 300)
    } catch (error) {
      console.error('Parent-section-aware CSP error:', error)
      setIsResolving(false)
      setResolutionProgress(0)
    }

    // Helper functions for fallback
    async function findBestCombination(subjects) {
      // Implementation of the original combination-based approach
      // (keeping the existing logic as fallback)
      let _bestCombination = null
      let _minClashes = Infinity
      let _bestTimetable = null

      // Simple greedy approach for fallback
      const assignment = {}
      subjects.forEach(subject => {
        // Choose the highest preference location for each subject
        const sortedLocations = [...subject.locations].sort((a, b) => {
          const scoreA = calculatePreferenceScore(a, subject.name)
          const scoreB = calculatePreferenceScore(b, subject.name)
          return scoreB - scoreA
        })
        assignment[subject.name] = sortedLocations[0]
      })

      const { timetable, clashes } = buildTimetableFromAssignment(assignment)
      return { combination: assignment, clashes, timetable }
    }

    function buildTimetableFromAssignment(assignment) {
      const timetable = {}
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      days.forEach(day => {
        timetable[day] = []
      })

      let totalClashes = 0
      const clashPairs = new Set()

      Object.entries(assignment).forEach(([subject, location]) => {
        const sectionData = TimeTable[location.degree]?.[location.semester]?.[location.section]
        if (!sectionData) return

        Object.entries(sectionData).forEach(([day, slots]) => {
          if (!Array.isArray(slots)) return

          slots.forEach(slot => {
            if (slot.course === subject) {
              const newSlot = {
                ...slot,
                subject,
                degree: location.degree,
                semester: location.semester,
                section: location.section,
              }

              const existingSlots = timetable[day]
              existingSlots.forEach(existingSlot => {
                if (doTimeSlotsOverlap(newSlot, existingSlot)) {
                  const pairId = [newSlot.subject, existingSlot.subject].sort().join('-')
                  if (!clashPairs.has(pairId)) {
                    clashPairs.add(pairId)
                    totalClashes++
                  }
                }
              })

              timetable[day].push(newSlot)
            }
          })
        })
      })

      Object.keys(timetable).forEach(day => {
        timetable[day].sort((a, b) => {
          const timeA = timeToMinutes(a.start)
          const timeB = timeToMinutes(b.start)
          return timeA - timeB
        })
      })

      return { timetable, clashes: totalClashes }
    }

    function findConflictedSubjects(timetable) {
      const conflicted = new Set()

      Object.entries(timetable).forEach(([, daySlots]) => {
        if (!Array.isArray(daySlots)) return

        for (let i = 0; i < daySlots.length; i++) {
          for (let j = i + 1; j < daySlots.length; j++) {
            const slot1 = daySlots[i]
            const slot2 = daySlots[j]

            if (doTimeSlotsOverlap(slot1, slot2)) {
              conflicted.add(slot1.subject)
              conflicted.add(slot2.subject)
            }
          }
        }
      })

      return Array.from(conflicted)
    }

    function generateResolutionSuggestions(conflictedSubjects) {
      const suggestions = []

      conflictedSubjects.forEach(subjectName => {
        const subjectData = selectedSubjects.find(s => s.name === subjectName)
        if (!subjectData) return

        const alternativeLocations = subjectData.locations.slice(1)

        if (alternativeLocations.length > 0) {
          suggestions.push({
            subject: subjectName,
            message: `${subjectName} has conflicts - try different sections`,
            alternatives: alternativeLocations.slice(0, 3),
          })
        } else {
          suggestions.push({
            subject: subjectName,
            message: `${subjectName} needs manual adjustment - limited sections available`,
            alternatives: [],
          })
        }
      })

      return suggestions
    }
  }, [selectedSubjects, userPreferences])

  // Debounced resolution - prevent immediate resolution on every subject change
  useEffect(() => {
    if (selectedSubjects.length === 0) {
      setResolvedTimetable(null)
      setConflictSubjects([])
      setResolutionSuggestions([])
      setIsResolving(false)
      return
    }

    setIsResolving(true)
    setResolutionProgress(0)

    // Debounce the resolution by 500ms to prevent lag during rapid selections
    const timeoutId = setTimeout(() => {
      resolveSubjectsAsync()
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [selectedSubjects, resolveSubjectsAsync])

  // Render different content based on current step
  const renderContent = () => {
    if (currentStep === 'subject-selection') {
      return (
        <>
          <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe">
            {/* Fixed Header */}
            <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
              <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
              <StepTrack currentStep={3} totalSteps={5} />
              <div className="text-center mb-6">
                <h3 className="font-product-sans text-accent font-black text-xl mb-2">
                  Select Your Subjects
                </h3>
                <p className="text-white/70 text-sm font-product-sans">
                  Choose the subjects you want to include in your timetable
                </p>
              </div>
            </div>

            {/* Scrollable Subject List */}
            <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar min-h-0">
              <div className="flex flex-col gap-3 px-2 py-4 pb-8">
                {allAvailableSubjects.map(subject => {
                  const isSelected = selectedSubjects.some(s => s.name === subject.name)
                  return (
                    <button
                      key={subject.name}
                      type="button"
                      className={`p-4 rounded-xl font-product-sans text-base border transition-all duration-200 text-left w-full
                                            ${
                                              isSelected
                                                ? 'bg-accent text-white border-accent shadow-lg'
                                                : 'bg-white/10 text-accent border-accent/10 hover:bg-accent/10'
                                            }
                                        `}
                      onClick={() => handleSubjectToggle(subject)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold mb-2 flex items-center gap-2">
                            {subject.name}
                            {isSelected && (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="text-sm opacity-80 space-y-1">
                            <div className="font-medium">
                              Available in {subject.locations.length} section
                              {subject.locations.length > 1 ? 's' : ''}:
                            </div>
                            {subject.locations.slice(0, 2).map((loc, locIdx) => (
                              <div key={locIdx} className="text-xs opacity-70 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {loc.degree} • S{loc.semester}-{loc.section}{' '}
                                {loc.teacher ? `• ${loc.teacher}` : ''}
                              </div>
                            ))}
                            {subject.locations.length > 2 && (
                              <div className="text-xs opacity-70">
                                +{subject.locations.length - 2} more sections available
                              </div>
                            )}
                          </div>
                        </div>
                        <BookOpen className={`w-6 h-6 ml-3 ${isSelected ? 'text-white' : 'text-accent'}`} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex-shrink-0 w-full max-w-md mx-auto px-2 pt-4 pb-6">
              <div className="flex flex-row gap-3 items-center justify-center w-full">
                <button
                  className="font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10"
                  onClick={() => navigate('/lagger')}
                >
                  Back
                </button>
                <button
                  className={`font-product-sans px-4 py-3 rounded-xl w-full h-full text-[15px] transition shadow-md
                                    ${
                                      selectedSubjects.length > 0
                                        ? 'bg-accent text-white hover:bg-accent/80'
                                        : 'bg-accent/40 text-white/60 cursor-not-allowed'
                                    }
                                `}
                  disabled={selectedSubjects.length === 0}
                  onClick={handleContinueToPreferences}
                >
                  Next ({selectedSubjects.length} selected)
                </button>
              </div>
            </div>
          </div>
        </>
      )
    }

    // Default to resolution view (existing content)
    return (
      <>
        <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe">
          {/* Fixed Header */}
          <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
            <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
            <StepTrack currentStep={5} totalSteps={5} />
            <div className="text-center mb-6">
              <h3 className=" font-product-sans text-accent font-black text-xl mb-2">
                Auto Clash Resolution
              </h3>
              <p className="text-white/70 text-sm font-product-sans">
                We'll automatically find the best sections using your preferences
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
                                      {loc.degree} • Semester {loc.semester} • Section{' '}
                                      {loc.section}
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

                      navigate('/', {
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
      </>
    )
  }

  return renderContent()
}
