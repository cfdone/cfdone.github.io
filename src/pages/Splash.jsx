import animation from "../assets/animation.json";
import Lottie from "lottie-react";
export default function Splash() {
    return (
        <div className="bg-black flex justify-center items-center h-screen">
            <Lottie animationData={animation} loop={false} speed={0.01} className="w-1/2 h-1/2" />
        </div>
    );
}
