import { useState, useEffect } from "react";
import Regular from "./components/Onboarding/Regular";

// Accept selection as prop, fallback to local state for backward compatibility
export default function Home({ selection: selectionProp }) {
    const [selection, setSelection] = useState(selectionProp || null);

    // Sync local state with prop if it changes
    useEffect(() => {
        if (selectionProp !== undefined && selectionProp !== selection) {
            setSelection(selectionProp);
        }
    }, [selectionProp]);

    if (!selection) {
        return (
            <Regular
                onPrev={() => {/* handle prev if needed */}}
                onNext={setSelection}
            />
        );
    }

    // Show timetable for selected degree/semester/section
    const { degree, semester, section, timetable } = selection;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">
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
