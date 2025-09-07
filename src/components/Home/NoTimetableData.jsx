import { BookOpen } from 'lucide-react'
import Navbar from '../Navbar'

export default function NoTimetableData() {
  return (
    <div className="fixed inset-0 bg-black">
      <div className="h-full overflow-y-auto no-scrollbar relative z-10 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-accent" />
          </div>
          <h2 className="font-product-sans text-white font-semibold text-2xl mb-4">
            No Timetable Data
          </h2>
          <p className="text-white/70 font-product-sans text-center max-w-sm">
            Please go back and select your degree, semester, and section to view your class
            schedule.
          </p>
          <div className="mt-8">
            <div className="bg-white/5 p-4 rounded-xl border border-accent/10">
              <p className="text-accent opacity-80 text-sm font-product-sans">
                Need help? Check the settings page for more options.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40">
        <Navbar currentPage="home" />
      </div>
    </div>
  )
}
