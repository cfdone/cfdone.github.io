import { useState } from "react";
import logo from "../../../assets/logo.svg";
import TimeTable from "../../../assets/timetable.json";

export default function Regular({ onPrev, onNext }) {
    const [selectedDegree, setSelectedDegree] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    const degreeNames = Object.keys(TimeTable);
    const semesterNames = selectedDegree ? Object.keys(TimeTable[selectedDegree]) : [];
    const sectionNames = selectedDegree && selectedSemester
        ? Object.keys(TimeTable[selectedDegree][selectedSemester])
        : [];

    const handleDegree = (deg) => {
        setSelectedDegree(deg);
        setSelectedSemester("");
        setSelectedSection("");
    };

    const handleSemester = (sem) => {
        setSelectedSemester(sem);
        setSelectedSection("");
    };

    const handleSection = (sec) => {
        setSelectedSection(sec);
    };

    const handleNext = () => {
        if (selectedDegree && selectedSemester && selectedSection) {
            onNext({
                degree: selectedDegree,
                semester: selectedSemester,
                section: selectedSection,
                timetable: TimeTable[selectedDegree][selectedSemester][selectedSection]
            });
        }
    };

    return (
        <>
        <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-md mx-auto">
            <img src={logo} alt="Logo" className="w-16 h-16 user-select-none mb-2" />
            <h1 className="text-white text-lg font-semibold text-center font-playfair mb-2">
                Choose Your Degree
            </h1>
            <div className="w-full flex flex-col gap-4">
                <div className="flex flex-row flex-wrap gap-1 justify-center overflow-x-auto pb-2">
                    {degreeNames.map((deg) => (
                        <button
                            key={deg}
                            type="button"
                            className={`min-w-[60px] px-2 py-1 rounded font-product-sans text-[13px] border transition shadow-sm
                                ${selectedDegree === deg
                                    ? "bg-accent text-white border-accent shadow-md"
                                    : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                }
                            `}
                            onClick={() => handleDegree(deg)}
                        >
                            {deg}
                        </button>
                    ))}
                </div>
                {selectedDegree && (
                    <>
                        <h2 className="text-white text-base font-semibold text-center font-playfair mb-1 mt-2">
                            Choose Semester
                        </h2>
                        <div className="flex flex-row flex-wrap gap-1 justify-center overflow-x-auto pb-2">
                            {semesterNames.map((sem) => (
                                <button
                                    key={sem}
                                    type="button"
                                    className={`min-w-[45px] px-2 py-1 rounded font-product-sans text-[13px] border transition shadow-sm
                                        ${selectedSemester === sem
                                            ? "bg-accent text-white border-accent shadow-md"
                                            : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                        }
                                    `}
                                    onClick={() => handleSemester(sem)}
                                >
                                    {sem}
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {selectedSemester && (
                    <>
                        <h2 className="text-white text-base font-semibold text-center font-playfair mb-1 mt-2">
                            Choose Section
                        </h2>
                        <div className="flex flex-row flex-wrap gap-1 justify-center overflow-x-auto pb-2">
                            {sectionNames.map((sec) => (
                                <button
                                    key={sec}
                                    type="button"
                                    className={`min-w-[35px] px-2 py-1 rounded font-product-sans text-[13px] border transition shadow-sm
                                        ${selectedSection === sec
                                            ? "bg-accent text-white border-accent shadow-md"
                                            : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                        }
                                    `}
                                    onClick={() => handleSection(sec)}
                                >
                                    {sec}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
        <div className="flex flex-row gap-3 items-center justify-center w-full max-w-md mx-auto px-4 pb-6">
            <button
                className="bg-white/10 border text-white border-accent/10 hover:bg-accent/10 font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition"
                onClick={onPrev}
            >
                Go Back
            </button>
            <button
                className={`font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md
                    ${selectedDegree && selectedSemester && selectedSection
                        ? "bg-accent text-white"
                        : "bg-accent/40 text-white/60"
                    }
                `}
                disabled={!(selectedDegree && selectedSemester && selectedSection)}
                onClick={handleNext}
            >
                Next Up!
            </button>
        </div>
        </>
    );
}
