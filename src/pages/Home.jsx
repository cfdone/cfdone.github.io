
import { useState, useEffect } from "react";
import Regular from "../pages/Onboarding/Regular";
import Resolved from "../pages/Onboarding/Resolved";

// Accept selection as prop, fallback to local state for backward compatibility
export default function Home({ selection: selectionProp }) {
    const [selection, setSelection] = useState(selectionProp || null);

    // Sync local state with prop if it changes
    useEffect(() => {
        if (selectionProp !== undefined && selectionProp !== selection) {
            setSelection(selectionProp);
        }
    }, [selectionProp, selection]);

    if (!selection) {
        // After clash resolution, use Resolved for personalized timetable
        return (
            <Resolved
                onPrev={() => {}}
                onNext={setSelection}
            />
        );
    }

    // Support both old and new selection structures
    const isPersonalized = selection.subjects && selection.timetable;
    const isCustomTimetable = selection.isCustom;

    if (isPersonalized) {
        const { subjects, timetable } = selection;
        
        if (isCustomTimetable) {
            // Custom timetable from Resolved.jsx with subjects from multiple degrees/sections
            return (
                <div className="p-3">
                    <h1 className="text-xl font-bold mb-3">
                        Custom Timetable
                    </h1>
                    <div className="mb-3">
                        <div className="font-semibold mb-2 text-sm">Selected Subjects:</div>
                        {/* Group subjects by degree */}
                        {(() => {
                            const subjectsByDegree = subjects.reduce((acc, subject) => {
                                const key = `${subject.degree} - Semester ${subject.semester}`;
                                if (!acc[key]) {
                                    acc[key] = [];
                                }
                                acc[key].push(subject);
                                return acc;
                            }, {});
                            
                            return Object.entries(subjectsByDegree).map(([degreeKey, degreeSubjects]) => (
                                <div key={degreeKey} className="mb-2 p-2 bg-gray-100 rounded-lg">
                                    <h3 className="font-bold text-gray-800 mb-1 text-sm">{degreeKey}</h3>
                                    <ul className="list-disc list-inside text-xs">
                                        {degreeSubjects.map((subject, idx) => (
                                            <li key={idx} className="text-gray-700">
                                                {subject.name} (Section {subject.section})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ));
                        })()}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-black rounded shadow text-xs">
                            <thead>
                                <tr>
                                    <th className="px-2 py-1">Day</th>
                                    <th className="px-2 py-1">Start</th>
                                    <th className="px-2 py-1">End</th>
                                    <th className="px-2 py-1">Course</th>
                                    <th className="px-2 py-1">Teacher</th>
                                    <th className="px-2 py-1">Room</th>
                                    <th className="px-2 py-1">Degree</th>
                                    <th className="px-2 py-1">Section</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(timetable).map(([day, slots]) =>
                                    slots.map((slot, idx) => (
                                        <tr key={day + idx}>
                                            <td className="border px-2 py-1">{idx === 0 ? day : ""}</td>
                                            <td className="border px-2 py-1">{slot.start}</td>
                                            <td className="border px-2 py-1">{slot.end}</td>
                                            <td className="border px-2 py-1">{slot.course}</td>
                                            <td className="border px-2 py-1">{slot.teacher}</td>
                                            <td className="border px-2 py-1">{slot.room}</td>
                                            <td className="border px-2 py-1">{slot.degree}</td>
                                            <td className="border px-2 py-1">{slot.section}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else {
            // Old personalized format (if any)
            return (
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-4">
                        Personalized Timetable for {degree} - Semester {semester}
                    </h1>
                    <div className="mb-4">
                        <div className="font-semibold mb-1">Subjects &amp; Sections:</div>
                        <ul>
                            {Object.entries(subjects).map(([subject, section]) => (
                                <li key={subject}>{subject} (Section {section})</li>
                            ))}
                        </ul>
                    </div>
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
                                    <th className="px-4 py-2">Section</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(timetable).map(([day, slots]) =>
                                    slots.map((slot, idx) => (
                                        <tr key={day + idx}>
                                            <td className="border px-4 py-2">{idx === 0 ? day : ""}</td>
                                            <td className="border px-4 py-2">{slot.start}</td>
                                            <td className="border px-4 py-2">{slot.end}</td>
                                            <td className="border px-4 py-2">{slot.course}</td>
                                            <td className="border px-4 py-2">{slot.teacher}</td>
                                            <td className="border px-4 py-2">{slot.room}</td>
                                            <td className="border px-4 py-2">{slot.section}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    }

    // fallback: old regular timetable
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
