import logo from '../../assets/logo.svg'

export default function Header({
  greeting,
  currentDay,
  formattedTime,
  selection,
  doneClasses,
  totalClasses,
}) {
  return (
    <div className="flex-shrink-0 bg-black/90 backdrop-blur-md p-4 pb-1 pt-8 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-product-sans text-white text-2xl font-bold mb-1">{greeting}</h1>
              <p className="text-accent font-product-sans text-base">{currentDay}</p>
              <p className="text-white/90 text-lg font-product-sans font-medium">{formattedTime}</p>
              {/* Show degree/section info only for regular students */}
              {selection && selection.studentType === 'regular' && selection.degree && (
                <p className="text-white/60 text-sm font-product-sans mt-1">
                  {selection.degree} • S{selection.semester}-{selection.section}
                </p>
              )}
            </div>

            <div>
              <img src={logo} alt="CFD Logo" className="h-10 w-10" />
            </div>
          </div>

          {/* Progress Summary in header */}
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 rounded-xl border border-accent/10 mt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-accent font-product-sans font-semibold text-sm">
                  Today's Schedule
                </span>
              </div>
              <div className="text-accent/80 font-product-sans text-sm">
                {doneClasses} of {totalClasses} completed
              </div>
            </div>
            {/* Progress bar */}
            <div className="bg-white/10 rounded-full h-1.5">
              <div
                className="bg-accent rounded-full h-full transition-all duration-500"
                style={{
                  width: `${totalClasses > 0 ? (doneClasses / totalClasses) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
