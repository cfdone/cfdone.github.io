import { useState } from "react";
import Step1 from "./components/Onboarding/StepOne";
import Regular from "./components/Onboarding/Regular";
import Lagger from "./components/Onboarding/Lagger";
import Home from "./Home"; // import Home
import StepTrack from "./components/Onboarding/StepTrack"; // import StepTrack
import logo from "../assets/logo.svg"


export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [studentType, setStudentType] = useState("");
    const [selection, setSelection] = useState(null); // add selection state

    // If selection is made, show Home with selection
    if (selection) {
        return <Home selection={selection} />;
    }

    return (
        <div className="h-screen bg-black flex flex-col justify-between items-center px-4 pt-safe-offset-8 pb-safe-offset-8">
            <div className="w-full  justify-center  flex flex-col gap-6 items-center">
             <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
                <StepTrack currentStep={step} totalSteps={2} />
            </div>

            {step === 1 && (
                <Step1
                    onNext={() => setStep(2)}
                    onSelectStudentType={setStudentType}
                    studentType={studentType}
                />
            )}

            {step === 2 && studentType === "regular" && (
                <Regular
                    onPrev={() => setStep(1)}
                    onNext={setSelection}
                />
            )}

            {step === 2 && studentType === "lagger" && (
                <Lagger onPrev={() => setStep(1)} />
            )}
        </div>
    );
}
