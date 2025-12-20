"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAndRedirect() {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
      
      if (!token) {
        router.replace("/admin/login");
        return;
      }

      try {
        await api.get("/auth/admin/verify");
        router.replace("/admin/dashboard");
      } catch {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("token");
        }
        router.replace("/admin/login");
      } finally {
        setIsChecking(false);
      }
    }

    checkAndRedirect();
  }, [router]);

  if (isChecking) {
    return null;
  }

  return null;
}

