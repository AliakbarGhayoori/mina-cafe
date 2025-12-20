import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  lang: "en" | "fa";
  onLoadMore: () => void;
  hasMore: boolean;
};

export function ProductList({ products, lang, onLoadMore, hasMore }: Props) {
  return (
    <div className="space-y-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} lang={lang} />
      ))}
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={onLoadMore}
            className="px-4 py-2 text-xs rounded-full border border-gray-300"
          >
            {lang === "fa" ? "موارد بیشتر" : "Load more"}
          </button>
        </div>
      )}
      {!hasMore && products.length > 0 && (
        <p className="text-center text-xs text-gray-400 pb-4">
          {lang === "fa" ? "تمام شد" : "No more items"}
        </p>
      )}
    </div>
  );
}


