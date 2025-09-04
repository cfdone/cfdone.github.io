import { useState } from 'react'
import { Book, Zap, Settings } from 'lucide-react'
import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'
import { useNavigate } from 'react-router-dom'
export default function StepOne() {
  const navigate = useNavigate()
  const [studentType, setStudentType] = useState('regular')
  const [steps, setSteps] = useState(2)
  return (
    <>
      <div className="h-screen bg-black flex flex-col justify-between items-center px-2 pt-safe-offset-8 pb-safe">
        <div className="w-full justify-center flex flex-col gap-6 items-center">
          <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
          <StepTrack currentStep={1} totalSteps={steps} />
        </div>
        <div className="h-full flex flex-col justify-between items-center w-full">
          <div className="flex flex-col items-center gap-4 px-2 py-4 w-full max-w-md mx-auto overflow-y-auto flex-1">
            <div className="w-full">
              <div className="text-center mb-6">
                <h3 className=" font-product-sans text-accent font-black text-xl mb-2">
                  Select Student Type
                </h3>
                <p className="text-white/70 text-sm font-product-sans">
                  Choose the option that best describes your situation
                </p>
              </div>

              <div className="flex flex-col gap-4 max-h-64">
                <button
                  type="button"
                  className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                    ${
                                      studentType === 'regular'
                                        ? 'bg-accent text-white border-accent shadow-lg'
                                        : 'bg-white/10 text-accent border-accent/10 hover:bg-accent/10 '
                                    }
                                `}
                  onClick={() => {
                    setStudentType('regular')
                    setSteps(2)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold mb-2">Regular Student</div>
                      <div className="text-sm opacity-80">
                        I Want To View The Complete Timetable For My Section
                      </div>
                    </div>
                    <div >
                      <Book className={`${studentType === 'regular' ? 'text-white' : 'text-accent'} w-8 h-8`}/>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                    ${
                                      studentType === 'lagger'
                                        ? 'bg-accent text-white border-accent shadow-lg'
                                        : 'bg-white/10 text-accent border-accent/10 hover:bg-accent/10 '
                                    }
                                `}
                  onClick={() => {
                    setStudentType('lagger')
                    setSteps(4)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold mb-2">Lagger Student</div>
                      <div className="text-sm opacity-80">
                        I need to resolve schedule conflicts
                      </div>
                    </div>
                    <div className="text-2xl">
                      <Zap className={`${studentType === 'lagger' ? 'text-white' : 'text-accent'} w-8 h-8`} />
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                    ${
                                      studentType === 'custom'
                                        ? 'bg-accent text-white border-accent shadow-lg'
                                        : 'bg-white/10 text-accent border-accent/10 hover:bg-accent/10 '
                                    }
                                `}
                  onClick={() => {
                    setStudentType('custom')
                    setSteps(2)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold mb-2">Custom</div>
                      <div className="text-sm opacity-80">
                        I Want To Build My Own Custom Timetable
                      </div>
                    </div>
                    <div className="text-2xl">
                      <Settings className={`${studentType === 'custom' ? 'text-white' : 'text-accent'} w-8 h-8`} />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-center justify-center w-full max-w-md mx-auto px-2 pb-6">
            <button
              className={`font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md
                            ${studentType ? 'bg-accent text-white' : 'bg-accent/40 text-white/60'}
                        `}
              disabled={!studentType}
              onClick={() => {
                if (studentType === 'regular') {
                  navigate('/regular');
                } else if (studentType === 'lagger') {
                  // Navigate to resolve with step='subject-selection' to start with subject selection UI
                  navigate('/resolve', {
                  state: {
                    step: 'subject-selection',
                    selectedSubjects: [],
                    userPreferences: null,
                  },
                });
                } else if (studentType === 'custom') {
                  navigate('/resolved');
                }
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
