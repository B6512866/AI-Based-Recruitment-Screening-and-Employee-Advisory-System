import { useState } from "react";
import { Briefcase, Plus, Users, MapPin, DollarSign, Clock, MoreVertical } from "lucide-react";

interface JobPosition {
    id: string;
    title: string;
    department: string;
    location: string;
    salary: string;
    type: string;
    applicants: number;
    status: "เปิดรับสมัคร" | "ปิดรับสมัครแล้ว";
    postedDate: string;
}

const mockPositions: JobPosition[] = [
    { id: "1", title: "Senior Full-Stack Developer", department: "IT & Software Development", location: "กรุงเทพมหานคร (Hybrid)", salary: "65,000 - 95,000 บาท", type: "งานเต็มเวลา", applicants: 28, status: "เปิดรับสมัคร", postedDate: "15 มิ.ย. 2026" },
    { id: "2", title: "HR Business Partner", department: "Human Resources", location: "กรุงเทพมหานคร (On-site)", salary: "45,000 - 60,000 บาท", type: "งานเต็มเวลา", applicants: 14, status: "เปิดรับสมัคร", postedDate: "18 มิ.ย. 2026" },
    { id: "3", title: "UX/UI Designer", department: "Product Design", location: "กรุงเทพมหานคร (Remote)", salary: "40,000 - 65,000 บาท", type: "งานเต็มเวลา", applicants: 35, status: "เปิดรับสมัคร", postedDate: "20 มิ.ย. 2026" },
    { id: "4", title: "Data Analyst", department: "Business Intelligence", location: "กรุงเทพมหานคร (Hybrid)", salary: "35,000 - 55,000 บาท", type: "งานเต็มเวลา", applicants: 22, status: "เปิดรับสมัคร", postedDate: "22 มิ.ย. 2026" },
];

export default function PositionsPage() {
    const [positions] = useState<JobPosition[]>(mockPositions);

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">ตำแหน่งงาน</h1>
                    <p className="text-slate-400 text-sm mt-1">จัดการตำแหน่งงานที่เปิดรับสมัครในองค์กร</p>
                </div>
                <button className="flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95 text-sm">
                    <Plus className="w-4 h-4" />
                    เพิ่มตำแหน่งงาน
                </button>
            </div>

            {/* Grid of job positions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {positions.map(pos => (
                    <div key={pos.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider mb-2">
                                        {pos.department}
                                    </span>
                                    <h3 className="text-lg font-extrabold text-slate-800">{pos.title}</h3>
                                </div>
                                <button className="text-slate-300 hover:text-slate-600 p-1">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2 my-4 text-xs text-slate-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{pos.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                    <span>{pos.salary}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>{pos.type} • ประกาศเมื่อ {pos.postedDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#6C63FF]">
                                <Users className="w-4 h-4" />
                                <span>{pos.applicants} ผู้สมัคร</span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                                {pos.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
