"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    async function checkAuth() {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
      if (token) {
        try {
          await api.get("/auth/admin/verify");
          // Already authenticated, redirect to dashboard
          router.push("/admin/dashboard");
        } catch {
          // Token is invalid, allow login
        }
      }
    }
    checkAuth();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("/auth/admin/login", { email, password });
      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", res.data.token);
      }
      if (typeof window !== "undefined") {
        window.location.href = "/admin/dashboard";
      }
    } catch {
      setError("ایمیل یا رمز عبور اشتباه است");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 rtl">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-center font-bold mb-4">ورود مدیر</h1>
        <form className="space-y-3 text-sm" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1">ایمیل</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">رمز عبور</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-center text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full mt-2 rounded-lg bg-black text-white py-2 text-sm"
          >
            ورود
          </button>
        </form>
      </div>
    </main>
  );
}


