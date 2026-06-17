import { useAuth } from "../../context/AuthContext";

export default function HRDashboard() {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 font-sans">HR Dashboard</h1>
                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl transition-all"
                    >
                        Logout
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-400 uppercase text-xs mb-2">Total Candidates</h3>
                        <p className="text-4xl font-black text-[#6C63FF]">128</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-400 uppercase text-xs mb-2">To Review</h3>
                        <p className="text-4xl font-black text-amber-500">24</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-400 uppercase text-xs mb-2">Hired</h3>
                        <p className="text-4xl font-black text-emerald-500">12</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
