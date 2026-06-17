import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hrMenuItems } from "./hrMenu";
import { LogOut, Bell } from "lucide-react";

export default function HRLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-tr from-[#6C63FF] to-[#4834d4] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="text-slate-900 font-bold text-2xl tracking-tighter italic">Hire<span className="text-[#6C63FF]">AI</span></div>
                    </div>

                    <nav className="space-y-1">
                        {hrMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${isActive
                                        ? "bg-indigo-50 text-[#6C63FF] shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "text-[#6C63FF]" : "text-slate-400 group-hover:text-slate-600"}`} />
                                    {item.label}
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6C63FF]"></div>}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-4 rounded-2xl text-red-500 font-black text-sm hover:bg-red-50 transition-all active:scale-95"
                    >
                        <LogOut className="w-5 h-5" />
                        ออกจากระบบ
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex flex-col">
                        <h2 className="text-slate-900 font-black text-lg">ฝ่ายบริหารทรัพยากรบุคคล</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">HR Management Portal</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all border border-slate-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-slate-900 text-sm font-black">HR Admin</p>
                                <p className="text-[#6C63FF] text-[10px] font-black uppercase tracking-tighter">Premium Access</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=HR+Admin&background=6C63FF&color=fff" alt="Profile" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
