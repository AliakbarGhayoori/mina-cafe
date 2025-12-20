"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IntroAnimation } from "@/components/IntroAnimation";

export default function Home() {
  const [lang, setLang] = useState<"en" | "fa">("fa");

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      lang === "fa" ? "rtl" : "ltr"
    );
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  return (
    <main 
      className={`min-h-screen flex flex-col items-center justify-center gap-6 px-4 relative ${
        lang === "fa" ? "font-persian" : ""
      }`}
      style={{ 
        fontFamily: lang === "fa" 
          ? '"Vazirmatn", "Vazir", "Tahoma", sans-serif' 
          : '"Shadows Into Light", cursive' 
      }}
    >
      {/* Background Image with Opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/bg.png)',
          opacity: 0.4,
          zIndex: 0
        }}
      />
      
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-black"
        style={{
          opacity: 0.5,
          zIndex: 1
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full">
        <IntroAnimation lang={lang} onLangChange={setLang} />
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link
            href="/website"
            className="rounded-full px-6 py-3 bg-black text-white text-sm font-medium transition-all duration-200 hover:bg-gray-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black focus:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {lang === "fa" ? "باز کردن منو" : "Open Menu"}
          </Link>
        </div>
      </div>
    </main>
  );
}
