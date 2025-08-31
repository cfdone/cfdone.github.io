export default function Resolve({ onPrev, onNext }) {
    return (
        <>
            <div className="h-full flex flex-col justify-between items-center w-full">
                <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-md mx-auto">
                    
                    <div className="text-center">
                        <p className="text-white text-center mt-2 mb-2 font-product-sans">
                            <span className="text-accent">Lagger Student</span> - No Clash Resolution
                        </p>
                        <p className="text-white/70 text-sm font-product-sans">
                            You have chosen not to resolve timetable clashes.
                        </p>
                    </div>
                    
                    <div className="w-full flex flex-col gap-4 items-center">
                        <div className="bg-white/10 rounded-xl p-4 w-full max-w-md border border-accent/20">
                            <div className="text-center">
                                <p className="text-white font-product-sans text-sm">
                                    You will be shown the regular timetable for your selected degree, semester, and section.
                                </p>
                            </div>
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
                        className="bg-accent text-white font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md"
                        onClick={onNext}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </>
    );
}
