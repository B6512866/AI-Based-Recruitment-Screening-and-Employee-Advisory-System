import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";


// ── NAVBAR ──────────────────────────────────────────
export function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="sticky top-0 z-50 bg-[#1e2761] flex justify-between items-center px-8 py-4 shadow-md">
      <div className="text-white font-bold text-xl">🤖 HR AI System</div>
      <div className="flex gap-4 items-center">
        <a href="#solution" className="text-slate-300 hover:text-white text-sm transition">Solution</a>
        <a href="#features" className="text-slate-300 hover:text-white text-sm transition">Features</a>
        <button
          onClick={() => navigate("/login")}
          className="bg-[#c9a84c] hover:opacity-85 text-white font-semibold px-5 py-2 rounded-lg text-sm transition"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    </nav>
  );
}

// ── HERO ─────────────────────────────────────────────
export function Hero() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[85vh] bg-gradient-to-br from-[#1e2761] to-[#2e3e8a] flex items-center justify-center text-center px-4">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
          ระบบ HR อัจฉริยะ
        </h1>
        <p className="text-[#aaccee] text-xl mb-8">
          คัดกรองผู้สมัคร · ตอบคำถามพนักงาน · ลดภาระงาน HR
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate("/login")}
            className="bg-[#c9a84c] hover:opacity-85 text-white font-bold px-8 py-3 rounded-lg text-lg transition"
          >
            เริ่มใช้งาน
          </button>
          
            <a href="#solution"
            className="border-2 border-white text-white hover:bg-white hover:text-[#1e2761] font-bold px-8 py-3 rounded-lg text-lg transition"
          >
            ดูฟีเจอร์
          </a>
        </div>
      </div>
    </div>
  );
}

// ── MARQUEE STRIP ─────────────────────────────────────
const marqueeItems = [
  "🔵 DeepSeek OCR",
  "🦙 Meta Llama 3",
  "🌪️ Typhoon 2",
  "🐹 Go + Gin",
  "⚛️ React + TypeScript",
  "🐘 PostgreSQL",
  "🐳 Docker",
];

export function MarqueeStrip() {
  return (
    <div className="bg-[#1e2761] py-3 overflow-hidden">
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="text-[#c9a84c] font-semibold text-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── PROBLEM SECTION ───────────────────────────────────
const problems = [
  { icon: "⏰", title: "เสียเวลา", desc: "HR ต้องอ่านใบสมัครทีละใบ ใช้เวลานานมาก" },
  { icon: "❌", title: "เกิดข้อผิดพลาด", desc: "การคัดกรองด้วยมือมีโอกาสพลาดผู้สมัครที่ดี" },
  { icon: "🕐", title: "พนักงานรอนาน", desc: "พนักงานต้องรอ HR ตอบคำถามนโยบาย" },
];

export function ProblemSection() {
  return (
    <div className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#1e2761] mb-4">ปัญหาที่เราแก้</h2>
        <p className="text-slate-500 mb-12">ระบบ HR แบบเดิมมีข้อจำกัดมากมาย</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <div key={i} className="bg-[#eef1fb] rounded-xl p-6">
              <div className="text-4xl mb-3">{p.icon}</div>
              <h3 className="text-lg font-bold text-[#1e2761] mb-2">{p.title}</h3>
              <p className="text-slate-500 text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FEATURES ──────────────────────────────────────────
const features = [
  {
    icon: "📄",
    badge: "DeepSeek OCR",
    badgeColor: "bg-blue-500",
    title: "อ่าน Resume อัตโนมัติ",
    desc: "ดึงข้อมูลจากใบสมัครภาษาไทย-อังกฤษได้ในไม่กี่วินาที",
  },
  {
    icon: "🦙",
    badge: "Meta Llama 3",
    badgeColor: "bg-purple-500",
    title: "คัดกรองและให้คะแนน",
    desc: "วิเคราะห์ความเหมาะสมของผู้สมัครและให้คะแนน 0–100",
  },
  {
    icon: "🌪️",
    badge: "Typhoon 2",
    badgeColor: "bg-teal-500",
    title: "Chatbot HR ภาษาไทย",
    desc: "ตอบคำถามนโยบายบริษัทได้ตลอด 24 ชั่วโมง",
  },
];

export function Features() {
  return (
    <div className="py-20 px-4 bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#1e2761] mb-4">ฟีเจอร์หลัก</h2>
        <p className="text-slate-500 mb-12">ขับเคลื่อนด้วย AI 3 โมเดลที่ทำงานร่วมกัน</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-md hover:-translate-y-1 transition-transform">
              <div className="text-4xl mb-3">{f.icon}</div>
              <span className={`${f.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {f.badge}
              </span>
              <h3 className="text-lg font-bold text-[#1e2761] mt-3 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-[#1e2761] text-[#aaccee] text-center py-6 text-sm">
      <p className="font-semibold text-white mb-1">CPE Pre Cap-Stone Project G12</p>
      <p>นายภาณุ อุตะโว · นายเจษฎา เชือดขุนทด · นายธนัช ตั้งมั่น · นายอิสรภาพ วาตุรัมย์</p>
    </footer>
  );
}