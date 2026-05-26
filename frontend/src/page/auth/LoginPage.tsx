import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      // เก็บ token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      onOpenChange(false);

      // redirect ตาม role
      if (data.role === "hr") {
        navigate("/dashboard");
      } else {
        navigate("/chatbot");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อ server ได้");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-[#1e2761] mb-2">เข้าสู่ระบบ</h2>
        <p className="text-slate-400 text-sm mb-6">HR AI System</p>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#1e2761]"
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#1e2761]"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#1e2761] text-white font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>

        <button
          onClick={() => onOpenChange(false)}
          className="w-full mt-3 text-slate-400 hover:text-slate-600 text-sm transition"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}