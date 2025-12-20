"use client";

import { useEffect, useState } from "react";

type Language = "en" | "fa";

type IntroAnimationProps = {
  lang?: Language;
  onLangChange?: (lang: Language) => void;
};

export function IntroAnimation({ lang: propLang, onLangChange }: IntroAnimationProps = {}) {
  const [lang, setLang] = useState<Language>("fa"); // Default to Persian
  const [isPersian, setIsPersian] = useState(true);
  const [showMainLogo, setShowMainLogo] = useState(false);
  const [showTopLogo, setShowTopLogo] = useState(false);
  const [showTitle1, setShowTitle1] = useState(false);
  const [showTitle2, setShowTitle2] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const currentLang = propLang || lang;

  useEffect(() => {
    if (propLang) {
      setIsPersian(propLang === "fa");
    }
  }, [propLang]);

  useEffect(() => {
    // Animation sequence
    setShowMainLogo(true);
    
    const topLogoTimer = setTimeout(() => {
      setShowTopLogo(true);
    }, 500);

    if (isPersian) {
      const title1Timer = setTimeout(() => {
        setShowTitle1(true);
      }, 1500);

      const title2Timer = setTimeout(() => {
        setShowTitle2(true);
      }, 2000);

      return () => {
        clearTimeout(topLogoTimer);
        clearTimeout(title1Timer);
        clearTimeout(title2Timer);
      };
    }

    return () => {
      clearTimeout(topLogoTimer);
    };
  }, [isPersian]);

  const handleLangChange = (newLang: Language) => {
    if (onLangChange) {
      onLangChange(newLang);
    } else {
      setLang(newLang);
      setIsPersian(newLang === "fa");
      setShowTitle1(false);
      setShowTitle2(false);
      if (newLang === "fa") {
        setTimeout(() => setShowTitle1(true), 100);
        setTimeout(() => setShowTitle2(true), 600);
      }
    }
    setShowLangDropdown(false);
  };

  return (
    <>
      {/* Language Dropdown - Fixed to top right */}
      <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50">
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            type="button"
          >
            <img
              src={currentLang === "fa" ? "/flags/iran.svg" : "/flags/uk.svg"}
              alt={currentLang === "fa" ? "Iran Flag" : "UK Flag"}
              className="w-5 h-5 object-contain"
            />
            <span className="text-sm font-medium">{currentLang.toUpperCase()}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showLangDropdown ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showLangDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowLangDropdown(false)}
              />
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px]">
                <button
                  onClick={() => handleLangChange("fa")}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    currentLang === "fa" ? "bg-gray-50" : ""
                  }`}
                  type="button"
                >
                  <img
                    src="/flags/iran.svg"
                    alt="Iran Flag"
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-sm">فارسی</span>
                </button>
                <button
                  onClick={() => handleLangChange("en")}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                    currentLang === "en" ? "bg-gray-50" : ""
                  }`}
                  type="button"
                >
                  <img
                    src="/flags/uk.svg"
                    alt="UK Flag"
                    className="w-5 h-5 object-contain"
                  />
                  <span className="text-sm">English</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative w-full flex flex-col items-center justify-center py-8 px-4">
        {/* Main Logo Container */}
      <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg flex items-center justify-center">
        {/* Main Logo */}
        <div
          className={`relative z-10 transition-opacity duration-1000 ${
            showMainLogo ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src="/images/mainlogo.png"
            alt="Mina Cafe Logo"
            className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md"
          />
        </div>

        {/* Top Logo */}
        {showTopLogo && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 z-20">
            <div className="relative w-full h-full">
              <img
                src="/images/top-logo.png"
                alt="Cafe Cup"
                className="w-64 h-auto sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] relative z-10 animate-scale-up animate-scale-pulse mb-8"
              />
            </div>
          </div>
        )}
      </div>

      {/* Persian Title Images */}
      {isPersian && (
        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg mt-8 space-y-4">
          {/* Title 1 */}
          <div
            className={`transition-all duration-1000 ease-out ${
              showTitle1
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <img
              src="/images/mina-cafe-fa-title1.png"
              alt="Mina Cafe Title 1"
              className="w-full h-auto"
            />
          </div>

          {/* Title 2 */}
          <div
            className={`transition-all duration-1000 ease-out ${
              showTitle2
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <img
              src="/images/mina-cafe-fa-title2.png"
              alt="Mina Cafe Title 2"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
