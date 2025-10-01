import { useState, useMemo, useEffect, useCallback } from 'react'
import Toast from '../../components/Toast'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, AlertTriangle, Target, Book, MapPin, Star } from 'lucide-react'
import ShinyText from '../../components/ShinyText'

import logo from '../../assets/logo.svg'
import StepTrack from '../../components/Onboarding/StepTrack'
import { timeToMinutes, timeRangesOverlap } from '../../utils/timeUtils'
import TimeTable from '../../assets/timetable.json'
import { verifyTimetableWithGroqCloud } from '../../utils/ai/grokcloud'
import { Sparkles } from 'lucide-react'
import { supabase } from '../../config/supabase'

export default function Preview() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedSubjects = useMemo(() => {
    return location.state?.selectedSubjects || []
  }, [location.state?.selectedSubjects])

  const userPreferences = useMemo(() => {
    return (
      location.state?.userPreferences || {
        parentSection: { degree: '', semester: '', section: '' },
        generalSeatPolicy: 'flexible',
        seatAvailability: {},
      }
    )
  }, [location.state?.userPreferences])

  // Get resolved data from navigation state (from smart resolver)
  const [resolvedTimetable, setResolvedTimetable] = useState(null)
  const [conflictSubjects, setConflictSubjects] = useState([])
  const [resolutionSuggestions, setResolutionSuggestions] = useState([])
  const [resolutionSuccess, setResolutionSuccess] = useState(false)
  const [resolutionDetails, setResolutionDetails] = useState([])
  const [resolutionMessage, setResolutionMessage] = useState('')

  const [isResolving] = useState(false)
  const [resolutionProgress] = useState(0)

  // Error message for failed timetable creation
  const [errorMsg, setErrorMsg] = useState('')

  // GroqCloud verification states
  const [grokcloudResponse, setGrokcloudResponse] = useState('')
  const [isReverifying, setIsReverifying] = useState(false)
  const [hasReverified, setHasReverified] = useState(false)

  // Upload progress for Done button
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Simple conflict detection for display purposes only
  const detectTimeConflicts = useCallback((timetable = []) => {
    const conflicts = [];
    
    if (!timetable || typeof timetable !== 'object') {
      return { conflicts: [], assignments: {} };
    }

    // Check each day for time overlaps
    Object.entries(timetable).forEach(([, classes]) => {
      if (!Array.isArray(classes) || classes.length < 2) {
        return;
      }
      
      // Sort classes by start time
      const sortedClasses = classes.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
      
      // Check for overlaps
      for (let i = 0; i < sortedClasses.length - 1; i++) {
        for (let j = i + 1; j < sortedClasses.length; j++) {
          const class1 = sortedClasses[i];
          const class2 = sortedClasses[j];
          
          if (timeRangesOverlap(class1.start, class1.end, class2.start, class2.end)) {
            const subject1 = class1.subject || class1.course;
            const subject2 = class2.subject || class2.course;
            
            if (subject1 && !conflicts.includes(subject1)) {
              conflicts.push(subject1);
            }
            if (subject2 && !conflicts.includes(subject2)) {
              conflicts.push(subject2);
            }
          }
        }
      }
    });
    
    return { conflicts, assignments: timetable };
  }, []);

  // Generate resolution suggestions for conflicting subjects
  const generateResolutionSuggestions = useCallback(
    (conflicts, subjects) => {
      return conflicts
        .map(conflictSubject => {
          const subject = subjects.find(s => s.name === conflictSubject)
          if (!subject || !subject.locations || !userPreferences?.parentSection) return null
          
          const parentSection = userPreferences.parentSection
          const alternatives = subject.locations.filter(loc => {
            // Only suggest sections that aren't marked as full
            const sectionKey = `${subject.name}-${loc.degree}-${loc.semester}-${loc.section}`
            const isNotFull = userPreferences.seatAvailability[sectionKey] !== false
            
            // Only suggest if not in parent section and not full
            return (
              isNotFull &&
              (loc.degree !== parentSection.degree ||
               loc.semester !== parentSection.semester ||
               loc.section !== parentSection.section)
            )
          })
          
          return {
            subject: subject.name,
            message:
              alternatives.length > 0
                ? 'Try selecting a different section that has available seats to avoid conflicts.'
                : 'No alternate sections with available seats. Manual adjustment may be required.',
            alternatives,
          }
        })
        .filter(Boolean)
    },
    [userPreferences]
  )

  // Effect to handle resolved timetable from navigation state
  useEffect(() => {
    console.log('Preview: Location state:', location.state)
    
    if (location.state?.resolvedTimetable) {
      console.log('Using resolved timetable from smart resolver')
      setResolvedTimetable(location.state.resolvedTimetable)
      setConflictSubjects(location.state.conflictSubjects || [])
      setResolutionSuggestions(location.state.resolutionSuggestions || [])
      setResolutionSuccess(location.state.resolutionSuccess || false)
      setResolutionDetails(location.state.resolutionDetails || [])
      setResolutionMessage(location.state.resolutionMessage || '')
    } else {
      console.log('No resolved timetable found, falling back to parent section')
      
      // Fallback: try to get timetable from parent section (but this shouldn't happen with smart resolver)
      if (
        TimeTable &&
        userPreferences?.parentSection?.degree &&
        userPreferences?.parentSection?.semester &&
        userPreferences?.parentSection?.section
      ) {
        const parentTimetable =
          TimeTable[userPreferences.parentSection.degree]?.[userPreferences.parentSection.semester]?.[userPreferences.parentSection.section]
        
        if (parentTimetable) {
          setResolvedTimetable(parentTimetable)
          const { conflicts } = detectTimeConflicts(parentTimetable)
          setConflictSubjects(conflicts)
        } else {
          setErrorMsg('No timetable data found for selected parent section')
        }
      } else {
        setResolvedTimetable(null)
        setConflictSubjects([])
      }
    }
  }, [location.state, detectTimeConflicts, userPreferences]);

  // Effect to generate resolution suggestions when conflicts are detected
  useEffect(() => {
    if (conflictSubjects.length > 0 && selectedSubjects.length > 0) {
      setResolutionSuggestions(generateResolutionSuggestions(conflictSubjects, selectedSubjects))
    } else {
      setResolutionSuggestions([])
    }
  }, [conflictSubjects, selectedSubjects, generateResolutionSuggestions])


  // Weekly timetable preview styled like WeeklySchedule.jsx
  const renderTimetableByDay = timetable => {
    if (!timetable) return null;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    return (
      <div className="space-y-3">
        {days
          .filter(day => Object.prototype.hasOwnProperty.call(timetable, day))
          .map(day => {
            const classes = timetable[day] || [];
            return (
              <div key={day}>
                <div className="bg-white/2 rounded-3xl border border-accent/5 overflow-hidden">
                  <div className="p-3 border-b border-accent/5 bg-white/2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white  font-semibold">{day}</h3>
                      </div>
                      <div className="text-white/80 text-sm ">
                        {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-accent/5">
                    {classes.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="mb-2 flex justify-center">
                          <Star className="w-6 h-6 text-accent/60" />
                        </div>
                        <div className="text-accent/60  text-sm">No classes scheduled</div>
                      </div>
                    ) : (
                      classes
                        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
                        .map((cls, idx) => {
                          const isConflict = conflictSubjects.includes(cls.subject || cls.course);
                          const degree = cls.degree || userPreferences.parentSection.degree || 'N/A';
                          const semester = cls.semester || userPreferences.parentSection.semester || 'N/A';
                          const section = cls.section || userPreferences.parentSection.section || 'N/A';
                          return (
                            <div
                              key={idx}
                              className={`p-4 transition-colors ${isConflict ? 'bg-yellow-500/10 border-l-4 border-yellow-500' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                {/* Left: Course info */}
                                <div className="flex-1 pr-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div
                                      className={`w-2 h-2 rounded-full flex-shrink-0 ${isConflict ? 'bg-yellow-400 animate-pulse' : 'bg-accent/40'}`}
                                    ></div>
                                    <h4
                                      className={` font-semibold text-sm ${isConflict ? 'text-yellow-400' : 'text-white'}`}
                                    >
                                      {cls.subject || cls.course}
                                    </h4>
                                    {isConflict && (
                                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs  font-semibold">
                                        Conflict
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs  text-accent/80">
                                      <MapPin className="w-3 h-3" />
                                      <span>{cls.room || 'Room TBD'}</span>
                                    </div>
                                    <div className="text-xs  text-accent/70">
                                      {cls.teacher || 'Teacher TBD'}
                                    </div>
                                    <div className="text-xs  text-accent/50">
                                      {degree} • S{semester}-{section}
                                    </div>
                                  </div>
                                </div>
                                {/* Right: Time info */}
                                <div className="text-right flex-shrink-0">
                                  <div className=" font-semibold text-base text-white">
                                    {cls.start}
                                  </div>
                                  <div className=" text-xs text-accent/60">{cls.end}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col items-center px-2 pt-safe-offset-8 pb-safe-offset-3-offset-5">
      {/* Fixed Header */}
      <div className="w-full justify-center flex flex-col gap-6 items-center flex-shrink-0">
        <img src={logo} alt="Logo" className="w-15 h-15 user-select-none mb-2" />
        <StepTrack currentStep={4} totalSteps={4} />
        <div className="text-center mb-6">
          <h1 className=" text-accent font-semibold text-xl mb-2">Review Your Timetable</h1>
          <p className="text-white/70 text-sm ">
            Review your schedule before creating the final timetable
          </p>
          {/* Toast for error messages */}
          <Toast
            show={!!errorMsg}
            message={errorMsg}
            type="error"
            onClose={() => setErrorMsg('')}
            duration={3500}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar min-h-0">
        <div className="flex flex-col items-center gap-4 px-2 py-4 pb-8">
          <div className="w-full">
            <div className="flex flex-col gap-4">
              {/* Initial Add Subjects Button */}
              {selectedSubjects.length === 0 && (
                <div className="text-center">
                  <div className="p-6 rounded-3xl  text-lg border transition-all duration-200 text-left w-full bg-white/10 text-accent border-accent/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold mb-2">No Subjects Selected</div>
                        <div className="text-sm opacity-80">
                          Please go back to select your subjects and preferences
                        </div>
                      </div>
                      <div className="text-2xl ml-4">
                        <Book className="w-8 h-8 text-accent" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

          {/* Resolution Status Card */}
          {resolvedTimetable && !isResolving && (
                <>
                  <div
                    className={`p-4 rounded-3xl border ${
                      resolutionSuccess && conflictSubjects.length === 0
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div>
                        {resolutionSuccess && conflictSubjects.length === 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      <div className="font-semibold">
                        {resolutionSuccess && conflictSubjects.length === 0
                          ? 'Perfect Schedule Created!'
                          : `${conflictSubjects.length} Subject${conflictSubjects.length > 1 ? 's' : ''} Have Conflicts`}
                      </div>
                    </div>
                    <div className="text-sm opacity-80">
                      {resolutionMessage || (resolutionSuccess && conflictSubjects.length === 0
                        ? `Optimal schedule found with no time conflicts for your parent section.`
                        : 'Smart resolver found the best possible schedule, but some conflicts remain.')}
                    </div>
                    {userPreferences.parentSection.degree && (
                      <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
                        <Target className="w-3 h-3" /> Parent Section:{' '}
                        {userPreferences.parentSection.degree} • Semester{' '}
                        {userPreferences.parentSection.semester} • Section{' '}
                        {userPreferences.parentSection.section}
                      </div>
                    )}
                    {/* Check if no classes could be scheduled */}
                    {resolvedTimetable && !Object.values(resolvedTimetable).some(day => 
                      Array.isArray(day) && day.length > 0
                    ) && (
                      <div className="mt-2 text-xs text-red-400 font-semibold">
                        ⚠️ No classes could be scheduled - all selected sections may be marked as full.
                      </div>
                    )}
                  </div>
                  {/* GroqCloud AI Review Card with Reverify Button */}
                  <div className="mt-3 p-4 rounded-3xl border bg-accent/10 border-accent/20 text-white">
                    <div className="flex items-center justify-between">
                      GroqCloud AI Review:
                      {!isReverifying &&
                        (!grokcloudResponse ||
                          grokcloudResponse === 'Error verifying with GroqCloud.') && (
                          <button
                            className="px-3 py-1  text-white text-xs hover:bg-accent/80 transition rounded-full  font-semibold"
                            style={{
                              background:
                                'linear-gradient(135deg, #a980ff, #182fff99) 0 0 / 200% 200%',
                            }}
                            disabled={
                              hasReverified &&
                              grokcloudResponse !== 'Error verifying with GroqCloud.'
                            }
                            onClick={async () => {
                              setIsReverifying(true)
                              setGrokcloudResponse('')
                              setHasReverified(false)
                              const response = await verifyTimetableWithGroqCloud({
                                timetable: resolvedTimetable,
                                conflictSubjects,
                                resolutionSuggestions,
                                selectedSubjects,
                              })
                              setGrokcloudResponse(response)
                              setIsReverifying(false)
                              setHasReverified(true)
                            }}
                          >
                            <Sparkles className="w-4 h-4 inline-block mr-1" />
                            {grokcloudResponse === 'Error verifying with GroqCloud.'
                              ? 'Retry AI Verification'
                              : 'Reverify with AI'}
                          </button>
                        )}
                    </div>

                    {/* Reasoning Animation */}
                    {isReverifying && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-accent/50 animate-pulse flex justify-center items-center">
                          <div className="w-1 h-1 rounded-full bg-accent"></div>
                        </div>
                        <ShinyText
                          text="Xarvin is analyzing your timetable..."
                          disabled={false}
                          speed={3}
                          className="custom-class"
                        />
                      </div>
                    )}
                    {/* AI Response: Render GroqCloud plain text */}
                    {grokcloudResponse &&
                      grokcloudResponse !== 'Error verifying with GroqCloud.' &&
                      !isReverifying && (
                        <div className="mt-2">
                          <div
                            className="rounded-3xl border bg-accent/10 border-accent/20 text-white p-4 text-sm"
                            style={{ overflowX: 'auto' }}
                          >
                            {grokcloudResponse}
                          </div>
                        </div>
                      )}
                    {/* Error message if AI verification fails */}
                    {grokcloudResponse === 'Error verifying with GroqCloud.' && !isReverifying && (
                      <div className="mt-2 text-red-400 text-sm">
                        AI verification failed. Please check your connection and retry.
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-4">
                {/* Handler: Show warning if all subjects are skipped (all sections full) */}
                {resolvedTimetable &&
                  Array.isArray(Object.values(resolvedTimetable)) &&
                  Object.values(resolvedTimetable).every(day => Array.isArray(day) && day.length === 0) && (
                    <div className="p-4 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-700 text-sm font-semibold">
                      All selected subjects are marked as Full in all sections. No classes will be
                      scheduled in your timetable.
                    </div>
                  )}
                {/* Timetable by Day */}
                {resolvedTimetable
                  ? renderTimetableByDay(resolvedTimetable)
                  : (
                    <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-700 text-sm font-semibold">
                      No timetable data available.
                    </div>
                  )}

                {/* Resolution Progress */}
                {isResolving && (
                  <div className="p-4 rounded-3xl border bg-blue-500/10 border-blue-500/20 text-blue-400">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                      <div className="font-semibold">Resolving Conflicts...</div>
                      <div className="text-sm">({Math.round(resolutionProgress)}%)</div>
                    </div>
                    <div className="w-full bg-blue-400/20 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-blue-400 h-1.5 rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${resolutionProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm opacity-80">
                      Analyzing {selectedSubjects.length} subjects across all available sections...
                    </div>
                  </div>
                )}

                {/* Resolution Details (if any) */}
                {resolutionDetails.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-white text-sm mb-2">
                      Conflict Details:
                    </div>
                    {resolutionDetails.slice(0, 5).map((detail, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="text-red-400 text-sm font-semibold">
                          {detail.subject1} ↔ {detail.subject2}
                        </div>
                        <div className="text-red-300 text-xs">
                          Both scheduled on {detail.day} at overlapping times
                        </div>
                        <div className="text-white/60 text-xs">
                          {detail.subject1}: {detail.time1} | {detail.subject2}: {detail.time2}
                        </div>
                      </div>
                    ))}
                    {resolutionDetails.length > 5 && (
                      <div className="text-white/50 text-xs text-center">
                        ... and {resolutionDetails.length - 5} more conflicts
                      </div>
                    )}
                  </div>
                )}

                {/* Resolution Suggestions with conflict details */}
                {resolutionSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-semibold text-white text-sm mb-2">Suggestions:</div>
                    {resolutionSuggestions.map((suggestion, idx) => {
                      // Handler: Show conflict details for subjects with multiple conflicts
                      const conflictDays = []
                      if (resolvedTimetable) {
                        Object.entries(resolvedTimetable).forEach(([day, classes]) => {
                          if (
                            classes.some(cls => (cls.subject || cls.course) === suggestion.subject)
                          ) {
                            conflictDays.push(day)
                          }
                        })
                      }
                      return (
                        <div key={idx} className="p-3 rounded-xl bg-white/2 border border-white/10">
                          <div className="font-semibold text-accent text-sm mb-1">
                            {suggestion.subject}
                          </div>
                          <div className="text-white/70 text-sm">{suggestion.message}</div>
                          {suggestion.alternatives.length > 0 && (
                            <div className="mt-2 text-xs text-white/50">
                              Available in:{' '}
                              {suggestion.alternatives
                                .map(alt => `${alt.degree} S${alt.semester}-${alt.section}`)
                                .join(', ')}
                            </div>
                          )}
                          {/* Show conflict days if more than one */}
                          {conflictDays.length > 1 && (
                            <div className="mt-2 text-xs text-yellow-400">
                              Conflicts occur on: {conflictDays.join(', ')}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="flex-shrink-0 w-full max-w-md mx-auto px-2 pt-4 pb-6">
        <div className="flex flex-col gap-3 w-full">
          {/* Navigation buttons */}
          <div className="flex flex-row gap-3 items-stretch justify-center w-full h-11">
            <button
              className=" px-4 rounded-3xl h-full w-full text-[15px] transition shadow-md bg-white/10 border text-white border-accent/5 hover:bg-accent/10 flex items-center justify-center"
              onClick={() =>
                navigate('/preferences', {
                  state: {
                    selectedSubjects,
                    userPreferences,
                  },
                })
              }
            >
              Back
            </button>
            <button
              className={` px-4 rounded-3xl w-full h-full text-[15px] transition shadow-md flex items-center justify-center
                ${selectedSubjects.length > 0 && resolvedTimetable && Object.values(resolvedTimetable).some(day => 
                  Array.isArray(day) && day.length > 0
                ) ? 'bg-accent text-white' : 'bg-accent/40 text-white/60'}
            `}
              disabled={selectedSubjects.length === 0 || isUploading || !resolvedTimetable || !Object.values(resolvedTimetable).some(day => 
                Array.isArray(day) && day.length > 0
              )}
              onClick={async () => {
                const hasAnyClasses = resolvedTimetable && Object.values(resolvedTimetable).some(day => 
                  Array.isArray(day) && day.length > 0
                )
                if (selectedSubjects.length > 0 && resolvedTimetable && hasAnyClasses) {
                  setIsUploading(true)
                  setUploadProgress(0)
                  // Animate progress bar
                  let currentProgress = 0
                  const progressIncrement = 2
                  const intervalTime = 20
                  const progressInterval = setInterval(() => {
                    currentProgress += progressIncrement
                    setUploadProgress(Math.min(currentProgress, 95)) // Stop at 95% until upload finishes
                  }, intervalTime)
                  const timetableData = {
                    subjects: selectedSubjects,
                    timetable: resolvedTimetable,
                    isCustom: true,
                    isAutoResolved: true,
                    hasConflicts: conflictSubjects.length > 0,
                    conflictSubjects: conflictSubjects,
                    resolutionSuggestions: resolutionSuggestions,
                    resolutionSuccess: resolutionSuccess,
                    resolutionDetails: resolutionDetails,
                    aiReview: grokcloudResponse,
                    studentType: 'lagger',
                    userPreferences: userPreferences
                  }
                  try {
                    const {
                      data: { user },
                    } = await supabase.auth.getUser()
                    if (!user) {
                      setErrorMsg('You need to log in to continue.')
                      clearInterval(progressInterval)
                      setIsUploading(false)
                      setUploadProgress(0)
                      return
                    }
                    const { error } = await supabase.from('user_timetables').upsert(
                      [
                        {
                          user_id: user.id,
                          timetable_data: timetableData,
                          onboarding_mode: 'lagger',
                        },
                      ],
                      { onConflict: ['user_id'], ignoreDuplicates: false }
                    )
                    if (error) {
                      setErrorMsg('Could not save your timetable. Please try again.')
                      clearInterval(progressInterval)
                      setIsUploading(false)
                      setUploadProgress(0)
                      return
                    }
                    localStorage.setItem('timetableData', JSON.stringify(timetableData))
                    localStorage.setItem('onboardingComplete', 'true')
                    localStorage.setItem('onboardingMode', 'lagger')
                    setUploadProgress(100)
                    clearInterval(progressInterval)
                    setTimeout(() => {
                      setIsUploading(false)
                      setUploadProgress(0)
                      navigate('/home', {
                        state: {
                          ...timetableData,
                          studentType: 'lagger',
                        },
                      })
                    }, 300)
                  } catch {
                    setErrorMsg('Something went wrong. Please try again.')
                    clearInterval(progressInterval)
                    setIsUploading(false)
                    setUploadProgress(0)
                  }
                }
              }}
            >
              {isUploading ? (
                <div className="flex flex-col items-center w-full">
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full transition-all duration-75 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                'Done'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
