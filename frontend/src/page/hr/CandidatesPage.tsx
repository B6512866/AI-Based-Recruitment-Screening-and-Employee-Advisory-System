import { Users, Search } from "lucide-react";

export default function CandidatesPage() {
    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">ผู้สมัคร</h1>
                    <p className="text-slate-400 text-sm mt-1">รายชื่อผู้สมัครทั้งหมดในระบบ</p>
                </div>
                {/* Search */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ค้นหาผู้สมัคร..."
                        className="outline-none text-sm text-slate-700 placeholder:text-slate-400 w-48"
                    />
                </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center">
                    <p className="text-slate-700 font-bold text-lg">ยังไม่มีผู้สมัคร</p>
                    <p className="text-slate-400 text-sm mt-1">ผู้สมัครจะปรากฏที่นี่เมื่อมีการสมัครงาน</p>
                </div>
            </div>
        </div>
    );
}
