"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { Category, Product } from "@/types";
import { Header } from "@/components/website/Header";
import { SearchBox } from "@/components/website/SearchBox";
import { CategoryFilter } from "@/components/website/CategoryFilter";
import { ProductList } from "@/components/website/ProductList";

export default function WebsitePage() {
  const [lang, setLang] = useState<"en" | "fa">("fa");
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      lang === "fa" ? "rtl" : "ltr"
    );
  }, [lang]);

  useEffect(() => {
    api
      .get<Category[]>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    // initial load (first 10 with special ordering handled by backend)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchProducts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, search]);

  async function fetchProducts(nextPage: number, replace = false) {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page: nextPage,
        limit: 10,
      };
      if (activeCategory) params.category = activeCategory;
      if (search) params.search = search;

      const res = await api.get<{
        items: Product[];
        total: number;
        page: number;
        limit: number;
      }>("/products", { params });

      setProducts((prev) =>
        replace ? res.data.items : [...prev, ...res.data.items]
      );
      const loaded = (nextPage - 1) * res.data.limit + res.data.items.length;
      setHasMore(loaded < res.data.total);
      setPage(nextPage);
    } catch (e) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-xl px-4 py-4 space-y-4">
        <Header lang={lang} onLangChange={setLang} />
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder={lang === "fa" ? "جستجو در منو..." : "Search menu..."}
        />
        <CategoryFilter
          categories={categories}
          activeId={activeCategory}
          onChange={setActiveCategory}
          lang={lang}
        />
        <ProductList
          products={products}
          lang={lang}
          hasMore={hasMore}
          onLoadMore={() => fetchProducts(page + 1)}
        />
        {loading && (
          <p className="text-center text-xs text-gray-400">
            {lang === "fa" ? "در حال بارگذاری..." : "Loading..."}
          </p>
        )}
      </div>
    </div>
  );
}


