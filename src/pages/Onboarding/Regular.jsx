import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, GraduationCap, Calendar } from 'lucide-react'
import TimeTable from '../../assets/timetable.json'
import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'

export default function Regular() {
  const navigate = useNavigate()
  const [selectedDegree, setSelectedDegree] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Get all available degrees, semesters, and sections
  const degreeNames = Object.keys(TimeTable)
  const semesterNames = selectedDegree ? Object.keys(TimeTable[selectedDegree]) : []
  const sectionNames =
    selectedDegree && selectedSemester
      ? Object.keys(TimeTable[selectedDegree][selectedSemester])
      : []

  // Get timetable for selected section
  const timetable = useMemo(() => {
    if (!selectedDegree || !selectedSemester || !selectedSection) return {}
    return TimeTable[selectedDegree][selectedSemester][selectedSection]
  }, [selectedDegree, selectedSemester, selectedSection])

  const handleNext = async () => {
    if (selectedDegree && selectedSemester && selectedSection) {
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

      // Complete and navigate
      const timetableData = {
        degree: selectedDegree,
        semester: selectedSemester,
        section: selectedSection,
        timetable: timetable,
        studentType: 'regular',
      }

      try {
        // Save to localStorage
        localStorage.setItem('onboardingComplete', 'true')
        localStorage.setItem('timetableData', JSON.stringify(timetableData))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }

      navigate('/', {
        state: timetableData,
      })
    }
  }

  return (
    <>
      <div className="h-screen bg-black flex flex-col justify-between items-center px-2 pt-safe-offset-8 pb-safe">
        <div className="w-full justify-center flex flex-col gap-6 items-center">
          <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
          <StepTrack currentStep={2} totalSteps={2} />
          <div className="text-center mb-6">
            <h3 className=" font-product-sans text-accent font-black text-xl mb-2">
              Select Degree, Semester & Section
            </h3>
            <p className="text-white/70 text-sm font-product-sans">
              Choose your degree, semester, and section to view your timetable
            </p>
          </div>
        </div>
        <div className="h-full flex flex-col justify-between items-center w-full">
          <div className="flex flex-col items-center gap-4 px-2 py-4 w-full max-w-md mx-auto overflow-y-auto no-scrollbar flex-1">
            <div className="w-full">
              <div className="flex flex-col gap-4 max-h-64">
                {/* Degree Selection */}
                <div>
                  <div className="font-bold text-white mb-2">Degree</div>
                  <div className="flex flex-col gap-3">
                    {degreeNames.map(deg => (
                      <button
                        key={deg}
                        type="button"
                        className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                                ${
                                                  selectedDegree === deg
                                                    ? 'bg-accent text-white border-accent shadow-lg'
                                                    : 'bg-white/10 text-accent border-accent/10 hover:bg-accent/10 '
                                                }
                                            `}
                        onClick={() => {
                          setSelectedDegree(deg)
                          setSelectedSemester('')
                          setSelectedSection('')
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold mb-2">{deg}</div>
                            <div className="text-sm opacity-80">Degree</div>
                          </div>
                          <div className="text-2xl">
                            <GraduationCap className={`w-8 h-8 ${selectedDegree === deg ? 'text-white' : 'text-accent'}`} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Semester Selection */}
                {selectedDegree && (
                  <div>
                    <div className="font-bold text-white mb-2">Semester</div>
                    <div className="flex flex-col gap-3">
                      {semesterNames.map(sem => (
                        <button
                          key={sem}
                          type="button"
                          className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                                    ${
                                                      selectedSemester === sem
                                                        ? 'bg-accent text-white border-accent shadow-lg'
                                                        : 'bg-white/10 text-accent border-accent/10 hover:bg-accent/10 '
                                                    }
                                                `}
                          onClick={() => {
                            setSelectedSemester(sem)
                            setSelectedSection('')
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold mb-2">{sem}</div>
                              <div className="text-sm opacity-80">Semester</div>
                            </div>
                            <div className="text-2xl">
                              <Calendar className={`w-8 h-8 ${selectedSemester === sem ? 'text-white' : 'text-accent'}`} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Section Selection */}
                {selectedSemester && (
                  <div>
                    <div className="font-bold text-white mb-2">Section</div>
                    <div className="flex flex-col gap-3">
                      {sectionNames.map(sec => (
                        <button
                          key={sec}
                          type="button"
                          className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                                    ${
                                                      selectedSection === sec
                                                        ? 'bg-accent text-white border-accent shadow-lg'
                                                        : 'bg-white/10 text-accent border-accent/10 hover:bg-accent/10 '
                                                    }
                                                `}
                          onClick={() => setSelectedSection(sec)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold mb-2">{sec}</div>
                              <div className="text-sm opacity-80">Section</div>
                            </div>
                            <Tag className={`w-6 h-6 ${selectedSection === sec ? 'text-white' : 'text-accent'}`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-stretch justify-center w-full max-w-md mx-auto px-2 pb-6 pt-2 bg-gradient-to-b from-transparent to-black h-20">
            <button
              className="font-product-sans px-4 rounded-xl w-full h-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10 flex items-center justify-center"
              onClick={() => navigate('/stepone')}
            >
              Back
            </button>
            <button
              className={`font-product-sans px-4 rounded-xl w-full h-full text-[15px] transition shadow-md flex items-center justify-center
                            ${selectedDegree && selectedSemester && selectedSection ? 'bg-accent text-white' : 'bg-accent/40 text-white/60'}
                        `}
              disabled={!(selectedDegree && selectedSemester && selectedSection) || isCreating}
              onClick={handleNext}
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
    </>
  )
}
