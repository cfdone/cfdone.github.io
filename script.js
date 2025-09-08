// script.js
import { supabase } from './src/config/supabase.js';
import timetableData from './src/assets/timetable.json';

// Helper: Upsert and return ID
async function upsert(table, uniqueFields, data) {
  let query = supabase.from(table).select('id');
  uniqueFields.forEach(field => query = query.eq(field, data[field]));
  const { data: existing } = await query.single();
  if (existing) return existing.id;
  const { data: inserted, error: insertError } = await supabase.from(table).insert([data]).select('id').single();
  if (!inserted) {
    const reason = insertError ? insertError.message : 'Unknown error';
    throw new Error(`Insert failed for table '${table}': ${reason}`);
  }
  return inserted.id;
}

async function migrateTimetable() {
  for (const degree in timetableData) {
    const degreeId = await upsert('degrees', ['name'], { name: degree });
    for (const semester in timetableData[degree]) {
      const semesterId = await upsert('semesters', ['degree_id', 'number'], { degree_id: degreeId, number: parseInt(semester) });
      for (const section in timetableData[degree][semester]) {
        const sectionId = await upsert('sections', ['semester_id', 'name'], { semester_id: semesterId, name: section });
        for (const day in timetableData[degree][semester][section]) {
          for (const entry of timetableData[degree][semester][section][day]) {
            // Teacher
            const teacherName = entry.teacher || 'Unknown';
            const teacherId = await upsert('teachers', ['name'], { name: teacherName });
            // Class
            const classId = await upsert('classes', ['name', 'location', 'teacher_id'], {
              name: entry.course,
              location: entry.room,
              teacher_id: teacherId
            });
            // Timetable
            await supabase.from('timetable').insert([{
              section_id: sectionId,
              class_id: classId,
              day,
              start_time: entry.start,
              end_time: entry.end
            }]);
            console.log(`Inserted: ${degree} ${semester} ${section} ${day} ${entry.course}`);
          }
        }
      }
    }
  }
}

migrateTimetable();