import { useLocation } from "react-router-dom";
import TimeTable from "../assets/timetable.json";
import StepTrack from "./components/Onboarding/StepTrack";
import Resolved from "../pages/Onboarding/Resolved";

// Accept selection as prop, fallback to local state for backward compatibility
export default function Home() {
    const location = useLocation();
    // Try to get selection from navigation state
    const selection = location.state || null;
    if (!selection) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className=" font-playfair text-accent font-medium text-xl mb-2">No timetable data provided.</h2>
                <p className="text-gray-500">Please go back and select your degree, semester, and section.</p>
            </div>
        );
    }

    // If passtimetable is present, show it above all else
    if (selection.passtimetable) {
        const passtimetable = selection.passtimetable;
        return (
            <div className="p-4">
                <h1 className=" font-playfair text-accent font-medium text-2xl mb-4">Passed Timetable</h1>
                <div className="overflow-x-auto mb-6">
                    <table className="min-w-full bg-white text-black rounded shadow">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Day</th>
                                <th className="px-4 py-2">Start</th>
                                <th className="px-4 py-2">End</th>
                                <th className="px-4 py-2">Course</th>
                                <th className="px-4 py-2">Teacher</th>
                                <th className="px-4 py-2">Room</th>
                                {/* Add more columns if passtimetable has more fields */}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(passtimetable).map(([day, slots]) =>
                                slots.map((slot, idx) => (
                                    <tr key={day + idx}>
                                        <td className="border px-4 py-2">{idx === 0 ? day : ""}</td>
                                        <td className="border px-4 py-2">{slot.start}</td>
                                        <td className="border px-4 py-2">{slot.end}</td>
                                        <td className="border px-4 py-2">{slot.course || "-"}</td>
                                        <td className="border px-4 py-2">{slot.teacher || "-"}</td>
                                        <td className="border px-4 py-2">{slot.room || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // ...existing code...

    // fallback: old regular timetable
    const { degree, semester, section, timetable } = selection;
    return (
        <div className="p-4">
            <h1 className=" font-playfair text-accent font-medium text-2xl mb-4">
                Timetable for {degree} - Semester {semester} - Section {section}
            </h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-black rounded shadow">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Day</th>
                            <th className="px-4 py-2">Start</th>
                            <th className="px-4 py-2">End</th>
                            <th className="px-4 py-2">Course</th>
                            <th className="px-4 py-2">Teacher</th>
                            <th className="px-4 py-2">Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(timetable).map(([day, slots]) =>
                            slots.map((slot, idx) => (
                                <tr key={day + idx}>
                                    <td className="border px-4 py-2">{idx === 0 ? day : ""}</td>
                                    <td className="border px-4 py-2">{slot.start}</td>
                                    <td className="border px-4 py-2">{slot.end}</td>
                                    <td className="border px-4 py-2">{slot.course || "-"}</td>
                                    <td className="border px-4 py-2">{slot.teacher || "-"}</td>
                                    <td className="border px-4 py-2">{slot.room || "-"}</td>
                                </tr>
                            )))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
