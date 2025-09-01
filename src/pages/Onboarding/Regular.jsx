import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TimeTable from "../../assets/timetable.json";
import logo from "../../assets/logo.svg";
import StepTrack from "../components/Onboarding/StepTrack";

export default function Regular() {
    const navigate = useNavigate();
    const [selectedDegree, setSelectedDegree] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    // Get all available degrees, semesters, and sections
    const degreeNames = Object.keys(TimeTable);
    const semesterNames = selectedDegree ? Object.keys(TimeTable[selectedDegree]) : [];
    const sectionNames = selectedDegree && selectedSemester
        ? Object.keys(TimeTable[selectedDegree][selectedSemester])
        : [];

    // Get timetable for selected section
    const timetable = useMemo(() => {
        if (!selectedDegree || !selectedSemester || !selectedSection) return {};
        return TimeTable[selectedDegree][selectedSemester][selectedSection];
    }, [selectedDegree, selectedSemester, selectedSection]);

    const handleNext = () => {
        if (selectedDegree && selectedSemester && selectedSection) {
            navigate("/home", {
                state: {
                    degree: selectedDegree,
                    semester: selectedSemester,
                    section: selectedSection,
                    timetable: timetable
                }
            });
        }
    };

    return (
        <>
        <div className="h-screen bg-black flex flex-col justify-between items-center px-2 pt-safe-offset-8 pb-safe-offset-6">
            <div className="w-full justify-center flex flex-col gap-6 items-center">
                <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
                <StepTrack currentStep={2} totalSteps={2} />
                <div className="text-center mb-6">
                            <h3 className=" font-playfair text-accent font-medium text-xl mb-2">Select Degree, Semester & Section</h3>
                            <p className="text-white/70 text-sm">Choose your degree, semester, and section to view your timetable</p>
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
                                    {degreeNames.map((deg) => (
                                        <button
                                            key={deg}
                                            type="button"
                                            className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                                ${selectedDegree === deg
                                                    ? "bg-accent text-white border-accent shadow-lg"
                                                    : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10 "
                                                }
                                            `}
                                            onClick={() => { setSelectedDegree(deg); setSelectedSemester(""); setSelectedSection(""); }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-bold mb-2">{deg}</div>
                                                    <div className="text-sm opacity-80">Degree</div>
                                                </div>
                                                <div className="text-2xl">🎓</div>
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
                                        {semesterNames.map((sem) => (
                                            <button
                                                key={sem}
                                                type="button"
                                                className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                                    ${selectedSemester === sem
                                                        ? "bg-accent text-white border-accent shadow-lg"
                                                        : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10 "
                                                    }
                                                `}
                                                onClick={() => { setSelectedSemester(sem); setSelectedSection(""); }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold mb-2">{sem}</div>
                                                        <div className="text-sm opacity-80">Semester</div>
                                                    </div>
                                                    <div className="text-2xl">📅</div>
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
                                        {sectionNames.map((sec) => (
                                            <button
                                                key={sec}
                                                type="button"
                                                className={`p-4 rounded-xl font-product-sans text-lg border transition-all duration-200 text-left
                                                    ${selectedSection === sec
                                                        ? "bg-accent text-white border-accent shadow-lg"
                                                        : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10 "
                                                    }
                                                `}
                                                onClick={() => setSelectedSection(sec)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold mb-2">{sec}</div>
                                                        <div className="text-sm opacity-80">Section</div>
                                                    </div>
                                                    <div className="text-2xl">🏷️</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                

                <div className="flex flex-row gap-3 items-center justify-center w-full max-w-md mx-auto px-2 pb-6 pt-2 bg-gradient-to-b from-transparent to-black">
                    <button
                        className="font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/10 hover:bg-accent/10"
                        onClick={() => navigate("/stepone")}
                    >
                        Back
                    </button>
                    <button
                        className={`font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md
                            ${selectedDegree && selectedSemester && selectedSection ? "bg-accent text-white" : "bg-accent/40 text-white/60"}
                        `}
                        disabled={!(selectedDegree && selectedSemester && selectedSection)}
                        onClick={handleNext}
                    >
                        Create Timetable
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}
