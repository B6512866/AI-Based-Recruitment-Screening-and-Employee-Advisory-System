import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface Message {
    id: number;
    from: "bot" | "user";
    text: string;
}

export default function EmployeeChat() {
    const { firstName } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            from: "bot",
            text: `สวัสดีครับ${firstName ? " คุณ" + firstName : ""}! ผมคือ HireAI Advisor 🤖\nคุณสามารถสอบถามเรื่องสวัสดิการ นโยบายบริษัท หรือระเบียบต่างๆ ได้เลยครับ`,
        },
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now(), from: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // placeholder bot reply
        setTimeout(() => {
            const botMsg: Message = {
                id: Date.now() + 1,
                from: "bot",
                text: "ขอบคุณสำหรับคำถามครับ กำลังพัฒนาระบบ AI ให้ตอบได้เร็วๆ นี้ครับ 🚧",
            };
            setMessages(prev => [...prev, botMsg]);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full p-6">
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""} max-w-[80%] ${msg.from === "user" ? "ml-auto" : ""}`}
                        >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 text-sm ${
                                msg.from === "bot"
                                    ? "bg-indigo-100 text-lg"
                                    : "bg-gradient-to-tr from-emerald-400 to-teal-500 text-white font-bold"
                            }`}>
                                {msg.from === "bot" ? "🤖" : (firstName?.[0] || "E")}
                            </div>
                            {/* Bubble */}
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                                msg.from === "bot"
                                    ? "bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-none"
                                    : "bg-[#6C63FF] text-white rounded-tr-none"
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        placeholder="ถามคำถามเรื่องนโยบายบริษัทที่นี่..."
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 focus:bg-white transition-all text-sm"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-[#6C63FF] hover:bg-[#5a52e0] text-white px-5 py-3 rounded-xl shadow shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
