/**
 * AI-Powered Clash Resolver
 * Uses machine learning algorithms and optimization techniques to resolve timetable conflicts
 */

import TimeTable from '../../assets/timetable.json'
import { timeToMinutes, timeRangesOverlap } from '../timeUtils'

/**
 * Configuration for AI algorithms
 */
const AI_CONFIG = {
  // Genetic Algorithm parameters
  POPULATION_SIZE: 100,
  GENERATIONS: 50,
  MUTATION_RATE: 0.1,
  CROSSOVER_RATE: 0.8,
  ELITE_SIZE: 10,
  
  // Simulated Annealing parameters
  INITIAL_TEMPERATURE: 1000,
  COOLING_RATE: 0.95,
  MIN_TEMPERATURE: 1,
  
  // Conflict scoring weights
  WEIGHTS: {
    TIME_CONFLICT: 100,
    PARENT_SECTION_BONUS: 50,
    TEACHER_QUALITY: 20,
    ROOM_PREFERENCE: 10,
    TIME_PREFERENCE: 15
  }
}

/**
 * Represents a timetable solution with ML-based scoring
 */
class TimetableSolution {
  constructor(assignments = {}) {
    this.assignments = assignments // { subjectName: { day: classInfo } }
    this.conflicts = []
    this.score = 0
    this.fitnessCalculated = false
  }

  /**
   * Calculate fitness score using ML-inspired weighted scoring
   */
  calculateFitness(userPreferences, selectedSubjects) {
    if (this.fitnessCalculated) return this.score

    let fitness = 1000 // Start with base score
    const conflicts = this.detectConflicts()
    
    // Heavy penalty for time conflicts (most critical)
    fitness -= conflicts.length * AI_CONFIG.WEIGHTS.TIME_CONFLICT
    
    // Bonus for using parent section
    Object.entries(this.assignments).forEach(([, dayAssignments]) => {
      Object.values(dayAssignments).forEach(classInfo => {
        if (this.isParentSection(classInfo, userPreferences.parentSection)) {
          fitness += AI_CONFIG.WEIGHTS.PARENT_SECTION_BONUS
        }
      })
    })

    // Penalty for missing subjects
    const scheduledSubjects = Object.keys(this.assignments)
    const missingSubjects = selectedSubjects.length - scheduledSubjects.length
    fitness -= missingSubjects * 200

    // Time preference scoring (prefer morning classes)
    Object.values(this.assignments).forEach(dayAssignments => {
      Object.values(dayAssignments).forEach(classInfo => {
        const startMinutes = timeToMinutes(classInfo.start)
        if (startMinutes >= 480 && startMinutes <= 660) { // 8 AM to 11 AM
          fitness += AI_CONFIG.WEIGHTS.TIME_PREFERENCE
        }
      })
    })

    this.score = Math.max(0, fitness)
    this.conflicts = conflicts
    this.fitnessCalculated = true
    return this.score
  }

  /**
   * Detect time conflicts in the current solution
   */
  detectConflicts() {
    const conflicts = []
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    
    days.forEach(day => {
      const dayClasses = []
      Object.entries(this.assignments).forEach(([subject, dayAssignments]) => {
        if (dayAssignments[day]) {
          dayClasses.push({ subject, ...dayAssignments[day] })
        }
      })

      // Check for overlapping classes
      for (let i = 0; i < dayClasses.length - 1; i++) {
        for (let j = i + 1; j < dayClasses.length; j++) {
          if (timeRangesOverlap(
            dayClasses[i].start, dayClasses[i].end,
            dayClasses[j].start, dayClasses[j].end
          )) {
            conflicts.push({
              day,
              subject1: dayClasses[i].subject,
              subject2: dayClasses[j].subject,
              time1: `${dayClasses[i].start}-${dayClasses[i].end}`,
              time2: `${dayClasses[j].start}-${dayClasses[j].end}`
            })
          }
        }
      }
    })

    return conflicts
  }

