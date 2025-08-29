import logo from "../../../assets/logo.svg";
export default function Step1({ onNext }) {
        return (
            <>
                <h1 className="text-white text-xl font-semibold text-center font-playfair">
                    FAST timetable <span className="text-accent">sucks?</span>
                    <br />
                    <span className="text-sm font-light font-product-sans">Yeah, we feel your pain 😅</span>
                </h1>
                <img src={logo} alt="Logo" className="w-50 h-50 user-select-none" />
                <button
                    className="bg-accent font-product-sans text-white px-4 py-2 rounded-full w-[300px] text-[14px] p-2"
                    onClick={onNext}
                >
                    Let's Fix This!
                </button>
            </>
        );
    }
