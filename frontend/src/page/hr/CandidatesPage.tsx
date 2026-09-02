import { useState, useEffect } from "react";
import { Search, Sparkles, CheckCircle2, AlertCircle, Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

interface CandidateItem {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    aiScore: number;
    status: string;
    appliedDate: string;
}

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<CandidateItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<string>("ทั้งหมด");

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get("/interviews/candidates");
            if (res.data && res.data.data) {
                const list: CandidateItem[] = res.data.data.map((app: any) => {
                    const cand = app.Candidate || {};
                    const score = app.AIScreening?.skill_score !== undefined ? app.AIScreening.skill_score : 0;
                    const dateStr = app.created_at || app.CreatedAt
                        ? new Date(app.created_at || app.CreatedAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        })
                        : "ไม่ระบุ";

                    return {
                        id: app.ID ? app.ID.toString() : app.id?.toString() || "0",
                        name: cand.first_name ? `${cand.first_name} ${cand.last_name}` : "ไม่ระบุชื่อ",
                        email: cand.email || "-",
                        phone: cand.phone || "-",
                        position: app.JobPosition?.title || app.position || "ไม่ระบุตำแหน่ง",
                        aiScore: score,
                        status: app.status || "รอพิจารณา",
                        appliedDate: dateStr
                    };
                });

                // จัดลำดับ PTS (คะแนน AI) จากมากไปน้อย โดยเริ่มต้นจาก 0
                list.sort((a, b) => b.aiScore - a.aiScore);

                setCandidates(list);
            }
        } catch (err) {
            console.error("Error fetching candidates:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const filtered = candidates.filter(c => {
        const matchSearch = c.name.includes(search) || c.position.includes(search) || c.email.includes(search);
        const matchTab = activeTab === "ทั้งหมด" || c.status === activeTab;
        return matchSearch && matchTab;
    });

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">จัดลำดับและโปรไฟล์ผู้สมัคร (PTS Ranking)</h1>
                    <p className="text-slate-400 text-sm mt-1">รายชื่อผู้สมัครทั้งหมด เรียงลำดับตามคะแนน PTS (เริ่มต้นที่ 0 ถึง 100 คะแนน)</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchCandidates}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        รีเฟรชข้อมูล
                    </button>
                    <Link
                        to="/hr/screening"
                        className="flex items-center gap-2 bg-[#4169E1] hover:bg-[#3152c4] text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-200 text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        คัดกรอง Resume ด้วย AI
                    </Link>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0">
                    {["ทั้งหมด", "รอพิจารณา", "ผ่านการคัดเลือก", "interview", "ปฏิเสธ"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab
                                ? "bg-indigo-50 text-[#4169E1]"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                        >
                            {tab === "interview" ? "นัดสัมภาษณ์แล้ว" : tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="ค้นหาชื่อ, ตำแหน่ง..."
                        className="bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 w-48"
                    />
                </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-sans">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider font-bold">
                                <th className="py-3.5 px-6">อันดับ</th>
                                <th className="py-3.5 px-6">ผู้สมัคร</th>
                                <th className="py-3.5 px-6">ตำแหน่งที่สมัคร</th>
                                <th className="py-3.5 px-6">คะแนน PTS (0-100)</th>
                                <th className="py-3.5 px-6">สถานะ</th>
                                <th className="py-3.5 px-6">วันที่ยื่นสมัคร</th>
                                <th className="py-3.5 px-6 text-right">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm text-slate-700 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        กำลังโหลดข้อมูลผู้สมัคร...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        ยังไม่มีข้อมูลผู้สมัครในระบบ
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c, index) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="py-4 px-6 font-mono font-bold text-slate-400">
                                            #{index + 1}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-bold text-slate-800">{c.name}</p>
                                                <p className="text-slate-400 text-xs mt-0.5">{c.email} • {c.phone}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600 font-semibold">{c.position}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${c.aiScore >= 80 ? "bg-emerald-500" : c.aiScore >= 50 ? "bg-amber-500" : c.aiScore > 0 ? "bg-rose-500" : "bg-slate-300"}`}
                                                        style={{ width: `${c.aiScore}%` }}
                                                    />
                                                </div>
                                                <span className={`font-extrabold text-xs font-mono ${c.aiScore >= 80 ? "text-emerald-600" : c.aiScore >= 50 ? "text-amber-600" : "text-slate-500"}`}>
                                                    {c.aiScore} PTS
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.status === "ผ่านการคัดเลือก"
                                                ? "bg-emerald-50 text-emerald-600"
                                                : c.status === "interview" || c.status === "นัดสัมภาษณ์แล้ว"
                                                    ? "bg-indigo-50 text-[#4169E1]"
                                                    : c.status === "ปฏิเสธ"
                                                        ? "bg-rose-50 text-rose-600"
                                                        : "bg-amber-50 text-amber-600"
                                                }`}>
                                                {c.status === "ผ่านการคัดเลือก" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                                {c.status === "interview" ? "นัดสัมภาษณ์แล้ว" : c.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-400 text-xs">{c.appliedDate}</td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                to="/hr/screening"
                                                className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-[#4169E1] hover:bg-indigo-50 rounded-lg transition-all"
                                                title="ดูข้อมูลและคัดกรอง"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
