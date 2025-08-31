

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import StepTrack from "../components/Onboarding/StepTrack";


export default function Lagger({ onPrev, onNext }) {
    const [choice, setChoice] = useState("");
    const navigate = useNavigate();

    const handleNext = () => {
        if (choice && onNext) {
            onNext({ yesNo: choice });
        }
    };

    return (
        <div className="h-screen bg-black flex flex-col justify-between items-center px-2 pt-safe-offset-8 pb-safe-offset-6">
            <div className="w-full justify-center flex flex-col gap-6 items-center">
                <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
                <StepTrack currentStep={2} totalSteps={3} />
                <div className="text-center mb-6">
                    <h3 className="text-white font-semibold text-xl mb-2">Clash Resolution</h3>
                    <p className="text-white/70 text-sm">Have you already <span className="text-accent">resolved</span> your clashes?</p>
                </div>
            </div>
            <div className="h-full flex flex-col justify-between items-center w-full">
                <div className="flex flex-col items-center gap-4 px-2 py-4 w-full max-w-md mx-auto overflow-y-auto flex-1">
                    <div className="w-full">
                        <div className="flex flex-col gap-4 max-h-64">
                            <div>
                                <div className="font-bold text-white mb-2">Resolution Status</div>
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left w-full
                                            ${choice === "yes"
                                                ? "bg-accent text-white border-accent shadow-lg"
                                                : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10 "
                                            }
                                        `}
                                        onClick={() => setChoice("yes")}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold mb-2">Yes</div>
                                                <div className="text-sm opacity-80">I have resolved my clashes</div>
                                            </div>
                                            <div className="text-2xl">✅</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left w-full
                                            ${choice === "no"
                                                ? "bg-accent text-white border-accent shadow-lg"
                                                : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10 "
                                            }
                                        `}
                                        onClick={() => setChoice("no")}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold mb-2">No</div>
                                                <div className="text-sm opacity-80">I have not resolved my clashes</div>
                                            </div>
                                            <div className="text-2xl">❌</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-3 items-center justify-center w-full max-w-md mx-auto px-2 pb-6 pt-2 bg-gradient-to-b from-transparent to-black">
                    <button
                        className="font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10"
                        onClick={onPrev || (() => navigate("/stepone"))}
                    >
                        Back
                    </button>
                    <button
                        className={`font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md
                            ${choice ? "bg-accent text-white" : "bg-accent/40 text-white/60"}
                        `}
                        disabled={!choice}
                        onClick={handleNext}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