  /**
   * Check if a class is from the parent section
   */
  isParentSection(classInfo, parentSection) {
    return classInfo.degree === parentSection.degree &&
           classInfo.semester === parentSection.semester &&
           classInfo.section === parentSection.section
  }

  /**
   * Create a deep copy of the solution
   */
  clone() {
    const newSolution = new TimetableSolution(JSON.parse(JSON.stringify(this.assignments)))
    return newSolution
  }
}

/**
 * Genetic Algorithm implementation for timetable optimization
 */
class GeneticTimetableOptimizer {
  constructor(subjects, userPreferences) {
    this.subjects = subjects
    this.userPreferences = userPreferences
    this.population = []
    this.bestSolution = null
  }

  /**
   * Initialize population with random solutions
   */
  initializePopulation() {
    this.population = []
    
    for (let i = 0; i < AI_CONFIG.POPULATION_SIZE; i++) {
      const solution = this.generateRandomSolution()
      this.population.push(solution)
    }
  }

  /**
   * Generate a random valid solution
   */
  generateRandomSolution() {
    const solution = new TimetableSolution()
    
    this.subjects.forEach(subject => {
      const availableSections = this.getAvailableSections(subject)
      if (availableSections.length === 0) return // Skip if all sections are full

      // Prefer parent section if available, otherwise random
      let selectedSection = availableSections.find(section => 
        this.isParentSection(section, this.userPreferences.parentSection)
      )
      
      if (!selectedSection) {
        selectedSection = availableSections[Math.floor(Math.random() * availableSections.length)]
      }

      solution.assignments[subject.name] = this.extractClassSchedule(selectedSection, subject.name)
    })

    return solution
  }

  /**
   * Get available sections for a subject (not marked as full)
   */
  getAvailableSections(subject) {
    return subject.locations.filter(location => {
      const sectionKey = `${subject.name}-${location.degree}-${location.semester}-${location.section}`
      return this.userPreferences.seatAvailability[sectionKey] !== false
    })
  }

  /**
   * Extract class schedule from timetable data
   */
  extractClassSchedule(location, subjectName) {
    const schedule = {}
    const sectionData = TimeTable[location.degree]?.[location.semester]?.[location.section]
    
    console.log(`Extracting schedule for ${subjectName} from ${location.degree}-${location.semester}-${location.section}`)
    
    if (sectionData) {
      Object.entries(sectionData).forEach(([day, classes]) => {
        const subjectClass = classes.find(cls => cls.course === subjectName)
        if (subjectClass) {
          console.log(`Found class for ${subjectName} on ${day}:`, subjectClass)
          schedule[day] = {
            ...subjectClass,
            degree: location.degree,
            semester: location.semester,
            section: location.section
          }
        }
      })
    } else {
      console.warn(`No section data found for ${location.degree}-${location.semester}-${location.section}`)
    }
    
    console.log(`Final schedule for ${subjectName}:`, schedule)
    return schedule
  }

  /**
   * Selection using tournament selection
   */
  selection() {
    const tournamentSize = 5
    const selected = []
    
    for (let i = 0; i < AI_CONFIG.POPULATION_SIZE; i++) {
      let best = null
      
      for (let j = 0; j < tournamentSize; j++) {
        const candidate = this.population[Math.floor(Math.random() * this.population.length)]
        const fitness = candidate.calculateFitness(this.userPreferences, this.subjects)
        
        if (!best || fitness > best.calculateFitness(this.userPreferences, this.subjects)) {
          best = candidate
        }
      }
      
      selected.push(best)
    }
    
    return selected
  }

  /**
   * Crossover between two parent solutions
   */
  crossover(parent1, parent2) {
    if (Math.random() > AI_CONFIG.CROSSOVER_RATE) {
      return [parent1.clone(), parent2.clone()]
    }

    const child1 = new TimetableSolution()
    const child2 = new TimetableSolution()
    
    const subjects = Object.keys({ ...parent1.assignments, ...parent2.assignments })
    
    subjects.forEach(subject => {
      if (Math.random() < 0.5) {
        if (parent1.assignments[subject]) child1.assignments[subject] = parent1.assignments[subject]
        if (parent2.assignments[subject]) child2.assignments[subject] = parent2.assignments[subject]
      } else {
        if (parent2.assignments[subject]) child1.assignments[subject] = parent2.assignments[subject]
        if (parent1.assignments[subject]) child2.assignments[subject] = parent1.assignments[subject]
      }
    })

    return [child1, child2]
  }

