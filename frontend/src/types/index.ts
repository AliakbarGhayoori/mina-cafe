export type Category = {
  id: string;
  titleEn: string;
  titleFa: string;
  descEn?: string;
  descFa?: string;
  icon?: string;
};

export type Product = {
  id: string;
  titleEn: string;
  titleFa: string;
  descEn?: string;
  descFa?: string;
  image?: string;
  price: number;
  discount?: number;
  status: "active" | "inactive";
  orderingShowInList?: number;
  special?: boolean;
  category: Category | string;
};


