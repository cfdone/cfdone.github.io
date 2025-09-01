import { useState } from "react";
import logo from "../../assets/logo.svg";
import StepTrack from "../components/Onboarding/StepTrack";
import { useNavigate } from "react-router-dom";
export default function StepOne() {
    const navigate = useNavigate();
    const [studentType, setStudentType] = useState("regular");
    const [steps, setSteps] = useState(2);
    return (
        <>
        <div className="h-screen bg-black flex flex-col justify-between items-center px-2 pt-safe-offset-8 pb-safe-offset-6">
                    <div className="w-full justify-center flex flex-col gap-6 items-center">
                        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
                        <StepTrack currentStep={1} totalSteps={steps} />
                    </div>
            <div className="h-full flex flex-col justify-between items-center w-full">
                <div className="flex flex-col items-center gap-4 px-2 py-4 w-full max-w-md mx-auto overflow-y-auto flex-1">
                    <div className="w-full">
                        <div className="text-center mb-6">
                            <h3 className=" font-playfair text-accent font-medium text-xl mb-2">Select Student Type</h3>
                            <p className="text-white/70 text-sm">Choose the option that best describes your situation</p>
                        </div>
                        
                        <div className="flex flex-col gap-4 max-h-64">
                            <button
                                type="button"
                                className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                    ${studentType === "regular"
                                        ? "bg-accent text-white border-accent shadow-lg"
                                        : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10 "
                                    }
                                `}
                                onClick={() => {setStudentType("regular"); setSteps(2);} }
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold mb-2">Regular Student</div>
                                        <div className="text-sm opacity-80">
                                            I want to view the complete timetable for my degree, semester, and section
                                        </div>
                                    </div>
                                    <div className="text-2xl">📚</div>
                                </div>
                            </button>

                            <button
                                type="button"
                                className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                    ${studentType === "lagger"
                                        ? "bg-accent text-white border-accent shadow-lg"
                                        : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10 "
                                    }
                                `}
                                onClick={() => {setStudentType("lagger"); setSteps(3);}}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold mb-2">Lagger Student</div>
                                        <div className="text-sm opacity-80">
                                            I need to resolve schedule conflicts and create a custom timetable
                                        </div>
                                    </div>
                                    <div className="text-2xl">⚡</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>


                <div className="flex flex-row gap-3 items-center justify-center w-full max-w-md mx-auto px-2 pb-6">
                   
                    <button
                        className={`font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md
                            ${studentType
                                ? "bg-accent text-white"
                                : "bg-accent/40 text-white/60"
                            }
                        `}
                        disabled={!studentType}
                        onClick={studentType === "regular" ? () => navigate("/regular") : () => navigate("/lagger")}
                    >
                        Continue
                    </button>
                </div>
            </div>
            </div>
        </>
    );
}
