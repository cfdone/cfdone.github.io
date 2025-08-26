import { useState } from "react";
import logo from "../assets/logo.svg";
export default function Splash() {
    const [step, setStep] = useState(1);
    const [studentType, setStudentType] = useState("");

    function Step1({ onNext }) {
        return (
            <>
                <h1 className="text-white text-xl font-semibold text-center font-playfair">
                    FAST timetable <span className="text-accent">sucks?</span>
                    <br />
                    <span className="text-sm font-light font-product-sans">Yeah, we feel your pain 😅</span>
                </h1>
                <img src={logo} alt="Logo" className="w-50 h-50 user-select-none" />
                <button
                    className="bg-accent font-product-sans text-white px-4 py-2 rounded-full w-[300px] text-[14px] p-2"
                    onClick={onNext}
                >
                    Let's Fix This!
                </button>
            </>
        );
    }

    function Step2({ onNext, onPrev }) {
        return (
            <>
            <div className="gap-[12px] justify-center flex flex-col items-center">
                <img src={logo} alt="Logo" className="w-20 h-20 user-select-none" />
                <h1 className="text-white text-xl font-semibold text-center font-playfair">
                    Welcome to <span className="text-accent">CFDBLAZE</span>
                    <br />
                    <span className="text-sm">Your timetable, but actually useful 🚀</span>
                </h1>
                 <div className="gap-[12px] flex flex-col items-center">
            <p className="text-white text-center mt-2 mb-2">
                So, are you a <span className="text-accent font-bold">Regular</span> or a <span className="text-accent font-bold">Lagger</span>? <br />
            </p>
                <div className="flex justify-center gap-4 mb-4">
                    <button
                        type="button"
                        className={`px-6 py-2 rounded-full font-product-sans text-[15px] border transition
                            ${studentType === "regular"
                                ? "bg-accent text-white border-accent shadow-lg"
                                : "bg-transparent text-accent border-accent/40 hover:bg-accent/10"}
                        `}
                        onClick={() => setStudentType("regular")}
                    >
                        Regular
                    </button>
                    <button
                        type="button"
                        className={`px-6 py-2 rounded-full font-product-sans text-[15px] border transition
                            ${studentType === "lagger"
                                ? "bg-accent text-white border-accent shadow-lg"
                                : "bg-transparent text-accent border-accent/40 hover:bg-accent/10"}
                        `}
                        onClick={() => setStudentType("lagger")}
                    >
                        Lagger
                    </button>
                    </div>
                </div>
            </div>
           
                <div className="flex items-center justify-center gap-[12px] w-full">
                    <button
                        className="bg-accent/5 border border-accent/20 font-product-sans text-white px-4 py-2 rounded-full w-[150px] text-[14px] p-2"
                        onClick={onPrev}
                    >
                        Go Back
                    </button>
                    <button
                        className="bg-accent font-product-sans text-white px-4 py-2 rounded-full w-[150px] text-[14px] p-2"
                        onClick={onNext}
                        disabled={!studentType}
                    >
                        Next Up!
                    </button>
                </div>
            </>
        );
    }

    function Step3({ onFinish, onPrev }) {
        return (
            <>
                <h1 className="text-white text-xl font-semibold text-center font-playfair">
                    All set! <span className="text-accent">Ready to roll?</span>
                    <br />
                    <span className="text-sm">Hit finish and let's make your semester legendary! 🎉</span>
                </h1>
                <img src={logo} alt="Logo" className="w-50 h-50 user-select-none" />
                <div className="flex justify-between w-full">
                    <button
                        className="bg-accent font-product-sans text-white px-4 py-2 rounded-full w-[300px] text-[14px] p-2"
                        onClick={onPrev}
                    >
                        Back
                    </button>
                    <button
                        className="bg-accent font-product-sans text-white px-4 py-2 rounded-full w-[300px] text-[14px] p-2"
                        onClick={onFinish}
                    >
                        Blaze On! 🚀
                    </button>
                </div>
            </>
        );
    }

    return (
        <div className="h-dvh bg-black flex flex-col justify-between items-center px-4 pt-safe-offset-8 pb-safe-offset-8">
            {step === 1 && <Step1 onNext={() => setStep(2)} />}
            {step === 2 && (
                <Step2
                    onNext={() => setStep(3)}
                    onPrev={() => setStep(1)}
                />
            )}
            {step === 3 && (
                <Step3
                    onFinish={() => {
                        /* handle finish, e.g. navigate away */
                    }}
                    onPrev={() => setStep(2)}
                />
            )}
        </div>
    );
}
