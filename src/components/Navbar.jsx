import { useNavigate } from "react-router-dom";

export default function Navbar({ currentPage = "home" }) {
    const navigate = useNavigate();

    const menuItems = [
        { id: "home", label: "Home", icon: "🏠", path: "/" },
        { id: "unihub", label: "UniHub", icon: "🎓", path: "/subjects" },
        { id: "settings", label: "Settings", icon: "⚙️", path: "/settings" }
    ];

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <>
            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 bg-black/10 backdrop-blur-sm border-t border-accent/20 z-40 rounded-full">
                <div className="flex items-center justify-around py-3 px-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            className={`flex flex-row items-center py-1 px-3 rounded-full transition-all duration-200 ${
                                currentPage === item.id
                                    ? "text-accent bg-accent/10"
                                    : "text-white/70 hover:text-accent hover:bg-accent/5"
                            }`}
                        >
                            <span className="text-xl mb-1">{item.icon}</span>
                            <span className="text-xs font-product-sans">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
