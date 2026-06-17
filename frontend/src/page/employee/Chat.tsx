import { useAuth } from "../../context/AuthContext";

export default function EmployeeChat() {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center text-white font-bold italic">H</div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">HireAI Advisor</h1>
                </div>
                <button
                    onClick={logout}
                    className="text-slate-400 hover:text-red-500 font-bold transition-all text-sm px-4 py-2 rounded-lg hover:bg-red-50"
                >
                    ออกจากระบบ
                </button>
            </header>
            <main className="grow flex items-center justify-center p-4">
                <div className="w-full max-w-4xl h-[80vh] bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fadeIn">
                    <div className="grow p-8 overflow-y-auto bg-slate-50/30">
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-3 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                                    🤖
                                </div>
                                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-slate-700 leading-relaxed">
                                    สวัสดีครับ! ผมคือ **HireAI Advisor** ยินดีต้อนรับเข้าสู่ระบบครับ <br />
                                    คุณสามารถสอบถามเรื่องสวัสดิการ นโยบายบริษัท หรือระเบียบต่างๆ ได้เลยครับ
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
                        <input
                            type="text"
                            placeholder="ถามคำถามเรื่องนโยบายบริษัทที่นี่..."
                            className="grow bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:bg-white transition-all font-medium"
                        />
                        <button className="bg-[#6C63FF] text-white p-4 rounded-2xl shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
