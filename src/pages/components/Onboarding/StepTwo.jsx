import logo from "../../../assets/logo.svg"

export default function Step2({ onNext, onPrev, onSelectStudentType, studentType }) {
  return (
    <>
      <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-md mx-auto">
        <img src={logo} alt="Logo" className="w-16 h-16 user-select-none mb-2" />
        <h1 className="text-white text-xl font-semibold text-center font-playfair mb-2">
          Welcome to <span className="text-accent">CFD ONE</span>
          <br />
          <span className="text-sm">
            Your timetable, but actually useful 🚀
          </span>
        </h1>
        <div className="w-full flex flex-col gap-4 items-center">
          <p className="text-white text-center mt-2 mb-2">
            So are you a{" "}
            <span className="text-accent font-bold">Regular</span> or a{" "}
            <span className="text-accent font-bold">Lagger</span>?
          </p>
          <div className="flex flex-row flex-wrap gap-1 justify-center overflow-x-auto pb-2">
            <button
              type="button"
              className={`min-w-[90px] px-2 py-1 rounded font-product-sans text-[15px] border transition shadow-sm
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
              className={`min-w-[90px] px-2 py-1 rounded font-product-sans text-[15px] border transition shadow-sm
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
          className="bg-white/10 border text-white border-accent/10 hover:bg-accent/10 font-product-sans px-4 py-3 rounded-xl w-full text-[15px] transition"
          onClick={onPrev}
        >
          Go Back
        </button>
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
    </>
  )
}
