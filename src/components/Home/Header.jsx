import logo from '../../assets/logo.svg'
import NextClassCard from './NextClassCard'
import CurrentClassCard from './CurrentClassCard'
import { useState } from 'react'

export default function Header({
  greeting,
  currentDay,
  formattedTime,
  selection,
  doneClasses,
  totalClasses,
  nextClass,
  currentClass,
  sortedTodayClasses,
  calculateTimeUntilStart,
  calculateRemainingTime,
  syncStatus,
  isOnline,
  onRetrySync,
}) {
  const [showCards, setShowCards] = useState(false)

  const toggleCards = () => {
    setShowCards(!showCards)
  }
  return (
    <div className="flex-shrink-0 bg-black/90 backdrop-blur-md p-4 pb-1 pt-8 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-product-sans text-white text-2xl font-bold mb-1">{greeting}</h1>
              <div className='flex gap-2  items-center'> 
              <p className="text-white/90 text-lg font-product-sans font-black">{formattedTime}</p>
              <span className='h-1 w-1 bg-white rounded-full'></span>
              <p className="text-accent font-product-sans text-base">{currentDay}</p>
              </div>
             
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
          
          <div className="flex items-center justify-center mt-3">
            <button 
              onClick={toggleCards} 
              className="bg-accent/10 hover:bg-accent/20 text-accent rounded-full p-1 transition-all duration-200"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform duration-300 ${showCards ? 'transform rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className={`flex flex-col gap-2.5 transition-all duration-300 ${showCards ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>       

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

 {/* CurrentClassCard and NextClassCard */}
          {currentClass && (
            <CurrentClassCard
              currentClass={currentClass}
              sortedTodayClasses={sortedTodayClasses}
              totalClasses={totalClasses}
              calculateRemainingTime={calculateRemainingTime}
              syncStatus={syncStatus}
              isOnline={isOnline}
              onRetrySync={onRetrySync}
            />
          )}
          
          <NextClassCard
            nextClass={nextClass}
            currentClass={currentClass}
            sortedTodayClasses={sortedTodayClasses}
            totalClasses={totalClasses}
            calculateTimeUntilStart={calculateTimeUntilStart}
          />
          
          </div>  

        </div>
      </div>
    </div>
  )
}
