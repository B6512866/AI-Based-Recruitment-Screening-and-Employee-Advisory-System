import { Bell } from "lucide-react";

export default function NotificationsPage() {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800">การแจ้งเตือน</h1>
                <p className="text-slate-400 text-sm mt-1">การแจ้งเตือนและข่าวสารจากบริษัท</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-center">
                    <p className="text-slate-700 font-bold text-lg">ไม่มีการแจ้งเตือน</p>
                    <p className="text-slate-400 text-sm mt-1">การแจ้งเตือนใหม่จะปรากฏที่นี่</p>
                </div>
            </div>
        </div>
    );
}
