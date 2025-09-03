import { MapPin } from 'lucide-react'

export default function ClassCard({
  classInfo,
  isCurrentClass,
  isNextClass,
  isPastClass,
  selection,
  calculateRemainingTime,
  calculateTimeUntilStart,
}) {
  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-200 ${
        isCurrentClass
          ? 'bg-gradient-to-r from-red-500/20 to-red-600/10 border-red-400/40 shadow-lg shadow-red-500/20'
          : isNextClass
            ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 border-blue-400/40 shadow-lg shadow-blue-500/20'
            : isPastClass
              ? 'bg-white/5 border-green-400/20'
              : 'bg-white/5 border-accent/10'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Left: Course details */}
          <div className="flex items-start gap-3 flex-1">
            {/* Status indicator */}
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                isCurrentClass
                  ? 'bg-red-400 animate-pulse shadow-lg shadow-red-400/50'
                  : isNextClass
                    ? 'bg-blue-400 shadow-lg shadow-blue-400/50'
                    : isPastClass
                      ? 'bg-green-400'
                      : 'bg-accent/60'
              }`}
            ></div>

            {/* Course info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className={`font-product-sans font-bold text-lg leading-tight ${
                    isPastClass ? 'text-white/60' : 'text-white'
                  }`}
                >
                  {classInfo.course}
                </h3>
                {isCurrentClass && (
                  <span className="bg-red-500/30 text-red-300 px-3 py-1 rounded-full text-xs font-product-sans font-bold animate-pulse">
                    ● LIVE
                  </span>
                )}
                {isNextClass && (
                  <span className="bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-product-sans font-bold">
                    ↗ NEXT
                  </span>
                )}
                {isPastClass && (
                  <span className="bg-green-500/30 text-green-300 px-3 py-1 rounded-full text-xs font-product-sans font-bold">
                    ✓ DONE
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div
                  className={`flex items-center gap-2 text-sm font-product-sans ${
                    isPastClass ? 'text-accent/50' : 'text-accent/80'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{classInfo.room}</span>
                </div>

                {classInfo.teacher && (
                  <div
                    className={`text-sm font-product-sans ${
                      isPastClass ? 'text-accent/40' : 'text-accent/60'
                    }`}
                  >
                    {classInfo.teacher}
                  </div>
                )}

                {/* Show degree/section for lagger students */}
                {selection && selection.studentType === 'lagger' && classInfo.degree && (
                  <div
                    className={`text-xs font-product-sans ${
                      isPastClass ? 'text-accent/30' : 'text-accent/50'
                    }`}
                  >
                    {classInfo.degree} • S{classInfo.semester}-{classInfo.section}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Time display */}
          <div className="text-right flex-shrink-0">
            <div
              className={`font-product-sans font-bold text-xl ${
                isPastClass
                  ? 'text-white/50'
                  : isCurrentClass
                    ? 'text-red-400'
                    : isNextClass
                      ? 'text-blue-400'
                      : 'text-white'
              }`}
            >
              {classInfo.start}
            </div>
            <div
              className={`font-product-sans text-sm ${
                isPastClass ? 'text-accent/40' : 'text-accent/60'
              }`}
            >
              to {classInfo.end}
            </div>

            {/* Dynamic status messages */}
            {isCurrentClass && (
              <div className="text-red-300 font-product-sans text-sm font-medium mt-2 bg-red-500/20 px-3 py-1.5 rounded-lg">
                {calculateRemainingTime(classInfo.end)}
              </div>
            )}

            {isNextClass && (
              <div className="text-blue-300 font-product-sans text-sm font-medium mt-2 bg-blue-500/20 px-3 py-1.5 rounded-lg">
                {calculateTimeUntilStart(classInfo.start)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
