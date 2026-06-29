import { Briefcase, Plus } from "lucide-react";

export default function PositionsPage() {
    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">ตำแหน่งงาน</h1>
                    <p className="text-slate-400 text-sm mt-1">จัดการตำแหน่งงานที่เปิดรับสมัคร</p>
                </div>
                <button className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95">
                    <Plus className="w-4 h-4" />
                    เพิ่มตำแหน่งงาน
                </button>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-[#6C63FF]" />
                </div>
                <div className="text-center">
                    <p className="text-slate-700 font-bold text-lg">ยังไม่มีตำแหน่งงาน</p>
                    <p className="text-slate-400 text-sm mt-1">กดปุ่ม "เพิ่มตำแหน่งงาน" เพื่อเริ่มต้น</p>
                </div>
            </div>
        </div>
    );
}
