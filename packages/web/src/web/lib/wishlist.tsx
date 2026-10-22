import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../../api/catalog";

export interface WishlistItem {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  category: string;
  tone: Product["tone"];
  icon: string;
  num: string;
  image?: string;
  addedAt: number;
}

interface WishlistCtx {
  items: WishlistItem[];
  count: number;
  open: boolean;
  bump: number;
  recentAction: { slug: string; added: boolean } | null;
  setOpen: (v: boolean) => void;
  isWishlisted: (slug: string) => boolean;
  toggleWishlist: (p: Product) => boolean;
  add: (p: Product) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const Ctx = createContext<WishlistCtx | null>(null);
const STORAGE = "1cb-wishlist-v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [recentAction, setRecentAction] = useState<{ slug: string; added: boolean } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  }, [items]);

  // Clear toast feedback after 3 seconds
  useEffect(() => {
    if (!recentAction) return;
    const timer = setTimeout(() => setRecentAction(null), 3000);
    return () => clearTimeout(timer);
  }, [recentAction]);

  const isWishlisted = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  const add = useCallback((p: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === p.slug)) return prev;
      return [
        ...prev,
        {
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          price: p.price,
          category: p.category,
          tone: p.tone,
          icon: p.icon,
          num: p.num,
          image: p.image,
          addedAt: Date.now(),
        },
      ];
    });
    setBump((b) => b + 1);
    setRecentAction({ slug: p.slug, added: true });
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
    setBump((b) => b + 1);
    setRecentAction({ slug, added: false });
  }, []);

  const toggleWishlist = useCallback(
    (p: Product): boolean => {
      const exists = items.some((i) => i.slug === p.slug);
      if (exists) {
        remove(p.slug);
        return false;
      } else {
        add(p);
        return true;
      }
    },
    [items, add, remove]
  );

  const clear = useCallback(() => {
    setItems([]);
    setBump((b) => b + 1);
  }, []);

  const value = useMemo<WishlistCtx>(
    () => ({
      items,
      count: items.length,
      open,
      bump,
      recentAction,
      setOpen,
      isWishlisted,
      toggleWishlist,
      add,
      remove,
      clear,
    }),
    [items, open, bump, recentAction, isWishlisted, toggleWishlist, add, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist outside WishlistProvider");
  return c;
}
