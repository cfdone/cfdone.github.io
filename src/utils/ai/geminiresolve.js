// Gemini API utility for timetable clash verification
export async function verifyTimetableWithGemini({
  timetable,
  conflictSubjects,
  resolutionSuggestions,
  selectedSubjects,
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

  // Remove room info from timetable before sending to Gemini
  const timetableNoRoom = {}
  Object.entries(timetable).forEach(([day, slots]) => {
    timetableNoRoom[day] = slots.map(slot => {
      const { ...rest } = slot
      return rest
    })
  })

  // Prepare prompt for Gemini
  const prompt = `Given the following timetable and subjects, check if there are any clashes. Ignore room information, as lectures can be in different rooms on different days. If resolved, reply 'No clashes'. If not, suggest improvements.\n\nTimetable: ${JSON.stringify(timetableNoRoom)}\n\nSubjects: ${JSON.stringify(selectedSubjects)}\n\nConflicts: ${JSON.stringify(conflictSubjects)}\n\nSuggestions: ${JSON.stringify(resolutionSuggestions)}`

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    // Gemini's reply is in data.candidates[0].content.parts[0].text
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } catch {
    return 'Error verifying with Gemini.'
  }
}
