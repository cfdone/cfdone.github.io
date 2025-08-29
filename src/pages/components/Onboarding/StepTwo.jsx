import logo from "../../../assets/logo.svg"

export default function Step2({ onNext, onPrev, onSelectStudentType, studentType }) {
  return (
    <>
      <div className="gap-[12px] justify-center flex flex-col items-center">
        <img src={logo} alt="Logo" className="w-20 h-20 user-select-none" />
        <h1 className="text-white text-xl font-semibold text-center font-playfair">
          Welcome to <span className="text-accent">CFD ONE</span>
          <br />
          <span className="text-sm">
            Your timetable, but actually useful 🚀
          </span>
        </h1>
        <div className="gap-[12px] flex flex-col items-center">
          <p className="text-white text-center mt-2 mb-2">
            So are you a{" "}
            <span className="text-accent font-bold">Regular</span> or a{" "}
            <span className="text-accent font-bold">Lagger</span>?
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <button
              type="button"
              className={`px-6 py-2 rounded-full font-product-sans text-[15px] border transition
                ${
                  studentType === "regular"
                    ? "bg-accent text-white border-accent shadow-lg"
                    : "bg-transparent text-accent border-accent/20 hover:bg-accent/10"
                }
              `}
              onClick={() => onSelectStudentType("regular")}
            >
              Regular
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-full font-product-sans text-[15px] border transition
                ${
                  studentType === "lagger"
                    ? "bg-accent text-white border-accent shadow-lg"
                    : "bg-transparent text-accent border-accent/20 hover:bg-accent/10"
                }
              `}
              onClick={() => onSelectStudentType("lagger")}
            >
              Lagger
            </button>
          </div>
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
          onClick={onNext}
          disabled={!studentType}
        >
          Next Up!
        </button>
      </div>
    </>
  )
}
