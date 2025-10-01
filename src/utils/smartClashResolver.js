import TimeTable from '../assets/timetable.json'

export class SmartClashResolver {
  constructor(selectedSubjects, userPreferences) {
    this.selectedSubjects = selectedSubjects
    this.userPreferences = userPreferences
    this.timeSlotCache = new Map()
    this.conflictMatrix = new Map()
  }

  // Convert time string to minutes for easy comparison
  timeToMinutes(timeStr) {
    const [time, period] = timeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    
    if (period === 'PM' && hours !== 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0
    
    return hours * 60 + minutes
  }

  // Check if two time ranges overlap
  timeRangesOverlap(start1, end1, start2, end2) {
    const s1 = this.timeToMinutes(start1)
    const e1 = this.timeToMinutes(end1)
    const s2 = this.timeToMinutes(start2)
    const e2 = this.timeToMinutes(end2)
    
    return s1 < e2 && s2 < e1
  }

  // Extract all possible sections for selected subjects
  getAllSectionOptions() {
    const sectionOptions = new Map()
    
    this.selectedSubjects.forEach(subject => {
      const options = []
      
      Object.entries(TimeTable).forEach(([degree, semesters]) => {
        Object.entries(semesters).forEach(([semester, sections]) => {
          Object.entries(sections).forEach(([section, schedule]) => {
            
            // Check if this section has the subject
            const subjectClasses = []
            Object.entries(schedule).forEach(([day, classes]) => {
              classes.forEach(cls => {
                if (cls.course === subject.name) {
                  subjectClasses.push({
                    day,
                    start: cls.start,
                    end: cls.end,
                    teacher: cls.teacher,
                    room: cls.room
                  })
                }
              })
            })
            
            if (subjectClasses.length > 0) {
              // Check seat availability
              const sectionKey = `${subject.name}-${degree}-${semester}-${section}`
              const isAvailable = this.userPreferences.seatAvailability[sectionKey] !== false
              
              if (isAvailable) {
                options.push({
                  degree,
                  semester,
                  section,
                  classes: subjectClasses,
                  isParentSection: this.isParentSection(degree, semester, section),
                  priority: this.calculateSectionPriority(degree, semester, section, subjectClasses)
                })
              }
            }
          })
        })
      })
      
      // Sort options by priority (parent section first, then by other factors)
      options.sort((a, b) => b.priority - a.priority)
      sectionOptions.set(subject.name, options)
    })
    
    return sectionOptions
  }

  isParentSection(degree, semester, section) {
    const parent = this.userPreferences.parentSection
    return parent.degree === degree && 
           parent.semester === semester && 
           parent.section === section
  }

  calculateSectionPriority(degree, semester, section, classes) {
    let priority = 0
    
    // Highest priority for parent section
    if (this.isParentSection(degree, semester, section)) {
      priority += 1000
    }
    
    // Prefer sections with fewer total classes (less congested schedule)
    priority -= classes.length * 10
    
    // Prefer sections with classes in reasonable time slots (avoid very early/late)
    classes.forEach(cls => {
      const startMinutes = this.timeToMinutes(cls.start)
      const startHour = Math.floor(startMinutes / 60)
      
      if (startHour >= 9 && startHour <= 15) { // 9 AM to 3 PM
        priority += 20
      } else if (startHour >= 8 && startHour <= 16) { // 8 AM to 4 PM
        priority += 10
      }
    })
    
    return priority
  }

  // Smart backtracking with conflict detection
  resolveWithBacktracking() {
    const sectionOptions = this.getAllSectionOptions()
    const subjects = Array.from(sectionOptions.keys())
    const solution = new Map()
    
    console.log('Starting smart backtracking resolution...')
    console.log(`Subjects to assign: ${subjects.length}`)
    
    // Check if any subjects have no available sections
    const subjectsWithoutSections = subjects.filter(subject => {
      const options = sectionOptions.get(subject) || []
      return options.length === 0
    })
    
    if (subjectsWithoutSections.length > 0) {
      console.log('❌ Some subjects have no available sections:', subjectsWithoutSections)
      return {
        success: false,
        assignments: new Map(),
        conflicts: subjectsWithoutSections,
        timetable: this.convertToTimetableFormat(new Map()),
        message: `No available sections found for: ${subjectsWithoutSections.join(', ')}. All sections may be marked as full.`
      }
    }
    
    // Try to assign each subject
    const result = this.backtrack(subjects, 0, sectionOptions, solution)
    
    if (result.success) {
      console.log('✅ Found optimal solution with no conflicts!')
      return {
        success: true,
        assignments: result.solution,
        conflicts: [],
        timetable: this.convertToTimetableFormat(result.solution),
        message: 'Perfect schedule created with no conflicts!'
      }
    } else {
      console.log('⚠️ No conflict-free solution found. Finding best partial solution...')
      // Find best partial solution with minimum conflicts
      return this.findBestPartialSolution(sectionOptions)
    }
  }

  backtrack(subjects, index, sectionOptions, currentSolution) {
    // Base case: all subjects assigned
    if (index === subjects.length) {
      return { success: true, solution: new Map(currentSolution) }
    }
    
    const currentSubject = subjects[index]
    const availableSections = sectionOptions.get(currentSubject) || []
    
    // Try each available section for current subject
    for (const section of availableSections) {
      // Check if this section creates conflicts
      if (!this.hasConflictWith(section, currentSolution)) {
        // Assign this section
        currentSolution.set(currentSubject, section)
        
        // Recursively try to assign remaining subjects
        const result = this.backtrack(subjects, index + 1, sectionOptions, currentSolution)
        
        if (result.success) {
          return result
        }
        
        // Backtrack: remove this assignment
        currentSolution.delete(currentSubject)
      }
    }
    
    return { success: false }
  }

  hasConflictWith(newSection, currentSolution) {
    for (const [, assignedSection] of currentSolution) {
      // Check for time conflicts between newSection and assignedSection
      for (const newClass of newSection.classes) {
        for (const assignedClass of assignedSection.classes) {
          if (newClass.day === assignedClass.day &&
              this.timeRangesOverlap(
                newClass.start, newClass.end,
                assignedClass.start, assignedClass.end
              )) {
            return true // Conflict found
          }
        }
      }
    }
    return false // No conflicts
  }

  findBestPartialSolution(sectionOptions) {
    const subjects = Array.from(sectionOptions.keys())
    let bestSolution = new Map()
    let minConflicts = Infinity
    let bestConflictDetails = []
    
    console.log('🔄 Searching for best partial solution...')
    
    // Generate multiple solutions and pick the best one
    for (let attempt = 0; attempt < 100; attempt++) {
      const solution = new Map()
      const conflictDetails = []
      
      // Assign sections greedily (prefer parent section, then by priority)
      subjects.forEach(subject => {
        const options = sectionOptions.get(subject) || []
        if (options.length > 0) {
          // Try to find a non-conflicting section
          let assigned = false
          
          for (const section of options) {
            if (!this.hasConflictWith(section, solution)) {
              solution.set(subject, section)
              assigned = true
              break
            }
          }
          
          // If no conflict-free section found, assign the highest priority one
          if (!assigned && options.length > 0) {
            const section = options[0] // Highest priority
            solution.set(subject, section)
            
            // Record conflicts for this assignment
            for (const [assignedSubject, assignedSection] of solution) {
              if (assignedSubject !== subject) {
                for (const newClass of section.classes) {
                  for (const assignedClass of assignedSection.classes) {
                    if (newClass.day === assignedClass.day &&
                        this.timeRangesOverlap(
                          newClass.start, newClass.end,
                          assignedClass.start, assignedClass.end
                        )) {
                      conflictDetails.push({
                        subject1: subject,
                        subject2: assignedSubject,
                        day: newClass.day,
                        time1: `${newClass.start}-${newClass.end}`,
                        time2: `${assignedClass.start}-${assignedClass.end}`
                      })
                    }
                  }
                }
              }
            }
          }
        }
      })
      
      // Count unique subjects in conflict
      const conflictSubjects = new Set()
      conflictDetails.forEach(conflict => {
        conflictSubjects.add(conflict.subject1)
        conflictSubjects.add(conflict.subject2)
      })
      
      const conflictCount = conflictSubjects.size
      
      if (conflictCount < minConflicts) {
        minConflicts = conflictCount
        bestSolution = new Map(solution)
        bestConflictDetails = [...conflictDetails]
      }
      
      if (conflictCount === 0) break // Found perfect solution
    }
    
    console.log(`📊 Best solution found with ${minConflicts} subjects in conflict`)
    
    const conflictSubjectsList = Array.from(new Set(bestConflictDetails.map(c => c.subject1).concat(bestConflictDetails.map(c => c.subject2))))
    
    return {
      success: minConflicts === 0,
      assignments: bestSolution,
      conflicts: conflictSubjectsList,
      conflictDetails: bestConflictDetails,
      timetable: this.convertToTimetableFormat(bestSolution),
      message: minConflicts === 0 
        ? 'Perfect schedule created with no conflicts!' 
        : `Found best possible schedule with ${minConflicts} subject${minConflicts > 1 ? 's' : ''} having conflicts.`
    }
  }

  convertToTimetableFormat(assignments) {
    const timetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    }
    
    for (const [subjectName, section] of assignments) {
      section.classes.forEach(cls => {
        if (timetable[cls.day]) {
          timetable[cls.day].push({
            subject: subjectName,
            course: subjectName,
            start: cls.start,
            end: cls.end,
            teacher: cls.teacher,
            room: cls.room,
            degree: section.degree,
            semester: section.semester,
            section: section.section
          })
        }
      })
    }
    
    // Sort classes by start time for each day
    Object.keys(timetable).forEach(day => {
      timetable[day].sort((a, b) => this.timeToMinutes(a.start) - this.timeToMinutes(b.start))
    })
    
    return timetable
  }
}

// Export the main resolver function
export const resolveClashes = (selectedSubjects, userPreferences) => {
  console.log('🚀 Starting clash resolution...')
  console.log(`Selected subjects: ${selectedSubjects.map(s => s.name).join(', ')}`)
  console.log(`Parent section: ${userPreferences.parentSection.degree} ${userPreferences.parentSection.semester}-${userPreferences.parentSection.section}`)
  
  const resolver = new SmartClashResolver(selectedSubjects, userPreferences)
  const result = resolver.resolveWithBacktracking()
  
  console.log('✅ Resolution complete')
  return result
}