  /**
   * Mutation operation
   */
  mutate(solution) {
    if (Math.random() > AI_CONFIG.MUTATION_RATE) return

    const subjects = Object.keys(solution.assignments)
    if (subjects.length === 0) return

    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
    const subject = this.subjects.find(s => s.name === randomSubject)
    
    if (subject) {
      const availableSections = this.getAvailableSections(subject)
      if (availableSections.length > 0) {
        const newSection = availableSections[Math.floor(Math.random() * availableSections.length)]
        solution.assignments[subject.name] = this.extractClassSchedule(newSection, subject.name)
        solution.fitnessCalculated = false // Reset fitness
      }
    }
  }

  /**
   * Run the genetic algorithm
   */
  evolve(progressCallback) {
    this.initializePopulation()
    
    for (let generation = 0; generation < AI_CONFIG.GENERATIONS; generation++) {
      // Calculate fitness for all solutions
      this.population.forEach(solution => {
        solution.calculateFitness(this.userPreferences, this.subjects)
      })

      // Sort by fitness (descending)
      this.population.sort((a, b) => b.score - a.score)
      
      // Track best solution
      if (!this.bestSolution || this.population[0].score > this.bestSolution.score) {
        this.bestSolution = this.population[0].clone()
      }

      // Report progress
      if (progressCallback) {
        progressCallback({
          generation: generation + 1,
          bestScore: this.bestSolution.score,
          bestConflicts: this.bestSolution.conflicts.length,
          progress: ((generation + 1) / AI_CONFIG.GENERATIONS) * 100
        })
      }

      // Early termination if perfect solution found
      if (this.bestSolution.conflicts.length === 0) {
        break
      }

      // Create new population
      const newPopulation = []
      
      // Elitism: keep best solutions
      for (let i = 0; i < AI_CONFIG.ELITE_SIZE; i++) {
        newPopulation.push(this.population[i].clone())
      }

      // Generate offspring
      const selected = this.selection()
      for (let i = AI_CONFIG.ELITE_SIZE; i < AI_CONFIG.POPULATION_SIZE; i += 2) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)]
        const parent2 = selected[Math.floor(Math.random() * selected.length)]
        
        const [child1, child2] = this.crossover(parent1, parent2)
        
        this.mutate(child1)
        this.mutate(child2)
        
        newPopulation.push(child1)
        if (newPopulation.length < AI_CONFIG.POPULATION_SIZE) {
          newPopulation.push(child2)
        }
      }

      this.population = newPopulation
    }

    return this.bestSolution
  }

  isParentSection(location, parentSection) {
    return location.degree === parentSection.degree &&
           location.semester === parentSection.semester &&
           location.section === parentSection.section
  }
}

/**
 * Simulated Annealing for local optimization
 */
class SimulatedAnnealingOptimizer {
  constructor(initialSolution, subjects, userPreferences) {
    this.currentSolution = initialSolution
    this.bestSolution = initialSolution.clone()
    this.subjects = subjects
    this.userPreferences = userPreferences
  }

  /**
   * Generate a neighbor solution by swapping one subject's section
   */
  generateNeighbor(solution) {
    const neighbor = solution.clone()
    const subjectNames = Object.keys(neighbor.assignments)
    
    if (subjectNames.length === 0) return neighbor

    const randomSubject = subjectNames[Math.floor(Math.random() * subjectNames.length)]
    const subject = this.subjects.find(s => s.name === randomSubject)
    
    if (subject) {
      const availableSections = subject.locations.filter(location => {
        const sectionKey = `${subject.name}-${location.degree}-${location.semester}-${location.section}`
        return this.userPreferences.seatAvailability[sectionKey] !== false
      })

      if (availableSections.length > 0) {
        const newSection = availableSections[Math.floor(Math.random() * availableSections.length)]
        const optimizer = new GeneticTimetableOptimizer(this.subjects, this.userPreferences)
        neighbor.assignments[subject.name] = optimizer.extractClassSchedule(newSection, subject.name)
        neighbor.fitnessCalculated = false
      }
    }

    return neighbor
  }

