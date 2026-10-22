import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { PRODUCTS } from "../../api/catalog";

export function useProducts() {
  const opts = orpc.products.list.queryOptions({ staleTime: 5 * 60_000 });
  return useQuery({
    ...opts,
    initialData: { products: PRODUCTS },
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res && res.products && Array.isArray(res.products)) {
          return res;
        }
      } catch (err) {
        console.warn("[useProducts] remote fetch failed, using local catalog", err);
      }
      return { products: PRODUCTS };
    },
  });
}

export function useProduct(slug: string) {
  const opts = orpc.products.get.queryOptions({ input: { slug }, staleTime: 5 * 60_000 });
  const localProduct = PRODUCTS.find((p) => p.slug === slug);
  const localRelated = PRODUCTS.filter((p) => p.slug !== slug).slice(0, 3);
  const fallback = localProduct ? { product: localProduct, related: localRelated } : null;

  return useQuery({
    ...opts,
    initialData: fallback ?? undefined,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res && res.product) {
          return res;
        }
      } catch (err) {
        console.warn(`[useProduct] remote fetch failed for ${slug}`, err);
      }
      return fallback;
    },
  });
}
