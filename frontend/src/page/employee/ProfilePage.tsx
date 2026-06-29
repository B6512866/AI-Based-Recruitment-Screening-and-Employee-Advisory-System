import { useAuth } from "../../context/AuthContext";
import { User } from "lucide-react";

export default function EmployeeProfile() {
    const { firstName, lastName } = useAuth();
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Employee";

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800">ข้อมูลของฉัน</h1>
                <p className="text-slate-400 text-sm mt-1">ข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-black shadow-md">
                        {firstName?.[0] || "E"}
                    </div>
                    <div>
                        <p className="text-xl font-black text-slate-800">{fullName}</p>
                        <p className="text-slate-400 text-sm mt-1">พนักงาน</p>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-3 text-slate-300">
                    <User className="w-5 h-5" />
                    <span className="text-sm">ฟีเจอร์แก้ไขโปรไฟล์กำลังพัฒนา</span>
                </div>
            </div>
        </div>
    );
}
