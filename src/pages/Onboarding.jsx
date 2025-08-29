import { useState } from "react";
import Step1 from "./components/Onboarding/StepOne";
import Step2 from "./components/Onboarding/StepTwo";
import Regular from "./components/Onboarding/Regular";
import Lagger from "./components/Onboarding/Lagger";
import Home from "./Home"; // import Home


export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [studentType, setStudentType] = useState("");
    const [selection, setSelection] = useState(null); // add selection state

    // If selection is made, show Home with selection
    if (selection) {
        return <Home selection={selection} />;
    }

    return (
        <div className="h-dvh bg-black flex flex-col justify-between items-center px-4 pt-safe-offset-8 pb-safe-offset-8">
            {step === 1 && <Step1 onNext={() => setStep(2)} />}

            {step === 2 && (
                <Step2
                    onNext={() => setStep(3)}
                    onPrev={() => setStep(1)}
                    onSelectStudentType={setStudentType}
                    studentType={studentType}
                />
            )}

            {step === 3 && studentType === "regular" && (
                <Regular
                    onPrev={() => setStep(2)}
                    onNext={setSelection} // pass setSelection to Regular
                />
            )}

            {step === 3 && studentType === "lagger" && (
                <Lagger onPrev={() => setStep(2)} />
            )}
        </div>
    );
}
