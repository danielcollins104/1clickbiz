import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Heart } from "lucide-react";
import { useProducts } from "../queries/products";
import { useWishlist } from "../lib/wishlist";
import { CardSkeleton, GridCard } from "../components/product-card";
import { StackFinder } from "../components/StackFinder";
import { SubscriptionPlans } from "../components/SubscriptionPlans";

const FILTERS = [
  { id: "all", label: "All 13 Engines" },
  { id: "Plan", label: "01. Plan" },
  { id: "Brand", label: "02. Brand" },
  { id: "Market", label: "03. Market" },
  { id: "Run", label: "04. Run" },
  { id: "Bundle", label: "All-Access Pass" },
  { id: "best", label: "Most Popular" },
];

const BANNERS: Record<string, { img: string; alt: string; line: string }> = {
  Plan: { img: "/images/cat-plan.webp", alt: "Notebook, calculator and chess piece on yellow", line: "Stage 01: Validated ideas, investor-ready business plan, legal checklist & funding grants." },
  Brand: { img: "/images/cat-brand.webp", alt: "Swatches, stamp and brush on green", line: "Stage 02: Brand name, voice guidelines, custom vector logo & typography system." },
  Market: { img: "/images/cat-market.webp", alt: "Megaphone and phone on black", line: "Stage 03: Live hosted website, high-converting ad creative, and 14-day social calendar." },
  Run: { img: "/images/cat-run.webp", alt: "Rolodex, clipboard and desk bell", line: "Stage 04: Built-in customer CRM fed by your site and an AI Co-Founder Advisor." },
  Bundle: { img: "/images/dashboard-banner.webp", alt: "Three founders in black and yellow", line: "Phase 1 All-Access Subscription: All 13 AI engines connected on one simple monthly plan." },
};

const SORTS = [
  { id: "featured", label: "Recommended launch order" },
  { id: "price-asc", label: "Monthly rate: low → high" },
  { id: "price-desc", label: "Monthly rate: high → low" },
];

export default function Shop() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const f = new URLSearchParams(search).get("f") ?? "all";
  const [sort, setSort] = useState("featured");
  const { data, isLoading, isError } = useProducts();
  const { isWishlisted, count: wishlistCount } = useWishlist();

  const items = useMemo(() => {
    let list = data?.products ?? [];
    if (f === "wishlist") list = list.filter((p) => isWishlisted(p.slug));
    else if (f === "new") list = list.filter((p) => p.isNew);
    else if (f === "best") list = list.filter((p) => p.bestSeller);
    else if (f !== "all") list = list.filter((p) => p.category === f);
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [data, f, sort, isWishlisted]);

  const title =
    f === "wishlist"
      ? "Saved Tools"
      : f === "new"
      ? "Newly Added Engines"
      : f === "best"
      ? "Most Popular Engines"
      : f === "all"
      ? "Subscription Plans & AI Tools"
      : `${f} Stage Engines`;

  return (
    <div>
      {f === "all" && <SubscriptionPlans compact />}

      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em]">
          Phase 1 — SaaS Launch Platform · {data?.products.length ?? "…"} subscription options
        </p>
        <h1 className="display mt-2 text-5xl md:text-8xl">{title}</h1>

      {BANNERS[f] && (
        <div className="b3 hard relative mt-8 overflow-hidden bg-ink">
          <img src={BANNERS[f].img} alt={BANNERS[f].alt} className="aspect-[21/9] w-full object-cover md:aspect-[21/7]" />
          <p className="absolute bottom-0 left-0 max-w-xl border-r-[3px] border-t-[3px] border-ink bg-sun px-4 py-3 font-extrabold md:text-lg">
            {BANNERS[f].line}
          </p>
        </div>
      )}

      <StackFinder />

      <div className="mt-8 flex flex-col gap-4 border-y-[3px] border-ink py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => navigate(x.id === "all" ? "/shop" : `/shop?f=${x.id}`)}
              className={`chip cursor-pointer px-3 py-1.5 text-sm ${f === x.id ? "bg-ink text-sun" : "bg-paper hover:bg-cream"}`}
            >
              {x.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate(f === "wishlist" ? "/shop" : "/shop?f=wishlist")}
            className={`chip cursor-pointer px-3 py-1.5 text-sm flex items-center gap-1.5 ${
              f === "wishlist"
                ? "bg-rose-500 text-white font-black"
                : wishlistCount > 0
                ? "bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100"
                : "bg-paper hover:bg-cream"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${f === "wishlist" || wishlistCount > 0 ? "fill-current" : ""}`} />
            <span>Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}</span>
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm font-extrabold uppercase">
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto !py-2 text-sm">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isError && <p className="mt-10 font-bold">Couldn't load the collection. Refresh to try again.</p>}

      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} className="h-[460px]" />)
          : items.map((p) => <GridCard key={p.slug} p={p} />)}
      </div>
      {!isLoading && items.length === 0 && <p className="display mt-10 text-3xl">Nothing here yet.</p>}
      </div>
    </div>
  );
}
