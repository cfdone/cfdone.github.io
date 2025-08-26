import logo from "../assets/logo.svg";
export default function Splash() {
    return (
        <div className="bg-black flex py-8 flex-col justify-between items-center h-lvh overflow-hidden">
            <h1 className="text-white text-xl font-semibold text-center font-playfair">
                FAST timetable <span className="text-accent">sucks?</span> 
                <br />
               <span className="text-sm">Yeah, we know!</span>
            </h1>
            <img src={logo} alt="Logo" className="w-50 h-50 user-select-none" />

                <button className="bg-accent font-gilroy text-white px-4 py-2 rounded-full w-[300px] p-2">
                    Get Started
                </button>
            
        </div>
    );
}
