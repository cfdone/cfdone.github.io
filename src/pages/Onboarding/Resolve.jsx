import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Book, MapPin } from 'lucide-react'
import TimeTable from '../../assets/timetable.json'
import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'

export default function Resolve() {
  const navigate = useNavigate()
  const location = useLocation()

  // State for selected subjects
  const [selectedSubjects, setSelectedSubjects] = useState(() => {
    return location.state?.selectedSubjects || []
  })

  // No need for resolution states in this component anymore

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
  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.name === subject.name)
      if (isSelected) {
        return prev.filter(s => s.name !== subject.name)
      } else {
        return [...prev, subject]
      }
    })
  }

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
  // We've moved the resolution logic to Preview.jsx

  // We'll remove the resolution code and focus solely on subject selection

  return (
    <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe">
      {/* Fixed Header */}
      <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
        <StepTrack currentStep={2} totalSteps={4} />
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
            onClick={() => navigate('/stepone')}
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
  )
}
