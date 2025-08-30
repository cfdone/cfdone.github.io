
export default function Step1({ onNext, onSelectStudentType, studentType }) {
    
    return (
        <>
            <div className="h-full flex flex-col justify-between items-center w-full">
            <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-md mx-auto">
               
        
                <div className="w-full flex flex-col gap-4 items-center">
                    <p className="text-white text-center mt-2 mb-2">
                        So are you a{" "}
                        <span className="text-accent ">Regular</span> or a{" "}
                        <span className="text-accent ">Lagger</span>?
                    </p>
                    <div className="flex flex-row flex-wrap gap-1 justify-center overflow-x-auto pb-2">
                        <button
                            type="button"
                            className={`min-w-[90px] px-1.5 py-1 rounded-full font-product-sans text-[15px] border transition shadow-sm
                                ${
                                    studentType === "regular"
                                        ? "bg-accent text-white border-accent shadow-md"
                                        : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                }
                            `}
                            onClick={() => onSelectStudentType("regular")}
                        >
                            Regular
                        </button>
                        <button
                            type="button"
                            className={`min-w-[90px] px-1.5 py-1 rounded-full font-product-sans text-[15px] border transition shadow-sm
                                ${
                                    studentType === "lagger"
                                        ? "bg-accent text-white border-accent shadow-md"
                                        : "bg-white/10 text-accent border-accent/10 hover:bg-accent/10"
                                }
                            `}
                            onClick={() => onSelectStudentType("lagger")}
                        >
                            Lagger
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex flex-row gap-3 items-center justify-center w-full max-w-md mx-auto px-4 pb-6">
               
                <button
                    className={`font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md
                        ${studentType
                            ? "bg-accent text-white"
                            : "bg-accent/40 text-white/60"
                        }
                    `}
                    onClick={onNext}
                    disabled={!studentType}
                >
                    Next Up!
                </button>
            </div>
            </div>
        </>
    )
}
