import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../../api/catalog";
import { BUNDLE_SLUG } from "../../api/catalog";

export interface CartLine {
  key: string;
  slug: string;
  name: string;
  tone: Product["tone"];
  icon: string;
  num: string;
  price: number; // monthly USD
}

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  bump: number;
  hasBundle: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, opts?: { open?: boolean }) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "1cb-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(lines));
  }, [lines]);

  const add = useCallback((p: Product, opts?: { open?: boolean }) => {
    setLines((prev) => {
      // The bundle already contains every tool, so it replaces individual tools.
      if (p.slug === BUNDLE_SLUG) {
        return [{ key: p.slug, slug: p.slug, name: p.name, tone: p.tone, icon: p.icon, num: p.num, price: p.price }];
      }
      if (prev.some((l) => l.slug === p.slug || l.slug === BUNDLE_SLUG)) return prev;
      return [...prev, { key: p.slug, slug: p.slug, name: p.name, tone: p.tone, icon: p.icon, num: p.num, price: p.price }];
    });
    setBump((b) => b + 1);
    if (opts?.open !== false) setOpen(true);
  }, []);

  const remove = useCallback((key: string) => setLines((prev) => prev.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartCtx>(() => {
    const subtotal = lines.reduce((s, l) => s + l.price, 0);
    return {
      lines,
      count: lines.length,
      subtotal,
      open,
      bump,
      hasBundle: lines.some((l) => l.slug === BUNDLE_SLUG),
      setOpen,
      add,
      remove,
      clear,
    };
  }, [lines, open, bump, add, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
