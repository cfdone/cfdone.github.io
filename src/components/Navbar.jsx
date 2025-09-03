import { useNavigate } from 'react-router-dom'
import { Home, GraduationCap, Settings, Calendar } from 'lucide-react'

export default function Navbar({ currentPage = 'home' }) {
  const navigate = useNavigate()

  const menuItems = [
    { id: 'home', label: 'Home', Icon: Home, path: '/' },

    { id: 'unihub', label: 'UniHub', Icon: GraduationCap, path: '/timetable' },
    { id: 'settings', label: 'Settings', Icon: Settings, path: '/settings' },
  ]

  const handleNavigation = path => {
    navigate(path)
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md border border-accent/20 z-50 rounded-full shadow-lg">
        <div className="flex items-center justify-around py-3 px-4">
          {menuItems.map(item => {
            const IconComponent = item.Icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-row items-center py-1 px-3 rounded-full transition-all duration-200 ${
                  currentPage === item.id
                    ? 'text-accent bg-accent/10'
                    : 'text-white/70 hover:text-accent hover:bg-accent/5'
                }`}
              >
                <IconComponent className="w-5 h-5 mb-1 mr-1" />
                <span className="text-xs font-product-sans">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
