// script.js
import { supabase } from './src/config/supabase.js'
import timetableData from './src/assets/timetable.json'

async function migrateTimetable() {
  for (const degree in timetableData) {
    // Insert degree
    const { error: degreeError } = await supabase.from('degrees').insert([{ name: degree }])
    if (degreeError) throw new Error(`Degree insert failed: ${degreeError.message}`)
    // Cannot get degreeId, so skip using it for next inserts
    for (const semester in timetableData[degree]) {
      // Insert semester
      const { error: semesterError } = await supabase
        .from('semesters')
        .insert([{ /* degree_id: degreeId, */ number: parseInt(semester) }])
      if (semesterError) throw new Error(`Semester insert failed: ${semesterError.message}`)
      // Cannot get semesterId, so skip using it for next inserts
      for (const section in timetableData[degree][semester]) {
        // Insert section
        const { error: sectionError } = await supabase
          .from('sections')
          .insert([{ /* semester_id: semesterId, */ name: section }])
        if (sectionError) throw new Error(`Section insert failed: ${sectionError.message}`)
        // Cannot get sectionId, so skip using it for next inserts
        for (const day in timetableData[degree][semester][section]) {
          for (const entry of timetableData[degree][semester][section][day]) {
            // Insert teacher
            const teacherName = entry.teacher || 'Unknown'
            const { error: teacherError } = await supabase
              .from('teachers')
              .insert([{ name: teacherName }])
            if (teacherError) throw new Error(`Teacher insert failed: ${teacherError.message}`)
            // Cannot get teacherId, so skip using it for next inserts
            // Insert class
            const { error: classError } = await supabase
              .from('classes')
              .insert([{ name: entry.course, location: entry.room /*, teacher_id: teacherId */ }])
            if (classError) throw new Error(`Class insert failed: ${classError.message}`)
            // Cannot get classId, so skip using it for next inserts
            // Insert timetable
            await supabase.from('timetable').insert([
              {
                /* section_id: sectionId, */
                /* class_id: classId, */
                day,
                start_time: entry.start,
                end_time: entry.end,
              },
            ])
            console.log(`Inserted: ${degree} ${semester} ${section} ${day} ${entry.course}`)
          }
        }
      }
    }
  }
}

migrateTimetable()
