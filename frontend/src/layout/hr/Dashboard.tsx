import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Users, Briefcase, CalendarCheck, Clock } from "lucide-react";

// ──────────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: number;
    change: string;
    changePositive?: boolean;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
}

function StatCard({ label, value, change, changePositive = true, icon: Icon, iconBg, iconColor }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
                <span className="text-slate-500 text-sm font-medium">{label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
                </div>
            </div>
            <div>
                <p className="text-3xl font-black text-slate-800">{value}</p>
                <p className={`text-xs font-semibold mt-1 ${changePositive ? "text-emerald-500" : "text-red-400"}`}>
                    {change}
                </p>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Section Card (empty placeholder)
// ──────────────────────────────────────────────
function SectionCard({ title }: { title: string }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
                <h3 className="text-slate-700 font-bold text-base">{title}</h3>
            </div>
            <div className="px-6 py-8 flex items-center justify-center">
                <p className="text-slate-300 text-sm">ยังไม่มีข้อมูล</p>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────
export default function HRDashboard() {
    const { firstName, lastName } = useAuth();
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || "HR Admin";

    const stats: StatCardProps[] = [
        {
            label: "ตำแหน่งงานที่เปิดอยู่",
            value: 6,
            change: "+6 จากเดือนที่แล้ว",
            changePositive: true,
            icon: Briefcase,
            iconBg: "bg-indigo-50",
            iconColor: "text-[#6C63FF]",
        },
        {
            label: "ผู้สมัคร รอพิจารณา",
            value: 105,
            change: "+10 จากปีก่อกหน้า",
            changePositive: true,
            icon: Users,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
        },
        {
            label: "ผู้สมัคร คุณสมบัติผ่านเกณฑ์",
            value: 50,
            change: "+2 จากปีก่อกหน้า",
            changePositive: true,
            icon: Users,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
        },
        {
            label: "ผู้สมัคร รอสัมภาษณ์",
            value: 3,
            change: "นัดก่อนหลัง 5 วัน",
            changePositive: false,
            icon: CalendarCheck,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500",
        },
    ];

    return (
        <div className="p-8 space-y-6">
            {/* Welcome Banner */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-8 py-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">
                        ยินดีต้อนรับ คุณ{fullName}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">ระบบจัดสรรทรัพยากรมนุษย์</p>
                </div>
                <div className="hidden md:flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#4834d4] items-center justify-center shadow-md shadow-indigo-200">
                    <Clock className="w-7 h-7 text-white" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Mid sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SectionCard title="ตำแหน่งงาน" />
                <SectionCard title="นัดหมายสัมภาษณ์" />
            </div>

            {/* Bottom section */}
            <SectionCard title="ผู้สมัคร" />
        </div>
    );
}
