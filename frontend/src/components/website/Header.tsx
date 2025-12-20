type HeaderProps = {
  lang: "en" | "fa";
  onLangChange: (lang: "en" | "fa") => void;
};

export function Header({ lang, onLangChange }: HeaderProps) {
  const isFa = lang === "fa";
  return (
    <header className="flex items-center justify-between pt-0 pb-4 border-b border-gray-200">
      <div className="flex flex-col items-center relative">
        <img
          src="/images/top-logo.png"
          alt="Cafe Cup"
          className="h-3 w-auto mb-0"
        />
        <img
          src="/images/mainlogo.png"
          alt="Mina Cafe Logo"
          className="h-10 w-auto"
        />
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => onLangChange("fa")}
          className={`px-3 py-1.5 rounded transition-all duration-200 ${
            isFa
              ? "bg-black text-white shadow-md scale-105"
              : "border border-gray-300 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:scale-110 active:scale-95`}
        >
          {isFa ? "فارسی" : "FA"}
        </button>
        <button
          type="button"
          onClick={() => onLangChange("en")}
          className={`px-3 py-1.5 rounded transition-all duration-200 ${
            !isFa
              ? "bg-black text-white shadow-md scale-105"
              : "border border-gray-300 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:scale-110 active:scale-95`}
        >
          {!isFa ? "English" : "EN"}
        </button>
      </div>
    </header>
  );
}


