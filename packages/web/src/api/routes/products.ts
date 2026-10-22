import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { PRODUCTS } from "../catalog";

export const products = {
  list: base.handler(() => ({ products: PRODUCTS })),
  get: base.input(z.object({ slug: z.string() })).handler(({ input }) => {
    const product = PRODUCTS.find((p) => p.slug === input.slug);
    if (!product) throw new ORPCError("NOT_FOUND", { message: "Product not found" });
    const related = PRODUCTS.filter((p) => p.slug !== product.slug)
      .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
      .slice(0, 4);
    return { product, related };
  }),
};
