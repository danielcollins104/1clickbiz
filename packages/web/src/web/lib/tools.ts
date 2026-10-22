import { BUNDLE_SLUG, PRODUCTS, type Product } from "../../api/catalog";

/** The 13 Phase 1 tools in catalogue order (01 → 13). */
export const TOOLS: Product[] = PRODUCTS.filter((p) => p.slug !== BUNDLE_SLUG).sort((a, b) => a.num.localeCompare(b.num));
export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);

export type Img = { key: string; url?: string } | null | undefined;

/** Status → label + colour for chips. */
export const STATUS: Record<string, { label: string; cls: string }> = {
  locked: { label: "Locked", cls: "bg-paper" },
  idle: { label: "Not run", cls: "bg-paper" },
  running: { label: "Building", cls: "bg-sun" },
  done: { label: "Ready", cls: "bg-mint" },
  error: { label: "Failed", cls: "bg-ink text-sun" },
};
