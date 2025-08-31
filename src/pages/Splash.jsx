
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Splash() {
	const navigate = useNavigate();
	return (
		<>
         <div className="h-screen bg-black  flex flex-col justify-between items-center px-4 pt-safe-offset-8 pb-safe-offset-6">
			<div className=" flex flex-col items-center gap-6 px-4 py-6 w-full max-w-md mx-auto">
				<h1 className="text-white text-2xl font-semibold text-center font-playfair mb-2">
					FAST timetable <span className="text-accent">sucks?</span>
					<br />
					<span className="text-sm font-light font-product-sans">Yeah, we feel your pain 😅</span>
				</h1>
			</div>
			<img src={logo} alt="Logo" className="w-54 h-54 user-select-none mb-2" />
			<div className="flex flex-col gap-3 items-center justify-center w-full max-w-md mx-auto px-2 pb-6">
				<p className="text-white font-playfair">Let’s fix this mess in 2 minutes flat!</p>
				<button
					className="bg-accent font-product-sans text-white px-4 py-3 rounded-xl w-full text-[15px] transition shadow-md"
					onClick={() => navigate("/stepone")}
				>
					Let's Fix This!
				</button>
			</div>
            </div>
		</>
	);
}
