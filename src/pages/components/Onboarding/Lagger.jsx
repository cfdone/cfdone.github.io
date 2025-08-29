import { useState } from "react";
import logo from "../../../assets/logo.svg";
import TimeTable from "../../../assets/timetable.json";

export default function Lagger({ onPrev }) {
    const [selectedDegree, setSelectedDegree] = useState("");

    const degreeNames = Object.keys(TimeTable);

    return (
         <>
        <div className="gap-[12px] justify-center flex flex-col items-center">
             <img src={logo} alt="Logo" className="w-20 h-20 user-select-none" />
                    
            <div className="flex flex-col items-center">
                <h1 className="text-white text-xl font-semibold text-center font-playfair">
                    Choose Your Degree
                </h1>
               
            </div>
            <div className="gap-[12px] flex flex-col items-center">
                <p className="text-white text-center mt-2 mb-2">
                    Select Your Degree
                </p>
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
                            onClick={() => setSelectedDegree(deg)}
                        >
                            {deg}
                        </button>
                    ))}
                </div>
            </div></div>

            <div className="flex items-center justify-center gap-[12px] w-full">
                <button
                    className="bg-transparent border text-white border-accent/20 hover:bg-accent/10 font-product-sans  px-4 py-2 rounded-full w-[150px] text-[14px] p-2"
                    onClick={onPrev}
                >
                    Go Back
                </button>
                <button
                    className="bg-accent font-product-sans text-white px-4 py-2 rounded-full w-[150px] text-[14px] p-2"
                    disabled={!selectedDegree}
                >
                    Next Up!
                </button>
            </div>
       </>
    );
}
