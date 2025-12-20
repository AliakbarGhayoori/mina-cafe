import type { Category } from "@/types";

type Props = {
  categories: Category[];
  activeId?: string;
  onChange: (id?: string) => void;
  lang: "en" | "fa";
};

export function CategoryFilter({ categories, activeId, onChange, lang }: Props) {
  const titleKey = lang === "fa" ? "titleFa" : "titleEn";

  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      <button
        key="all"
        type="button"
        onClick={() => onChange(undefined)}
        className={`px-3 py-1 rounded-full border text-xs ${
          !activeId ? "bg-black text-white border-black" : "border-gray-300"
        }`}
      >
        {lang === "fa" ? "همه" : "All"}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
            activeId === cat.id
              ? "bg-black text-white border-black"
              : "border-gray-300"
          }`}
        >
          {cat[titleKey]}
        </button>
      ))}
    </div>
  );
}


