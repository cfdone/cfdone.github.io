import logo from '../../assets/logo.svg'

export default function Header({
  greeting,
  currentDay,
  formattedTime,
  selection,
}) {

  // Removed getReferenceMinutes helper (no longer needed)
  return (
    <div className="flex-shrink-0 bg-black/90 backdrop-blur-md p-4 pb-1 pt-8 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <div>
              <h1 className=" text-white text-2xl font-semibold mb-1">{greeting}</h1>
              <div className="flex gap-2  items-center">
                <p className="text-white/90 text-lg  font-semibold">{formattedTime}</p>
                <span className="h-1 w-1 bg-white rounded-full"></span>
                <p className="text-accent  text-base">{currentDay}</p>
              </div>

              {/* Show degree/section info only for regular students */}
              {selection && selection.studentType === 'regular' && selection.degree && (
                <p className="text-white/60 text-sm  mt-1">
                  {selection.degree} • S{selection.semester}-{selection.section}
                </p>
              )}
            </div>

            <div>
              <img src={logo} alt="CFD Logo" className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
