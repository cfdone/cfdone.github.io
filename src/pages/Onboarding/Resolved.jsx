import { supabase } from '../../config/supabase'
import { useState, useMemo } from 'react'
import Toast from '../../components/Toast'
import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, Calendar, Tag } from 'lucide-react'
import TimeTable from '../../assets/timetable.json'
import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'
import { timeToMinutes } from '../../utils/timeUtils'
// ...existing code...

export default function Resolved() {
  const [toastMsg, setToastMsg] = useState('')
  const navigate = useNavigate()
  // ...existing code...

  // Degree/Semester/Section/Subject selection logic (from DegreeSectionSelector & SubjectSelector)
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [currentDegree, setCurrentDegree] = useState('')
  const [currentSemester, setCurrentSemester] = useState('')
  const [currentSection, setCurrentSection] = useState('')

  // Popup states
  const [showDegreeSelector, setShowDegreeSelector] = useState(false)
  const [showSemesterSelector, setShowSemesterSelector] = useState(false)
  const [showSectionSelector, setShowSectionSelector] = useState(false)
  const [showSubjectSelector, setShowSubjectSelector] = useState(false)

  // Loader states
  const [isCreating, setIsCreating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Get all available degrees, semesters, and sections
  const degreeNames = Object.keys(TimeTable)
  const semesterNames = currentDegree ? Object.keys(TimeTable[currentDegree]) : []
  const sectionNames =
    currentDegree && currentSemester ? Object.keys(TimeTable[currentDegree][currentSemester]) : []

  // Get subjects for current selection
  const availableSubjects = useMemo(() => {
    if (!currentDegree || !currentSemester || !currentSection) return []
    const subjects = new Set()
    const sectionData = TimeTable[currentDegree][currentSemester][currentSection]
    Object.values(sectionData).forEach(daySlots => {
      daySlots.forEach(slot => {
        if (slot.course) {
          subjects.add(slot.course)
        }
      })
    })
    return Array.from(subjects).sort()
  }, [currentDegree, currentSemester, currentSection])

  const handleSubjectToggle = subject => {
    setSelectedSubjects(prev => {
      // Check if this subject is already selected from any section
      const isAlreadySelected = prev.some(s => s.name === subject)
      if (isAlreadySelected) {
        // Remove the subject from all sections if it exists
        return prev.filter(s => s.name !== subject)
      } else {
        // Enforce maximum 10 subjects limit
        if (prev.length >= 10) {
          setToastMsg('You can only select up to 10 subjects.')
          return prev
        }
        // Add the subject from current selection
        return [
          ...prev,
          {
            name: subject,
            degree: currentDegree,
            semester: currentSemester,
            section: currentSection,
          },
        ]
      }
    })
  }

  const isSubjectSelected = subject => {
    // Check if subject is selected from any section (not just current one)
    return selectedSubjects.some(s => s.name === subject)
  }

  const removeSubject = subjectToRemove => {
    setSelectedSubjects(prev => prev.filter(s => s !== subjectToRemove))
  }

  const clearAll = () => {
    setSelectedSubjects([])
  }

  // Build custom timetable based on selected subjects from different degrees/sections
  const customTimetable = useMemo(() => {
    if (!selectedSubjects || selectedSubjects.length === 0) {
      return {}
    }
    const timetable = {}
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    days.forEach(day => {
      timetable[day] = []
    })
    selectedSubjects.forEach(subject => {
      const sectionData = TimeTable[subject.degree][subject.semester][subject.section]
      Object.entries(sectionData).forEach(([day, slots]) => {
        slots.forEach(slot => {
          if (slot.course === subject.name) {
            timetable[day].push({
              ...slot,
              subject: subject.name,
              degree: subject.degree,
              semester: subject.semester,
              section: subject.section,
            })
          }
        })
      })
    })
    Object.keys(timetable).forEach(day => {
      if (timetable[day].length > 1) {
        timetable[day].sort((a, b) => {
          const timeA = timeToMinutes(a.start)
          const timeB = timeToMinutes(b.start)
          if (timeA === 0 || timeB === 0) return 0
          return timeA - timeB
        })
      }
    })
    return timetable
  }, [selectedSubjects])

  // Popup handlers
  const handleDegreeSelect = degree => {
    setCurrentDegree(degree)
    setCurrentSemester('')
    setCurrentSection('')
    setShowDegreeSelector(false)
    if (degree) {
      setShowSemesterSelector(true)
    }
  }

  const handleSemesterSelect = semester => {
    setCurrentSemester(semester)
    setCurrentSection('')
    setShowSemesterSelector(false)
    if (semester) {
      setShowSectionSelector(true)
    }
  }

  const handleSectionSelect = section => {
    setCurrentSection(section)
    setShowSectionSelector(false)
    if (section) {
      setShowSubjectSelector(true)
    }
  }

  const handleAddMore = () => {
    setShowDegreeSelector(true)
  }

  return (
    <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe-offset-3">
      {/* Fixed Header */}
      <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
        <StepTrack currentStep={3} totalSteps={3} />
        <div className="text-center mb-6">
          <h1 className="  text-accent font-semibold text-xl mb-2">Build Custom Timetable</h1>
          <p className="text-white/70 text-sm ">
            Select subjects from any degree, semester, and section
          </p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar min-h-0">
        <div className="flex flex-col items-center gap-4 px-2 py-4 pb-8">
          <div className="w-full">
            <div className="flex flex-col gap-4">
              {/* Add Subjects Button */}
              {selectedSubjects.length === 0 && (
                <div className="text-center">
                  <button
                    onClick={handleAddMore}
                    className="p-6 rounded-3xl  text-lg border transition-all duration-200 text-left w-full bg-white/10 text-accent border-accent/5 hover:bg-accent/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold mb-2">Add Subjects</div>
                        <div className="text-sm opacity-80">
                          Start building your custom timetable
                        </div>
                      </div>
                      <BookOpen className="w-6 h-6 text-accent ml-4" />
                    </div>
                  </button>
                </div>
              )}

              {/* Selected Subjects Summary */}
              {selectedSubjects.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-white">
                      Selected Subjects ({selectedSubjects.length}/10)
                    </div>
                    <button
                      onClick={clearAll}
                      className="text-accent/70 hover:text-accent text-sm underline transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  {selectedSubjects.map((subject, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-3xl  text-lg border transition-all duration-200 text-left bg-accent/10 text-accent border-accent/5 hover:bg-accent/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold mb-2">{subject.name}</div>
                          <div className="text-sm opacity-80">
                            {subject.degree} • Semester {subject.semester} • Section{' '}
                            {subject.section}
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="flex-shrink-0 w-full max-w-md mx-auto px-2 pt-4 pb-6">
        <div className="flex flex-col gap-3 w-full">
          {/* Add More Subjects Button - Only show if subjects are selected */}
          {selectedSubjects.length > 0 && (
            <button
              onClick={handleAddMore}
              disabled={selectedSubjects.length >= 10}
              className={`w-full p-3 rounded-3xl  text-[15px] border transition-all duration-200 ${
                selectedSubjects.length >= 10
                  ? 'bg-white/2 text-accent/50 border-accent/5 cursor-not-allowed'
                  : 'bg-white/10 text-accent border-accent/5 hover:bg-accent/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>
                  {selectedSubjects.length >= 10
                    ? 'Maximum Subjects Selected'
                    : 'Add More Subjects'}
                </span>
                {selectedSubjects.length < 10 && <span className="text-lg">+</span>}
              </div>
            </button>
          )}

          {/* Navigation buttons */}
          <div className="flex flex-row gap-3 items-stretch justify-center w-full h-12">
            <button
              className=" px-4 rounded-3xl h-full w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/5 hover:bg-accent/10 flex items-center justify-center"
              onClick={() => navigate('/stepone')}
            >
              Back
            </button>
            <button
              className={` px-4 rounded-3xl w-full h-full text-[15px] transition shadow-md flex items-center justify-center
                                ${
                                  selectedSubjects.length > 0
                                    ? 'bg-accent text-white'
                                    : 'bg-accent/40 text-white/60'
                                }
                            `}
              disabled={selectedSubjects.length === 0 || isCreating}
              onClick={async () => {
                if (selectedSubjects.length > 0) {
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
                    timetable: customTimetable,
                    isCustom: true,
                    studentType: 'lagger',
                  }

                  try {
                    // Get current user
                    const {
                      data: { user },
                    } = await supabase.auth.getUser()
                    if (!user) {
                      setIsCreating(false)
                      alert('No authenticated user found. Please log in.')
                      return
                    }
                    // Upsert to Supabase with user_id only (overwrite previous record)
                    const { error } = await supabase.from('user_timetables').upsert(
                      [
                        {
                          user_id: user.id,
                          timetable_data: timetableData,
                          onboarding_mode: 'custom',
                        },
                      ],
                      { onConflict: ['user_id'], ignoreDuplicates: false }
                    )
                    if (error) {
                      setIsCreating(false)
                      alert('Failed to upsert timetable to Supabase.')
                      return
                    }
                    localStorage.setItem('timetableData', JSON.stringify(timetableData))
                    localStorage.setItem('onboardingComplete', 'true')
                    localStorage.setItem('onboardingMode', 'custom')
                    navigate('/home', {
                      state: timetableData,
                    })
                  } catch {
                    setIsCreating(false)
                  }
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
              ) : (
                'Create Timetable'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Degree Selection Popup */}
      {showDegreeSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-black border border-accent/20 rounded-3xl p-4 w-full max-w-sm max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-3">
              <h3 className="  text-accent font-semibold text-lg mb-2">Select Degree</h3>
              <button
                onClick={() => setShowDegreeSelector(false)}
                className="text-white/70 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {degreeNames.map(deg => (
                <button
                  key={deg}
                  type="button"
                  className="p-3 rounded-3xl  text-base border transition-all duration-200 text-left w-full bg-white/10 text-accent border-accent/5 hover:bg-accent/10"
                  onClick={() => handleDegreeSelect(deg)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">{deg}</div>
                      <div className="text-sm opacity-80">Degree</div>
                    </div>
                    <div className="text-xl">
                      <GraduationCap className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Semester Selection Popup */}
      {showSemesterSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-black border border-accent/20 rounded-3xl p-4 w-full max-w-sm max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-3">
              <h3 className="  text-accent font-semibold text-lg mb-2">Select Semester</h3>
              <button
                onClick={() => setShowSemesterSelector(false)}
                className="text-white/70 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <div className="text-accent text-sm mb-3">From {currentDegree}</div>

            <div className="space-y-2">
              {semesterNames.map(sem => (
                <button
                  key={sem}
                  type="button"
                  className="p-3 rounded-3xl  text-base border transition-all duration-200 text-left w-full bg-white/10 text-accent border-accent/5 hover:bg-accent/10"
                  onClick={() => handleSemesterSelect(sem)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">Semester {sem}</div>
                      <div className="text-sm opacity-80">Academic semester</div>
                    </div>
                    <div className="text-xl">
                      <Calendar className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section Selection Popup */}
      {showSectionSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-black border border-accent/20 rounded-3xl p-4 w-full max-w-sm max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-3">
              <h3 className="  text-accent font-semibold text-lg mb-2">Select Section</h3>
              <button
                onClick={() => setShowSectionSelector(false)}
                className="text-white/70 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <div className="text-accent text-sm mb-3">
              From {currentDegree} • Semester {currentSemester}
            </div>

            <div className="space-y-2">
              {sectionNames.map(sec => (
                <button
                  key={sec}
                  type="button"
                  className="p-3 rounded-3xl  text-base border transition-all duration-200 text-left w-full bg-white/10 text-accent border-accent/5 hover:bg-accent/10"
                  onClick={() => handleSectionSelect(sec)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">Section {sec}</div>
                      <div className="text-sm opacity-80">Class section</div>
                    </div>
                    <Tag className="w-6 h-6 text-accent" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subject Selection Popup */}
      {showSubjectSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-black border border-accent/20 rounded-3xl p-4 w-full max-w-sm max-h-[70vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-3">
              <h3 className="  text-accent font-semibold text-lg mb-2">Select Subjects</h3>
              <button
                onClick={() => setShowSubjectSelector(false)}
                className="text-white/70 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            <div className="text-accent text-sm mb-3">
              From {currentDegree} • Semester {currentSemester} • Section {currentSection}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {availableSubjects.map(subject => {
                const isSelected = isSubjectSelected(subject)
                const isFromCurrentSection = selectedSubjects.some(
                  s =>
                    s.name === subject &&
                    s.degree === currentDegree &&
                    s.semester === currentSemester &&
                    s.section === currentSection
                )
                const isFromOtherSection = isSelected && !isFromCurrentSection

                return (
                  <button
                    key={subject}
                    type="button"
                    disabled={isFromOtherSection}
                    className={`p-3 rounded-3xl  text-base border transition-all duration-200 text-left w-full
                                            ${
                                              isFromOtherSection
                                                ? 'bg-gray-500/20 text-gray-400 border-gray-500/20 cursor-not-allowed opacity-50'
                                                : isSelected
                                                  ? 'bg-accent text-white border-accent shadow-lg'
                                                  : 'bg-white/10 text-accent border-accent/5 hover:bg-accent/10'
                                            }
                                        `}
                    onClick={() => handleSubjectToggle(subject)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold mb-1">{subject}</div>
                        <div className="text-sm opacity-80">
                          {isFromOtherSection
                            ? 'Already selected from another section'
                            : 'Available subject'}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isSelected && (
                          <svg
                            className="w-5 h-5 text-white mr-2"
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
                        <BookOpen
                          className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-accent'}`}
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setShowSubjectSelector(false)}
              className="w-full mt-3 p-3 bg-accent text-white rounded-3xl font-semibold hover:bg-accent/80 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
      <Toast
        show={!!toastMsg}
        message={toastMsg}
        type="error"
        onClose={() => setToastMsg('')}
        duration={3500}
      />
    </div>
  )
}
