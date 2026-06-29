import { FileText } from "lucide-react";

export default function DocumentsPage() {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800">เอกสารของฉัน</h1>
                <p className="text-slate-400 text-sm mt-1">เอกสารและสัญญาจ้างงาน</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center">
                    <p className="text-slate-700 font-bold text-lg">ยังไม่มีเอกสาร</p>
                    <p className="text-slate-400 text-sm mt-1">เอกสารของคุณจะแสดงที่นี่</p>
                </div>
            </div>
        </div>
    );
}
