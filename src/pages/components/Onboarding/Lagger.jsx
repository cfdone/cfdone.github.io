import { useState } from "react";
import logo from "../../../assets/logo.svg";
import TimeTable from "../../../assets/timetable.json";

export default function Lagger({ onPrev }) {
    const [selectedDegree, setSelectedDegree] = useState("");

    const degreeNames = Object.keys(TimeTable);

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
                            onClick={() => setSelectedDegree(deg)}
                        >
                            {deg}
                        </button>
                    ))}
                </div>
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
                    ${selectedDegree
                        ? "bg-accent text-white"
                        : "bg-accent/40 text-white/60"
                    }
                `}
                disabled={!selectedDegree}
            >
                Next Up!
            </button>
        </div>
        </>
    );
}
