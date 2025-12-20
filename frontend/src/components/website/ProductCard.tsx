import type { Product } from "@/types";

type Props = {
  product: Product;
  lang: "en" | "fa";
};

export function ProductCard({ product, lang }: Props) {
  const titleKey = lang === "fa" ? "titleFa" : "titleEn";
  const descKey = lang === "fa" ? "descFa" : "descEn";

  const finalPrice =
    product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  return (
    <div className="flex gap-3 rounded-2xl border border-gray-200 p-3">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image}
          alt={product[titleKey]}
          className="h-20 w-20 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="h-20 w-20 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
          {lang === "fa" ? "بدون عکس" : "No image"}
        </div>
      )}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{product[titleKey]}</h3>
            {product.special && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {lang === "fa" ? "ویژه" : "Special"}
              </span>
            )}
          </div>
          {product[descKey] && (
            <p className="text-[11px] text-gray-500 line-clamp-2">
              {product[descKey]}
            </p>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-col items-end text-xs">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="line-through text-gray-400">
                  {product.price.toLocaleString()} تومان
                </span>
                <span className="font-bold">
                  {finalPrice.toLocaleString()} تومان
                </span>
              </>
            ) : (
              <span className="font-bold">
                {product.price.toLocaleString()} تومان
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


