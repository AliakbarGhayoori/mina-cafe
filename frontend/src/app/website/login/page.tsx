"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function WebsiteLoginPage() {
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSend() {
    setMessage(null);
    try {
      await api.post("/auth/user/send-otp", { mobile });
      setStep("verify");
      setMessage("کد ارسال شد");
    } catch {
      setMessage("خطا در ارسال کد");
    }
  }

  async function handleVerify() {
    setMessage(null);
    try {
      const res = await api.post("/auth/user/verify-otp", { mobile, code });
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", res.data.token);
      }
      setMessage("ورود موفق");
    } catch {
      setMessage("کد نامعتبر است");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-sm p-5 rtl">
        <h1 className="text-center font-bold mb-4">ورود کاربران</h1>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block mb-1">موبایل</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="مثلا 09120000000"
            />
          </div>
          {step === "verify" && (
            <div>
              <label className="block mb-1">کد پیامک شده</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="******"
              />
            </div>
          )}
          {message && (
            <p className="text-xs text-center text-gray-600">{message}</p>
          )}
          {step === "request" ? (
            <button
              type="button"
              onClick={handleSend}
              className="w-full mt-2 rounded-lg bg-black text-white py-2 text-sm"
            >
              دریافت کد
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVerify}
              className="w-full mt-2 rounded-lg bg-black text-white py-2 text-sm"
            >
              تایید کد
            </button>
          )}
        </div>
      </div>
    </main>
  );
}


