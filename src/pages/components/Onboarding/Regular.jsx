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
        <div className="gap-[12px] justify-center flex flex-col items-center">
            <img src={logo} alt="Logo" className="w-20 h-20 user-select-none" />
            <h1 className="text-white text-xl font-semibold text-center font-playfair">
                Choose Your Degree
            </h1>
            <div className="gap-[12px] flex flex-col items-center">
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                    {degreeNames.map((deg) => (
                        <button
                            key={deg}
                            type="button"
                            className={`px-6 py-2 rounded-full font-product-sans text-[15px] border transition
                                ${selectedDegree === deg
                                    ? "bg-accent text-white border-accent shadow-lg"
                                    : "bg-transparent text-accent border-accent/20 hover:bg-accent/10"
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
                        <h2 className="text-white text-lg font-semibold text-center font-playfair">
                            Choose Semester
                        </h2>
                        <div className="flex flex-wrap justify-center gap-4 mb-4">
                            {semesterNames.map((sem) => (
                                <button
                                    key={sem}
                                    type="button"
                                    className={`px-6 py-2 rounded-full font-product-sans text-[15px] border transition
                                        ${selectedSemester === sem
                                            ? "bg-accent text-white border-accent shadow-lg"
                                            : "bg-transparent text-accent border-accent/20 hover:bg-accent/10"
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
                        <h2 className="text-white text-lg font-semibold text-center font-playfair">
                            Choose Section
                        </h2>
                        <div className="flex flex-wrap justify-center gap-4 mb-4">
                            {sectionNames.map((sec) => (
                                <button
                                    key={sec}
                                    type="button"
                                    className={`px-6 py-2 rounded-full font-product-sans text-[15px] border transition
                                        ${selectedSection === sec
                                            ? "bg-accent text-white border-accent shadow-lg"
                                            : "bg-transparent text-accent border-accent/20 hover:bg-accent/10"
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
        <div className="flex items-center justify-center gap-[12px] w-full">
            <button
                className="bg-transparent border text-white border-accent/20 hover:bg-accent/10 font-product-sans  px-4 py-2 rounded-full w-[150px] text-[14px] p-2"
                onClick={onPrev}
            >
                Go Back
            </button>
            <button
                className="bg-accent font-product-sans text-white px-4 py-2 rounded-full w-[150px] text-[14px] p-2"
                disabled={!(selectedDegree && selectedSemester && selectedSection)}
                onClick={handleNext}
            >
                Next Up!
            </button>
        </div>
        </>
    );
}