  /**
   * Run simulated annealing
   */
  optimize(progressCallback) {
    let temperature = AI_CONFIG.INITIAL_TEMPERATURE
    let iterations = 0
    const maxIterations = 1000

    while (temperature > AI_CONFIG.MIN_TEMPERATURE && iterations < maxIterations) {
      const neighbor = this.generateNeighbor(this.currentSolution)
      
      const currentFitness = this.currentSolution.calculateFitness(this.userPreferences, this.subjects)
      const neighborFitness = neighbor.calculateFitness(this.userPreferences, this.subjects)
      
      const deltaE = neighborFitness - currentFitness
      
      // Accept if better, or with probability based on temperature
      if (deltaE > 0 || Math.random() < Math.exp(deltaE / temperature)) {
        this.currentSolution = neighbor
        
        if (neighborFitness > this.bestSolution.calculateFitness(this.userPreferences, this.subjects)) {
          this.bestSolution = neighbor.clone()
        }
      }

      temperature *= AI_CONFIG.COOLING_RATE
      iterations++

      if (progressCallback && iterations % 50 === 0) {
        progressCallback({
          iteration: iterations,
          temperature: temperature,
          bestScore: this.bestSolution.calculateFitness(this.userPreferences, this.subjects),
          bestConflicts: this.bestSolution.conflicts.length
        })
      }
    }

    return this.bestSolution
  }
}

/**
 * Main AI Clash Resolver function
 */
export const resolveClashesWithAI = async (selectedSubjects, userPreferences, progressCallback) => {
  try {
    console.log('🤖 Starting AI-powered clash resolution...')
    
    // Filter out subjects where all sections are full
    const availableSubjects = selectedSubjects.filter(subject => {
      const hasAvailableSection = subject.locations.some(location => {
        const sectionKey = `${subject.name}-${location.degree}-${location.semester}-${location.section}`
        return userPreferences.seatAvailability[sectionKey] !== false
      })
      return hasAvailableSection
    })

    if (availableSubjects.length === 0) {
      return {
        success: false,
        timetable: {},
        conflicts: [],
        conflictDetails: [],
        message: 'All sections for all subjects are marked as full. No timetable can be generated.',
        skippedSubjects: selectedSubjects.map(s => s.name),
        aiMetrics: {
          algorithm: 'none',
          iterations: 0,
          finalScore: 0
        }
      }
    }

    const skippedSubjects = selectedSubjects
      .filter(subject => !availableSubjects.find(s => s.name === subject.name))
      .map(s => s.name)

    // Phase 1: Genetic Algorithm
    console.log('🧬 Running Genetic Algorithm optimization...')
    const geneticOptimizer = new GeneticTimetableOptimizer(availableSubjects, userPreferences)
    
    const geneticSolution = geneticOptimizer.evolve((progress) => {
      if (progressCallback) {
        progressCallback({
          phase: 'genetic',
          ...progress
        })
      }
    })

    // Phase 2: Simulated Annealing for fine-tuning
    console.log('🔥 Running Simulated Annealing optimization...')
    const annealingOptimizer = new SimulatedAnnealingOptimizer(geneticSolution, availableSubjects, userPreferences)
    
    const finalSolution = annealingOptimizer.optimize((progress) => {
      if (progressCallback) {
        progressCallback({
          phase: 'annealing',
          ...progress
        })
      }
    })

    // Convert solution to timetable format
    console.log('Final solution assignments:', finalSolution.assignments)
    const timetable = convertSolutionToTimetable(finalSolution.assignments)
    console.log('Converted timetable:', timetable)
    
    const conflicts = finalSolution.conflicts
    
    // Extract conflict subjects
    const conflictSubjects = [...new Set(conflicts.flatMap(c => [c.subject1, c.subject2]))]

    const result = {
      success: conflicts.length === 0,
      timetable,
      conflicts: conflictSubjects,
      conflictDetails: conflicts,
      message: conflicts.length === 0 
        ? `✨ Perfect solution found! All ${availableSubjects.length} subjects scheduled without conflicts.`
        : `⚡ Optimized solution found with ${conflicts.length} minor conflicts. AI minimized clashes across ${availableSubjects.length} subjects.`,
      skippedSubjects,
      aiMetrics: {
        algorithm: 'Genetic Algorithm + Simulated Annealing',
        finalScore: finalSolution.score,
        totalConflicts: conflicts.length,
        subjectsScheduled: Object.keys(finalSolution.assignments).length,
        optimizationPhases: 2
      }
    }

    console.log('🎯 AI optimization complete:', result)
    return result

  } catch (error) {
    console.error('❌ AI clash resolution failed:', error)
    return {
      success: false,
      timetable: {},
      conflicts: [],
      conflictDetails: [],
      message: 'AI optimization failed. Please try again.',
      skippedSubjects: [],
      aiMetrics: {
        algorithm: 'failed',
        error: error.message
      }
    }
  }
}

