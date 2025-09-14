import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, Book, MapPin, Search } from 'lucide-react'
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

  // State for search query
  const [searchQuery, setSearchQuery] = useState('')

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
  const handleSubjectToggle = subject => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.name === subject.name)
      if (isSelected) {
        return prev.filter(s => s.name !== subject.name)
      } else {
        // Enforce maximum 10 subjects limit
        if (prev.length >= 10) {
          alert('You can select a maximum of 10 subjects')
          return prev
        }
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

  // Filter subjects based on search query
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return allAvailableSubjects
    }

    const query = searchQuery.toLowerCase().trim()

    return allAvailableSubjects.filter(subject => {
      // Check if query matches subject name
      if (subject.name.toLowerCase().includes(query)) {
        return true
      }

      // Generate abbreviation from subject name (e.g., "Object Oriented Programming" -> "OOP")
      // Ignore words like "and" when creating the abbreviation
      const words = subject.name.split(' ')
      const abbreviation = words
        .filter(word => word.length > 0 && word.toLowerCase() !== 'and')
        .map(word => word[0])
        .join('')
        .toLowerCase()

      // Check if query matches abbreviation
      if (abbreviation.includes(query)) {
        return true
      }

      return false
    })
  }, [allAvailableSubjects, searchQuery])

  // Handle search input changes
  const handleSearchChange = e => {
    setSearchQuery(e.target.value)
  }

  // We'll remove the resolution code and focus solely on subject selection

  return (
    <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe-offset-3">
      {/* Fixed Header */}
      <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
        <StepTrack currentStep={2} totalSteps={4} />
        <div className="text-center mb-4">
          <h1 className=" text-accent font-semibold text-xl mb-2">
            Select Your Subjects ({selectedSubjects.length}/10)
          </h1>
          <p className="text-white/70 text-sm ">Choose up to 10 subjects for your timetable</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-md mx-auto mb-4 px-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search subjects or abbreviations (e.g. OOP)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 pr-10 bg-white/10 border border-accent/10 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-accent/30"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Scrollable Subject List */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar min-h-0">
        <div className="flex flex-col gap-3 px-2 py-4 pb-8">
          {filteredSubjects.length === 0 ? (
            <div className="text-center p-6 text-white/70">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-accent/50" />
              <p className="text-lg font-semibold">No subjects found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            filteredSubjects.map(subject => {
              const isSelected = selectedSubjects.some(s => s.name === subject.name)

              // Generate abbreviation for highlighting if matching
              // Ignore words like "and" when creating the abbreviation
              const words = subject.name.split(' ')
              const abbreviation = words
                .filter(word => word.length > 0 && word.toLowerCase() !== 'and')
                .map(word => word[0])
                .join('')

              // Check if search matches abbreviation to show it
              const showAbbreviation =
                searchQuery &&
                abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !subject.name.toLowerCase().startsWith(searchQuery.toLowerCase())

              return (
                <button
                  key={subject.name}
                  type="button"
                  className={`p-4 rounded-xl  text-base border transition-all duration-200 text-left w-full
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
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        {subject.name}
                        {showAbbreviation && (
                          <span className="text-xs px-2 py-0.5 bg-white/20 rounded text-white/90">
                            {abbreviation}
                          </span>
                        )}
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
                        <div className="font-semibold">
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
                    <BookOpen
                      className={`w-6 h-6 ml-3 ${isSelected ? 'text-white' : 'text-accent'}`}
                    />
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-shrink-0 w-full max-w-md mx-auto px-2 pt-4 pb-6">
        <div className="flex flex-row gap-3 items-center justify-center w-full">
          <button
            className=" px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10"
            onClick={() => navigate('/stepone')}
          >
            Back
          </button>
          <button
            className={` px-4 py-3 rounded-xl w-full h-full text-[15px] transition shadow-md
                          ${
                            selectedSubjects.length > 0
                              ? 'bg-accent text-white hover:bg-accent/80'
                              : 'bg-accent/40 text-white/60 cursor-not-allowed'
                          }
                      `}
            disabled={selectedSubjects.length === 0}
            onClick={handleContinueToPreferences}
          >
            Next ({selectedSubjects.length}/10 selected)
          </button>
        </div>
      </div>
    </div>
  )
}
