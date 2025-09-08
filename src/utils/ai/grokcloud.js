// Groq Cloud API utility for timetable clash verification
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

export async function verifyTimetableWithGroqCloud({
  timetable,
  conflictSubjects,
  resolutionSuggestions,
  selectedSubjects,
}) {
  // Remove room info from timetable before sending to Groq
  const timetableNoRoom = {};
  Object.entries(timetable).forEach(([day, slots]) => {
    timetableNoRoom[day] = slots.map(slot => {
      const { ...rest } = slot;
      return rest;
    });
  });

  const prompt = `You are an expert in university timetables. Your job is to verify if the provided timetable has any time clashes between subjects for the same student.\n\nRules:\n- Only check for clashes between classes that a single student would attend, based on their selected section, degree, and semester.\n- Ignore any classes from other sections, degrees, or semesters that the student is not enrolled in.\n- Only consider time overlaps for the same student.\n- If a class ends and the next class starts at the exact same time, this is NOT a clash.\n- If a class ends at 12:15 and the next class starts at 12:15, this is NOT a clash.\n- If a class ends at 12:15 and the next class starts at 12:10, this IS a clash.\n- If a class ends at 1:45 and the next class starts at 1:45, this is NOT a clash.\n- If a class ends at 1:45 and the next class starts at 1:44, this IS a clash.\n\nExamples:\n- Class A: 10:00 - 11:00, Class B: 11:00 - 12:00 → No clash.\n- Class A: 10:00 - 11:00, Class B: 10:50 - 12:00 → Clash.\n- Applied Physics: 10:45 - 12:15, Computer Organization and Assembly Language: 12:15 - 1:45 → No clash.\n- Civics and Community Engagement: 12:45 - 1:45, Computer Networks-Lab: 1:45 - 4:40 → No clash.\n\nOutput:\n- Reply concisely and to the point, with minimal clutter.\n- If there are no clashes, say: 'No clashes detected. Your timetable is perfect.'\n- If there are clashes, say: 'Clashes detected', followed by a list of conflicting subjects and their time slots.\n- Do not use any HTML, JSON, code, or icons.\n\nTimetable details:\n${JSON.stringify(timetableNoRoom, null, 2)}\n\nSubjects:\n${selectedSubjects.map(s => s.name).join(", ")}\n\nKnown conflicts: ${conflictSubjects.join(", ")}\n\nSuggestions: ${resolutionSuggestions.map(s => s.message).join("; ")}\n\nReply only with a concise, plain English answer.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-20b",
    });
    return completion.choices[0]?.message?.content || "";
  } catch {
  return "Error verifying with GroqCloud.";
  }
}