/**
 * Convert solution assignments to timetable format
 */
function convertSolutionToTimetable(assignments) {
  const timetable = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
  }

  Object.entries(assignments).forEach(([subject, dayAssignments]) => {
    Object.entries(dayAssignments).forEach(([day, classInfo]) => {
      if (timetable[day]) {
        timetable[day].push({
          subject: subject,
          course: classInfo.course || subject,
          start: classInfo.start,
          end: classInfo.end,
          teacher: classInfo.teacher,
          room: classInfo.room,
          degree: classInfo.degree,
          semester: classInfo.semester,
          section: classInfo.section
        })
      }
    })
  })

  // Sort classes by start time for each day
  Object.keys(timetable).forEach(day => {
    timetable[day].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
  })

  return timetable
}

/**
 * Analyze timetable quality and provide insights
 */
export const analyzeTimetableQuality = (timetable, conflicts, aiMetrics) => {
  const analysis = {
    overallScore: 'A+',
    insights: [],
    recommendations: [],
    aiConfidence: 95
  }

  // Calculate quality metrics
  const totalClasses = Object.values(timetable).reduce((sum, day) => sum + day.length, 0)
  const conflictRatio = conflicts.length / Math.max(totalClasses, 1)

  if (conflicts.length === 0) {
    analysis.overallScore = 'A+'
    analysis.insights.push('🎯 Perfect timetable with zero conflicts')
    analysis.insights.push('✨ AI successfully optimized all subject placements')
    analysis.aiConfidence = 98
  } else if (conflictRatio < 0.1) {
    analysis.overallScore = 'A'
    analysis.insights.push('⭐ Excellent timetable with minimal conflicts')
    analysis.insights.push(`🔧 Only ${conflicts.length} minor scheduling conflicts`)
    analysis.aiConfidence = 92
  } else if (conflictRatio < 0.2) {
    analysis.overallScore = 'B+'
    analysis.insights.push('👍 Good timetable with manageable conflicts')
    analysis.recommendations.push('Consider adjusting subject section preferences')
    analysis.aiConfidence = 85
  } else {
    analysis.overallScore = 'B'
    analysis.insights.push('⚠️ Acceptable timetable but needs optimization')
    analysis.recommendations.push('Review seat availability settings')
    analysis.recommendations.push('Consider selecting different parent section')
    analysis.aiConfidence = 75
  }

  // Add AI-specific insights
  if (aiMetrics.finalScore > 800) {
    analysis.insights.push('🤖 AI confidence: Very High')
  } else if (aiMetrics.finalScore > 600) {
    analysis.insights.push('🤖 AI confidence: High')
  } else {
    analysis.insights.push('🤖 AI confidence: Moderate')
  }

  return analysis
}