import { Link, useLocation } from "wouter";
import { ArrowUpRight, Zap, Sparkles } from "lucide-react";
import { BUNDLE_SLUG, type Product } from "../../api/catalog";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { ProductArt } from "./product-art";
import { WishlistButton } from "./WishlistButton";

/** Horizontal compact card — featured subscription engine card. */
export function ArrivalCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [, navigate] = useLocation();
  const isBundle = p.slug === BUNDLE_SLUG;
  return (
    <div className="card card-lift group flex gap-4 bg-paper p-3">
      <div className="relative block w-28 shrink-0 sm:w-32">
        <Link to={`/product/${p.slug}`} className="block">
          {p.image ? (
            <img src={p.image} alt={p.name} loading="lazy" className="b3 aspect-[4/5] w-full object-cover" />
          ) : (
            <ProductArt tone={p.tone} icon={p.icon} num={p.num} size="card" className="aspect-[4/5] w-full" />
          )}
        </Link>
        <div className="absolute top-1.5 right-1.5 z-10">
          <WishlistButton product={p} size="sm" />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink">
          {isBundle ? "All-Access Plan" : "Included in $99/mo Pass"}
        </span>
        <Link to={`/product/${p.slug}`} className="mt-1.5 block">
          <h3 className="display line-clamp-2 text-base leading-tight hover:underline">{p.name}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs font-semibold text-muted">{p.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="display text-xl">
            {money(p.price)}
            <span className="font-sans text-sm font-bold normal-case">/mo</span>
          </span>
          <button
            type="button"
            aria-label={`Subscribe to ${p.name}`}
            onClick={() => {
              add(p, { open: false });
              navigate("/subscribe");
            }}
            className="btn btn-sm btn-yellow !px-2.5 text-xs font-black cursor-pointer"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

/** Tall editorial card with photography — popular subscription engine card. */
export function BestSellerCard({ p, rank }: { p: Product; rank: number }) {
  const { add } = useCart();
  const [, navigate] = useLocation();
  return (
    <div className="group relative">
      <div className="relative">
        <Link to={`/product/${p.slug}`} className="block">
          <div className="b3 hard relative aspect-[3/4] overflow-hidden bg-ink transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1">
            {p.image ? (
              <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover grayscale-0 transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <ProductArt tone={p.tone} icon={p.icon} num={p.num} className="h-full w-full border-0" />
            )}
            <span className="display absolute left-3 top-3 bg-sun px-2 py-1 text-2xl b3">#{rank}</span>
            <span className="absolute right-3 bottom-3 grid h-10 w-10 place-items-center bg-paper b3 opacity-0 transition-opacity group-hover:opacity-100">
              <ArrowUpRight className="h-5 w-5" strokeWidth={3} />
            </span>
          </div>
        </Link>
        <div className="absolute right-3 top-3 z-10">
          <WishlistButton product={p} size="sm" />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/product/${p.slug}`}>
            <h3 className="display text-xl leading-none hover:underline">{p.name}</h3>
          </Link>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-muted">{p.tagline}</p>
          <p className="display mt-2 text-lg">
            {money(p.price)}
            <span className="font-sans text-sm normal-case">/mo</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            add(p, { open: false });
            navigate("/subscribe");
          }}
          className="btn btn-sm btn-yellow shrink-0 font-black shadow-[2px_2px_0px_#000] cursor-pointer"
        >
          <Zap className="h-3.5 w-3.5 fill-ink" /> Subscribe
        </button>
      </div>
    </div>
  );
}

/** Grid card for the tools & subscriptions directory. */
export function GridCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [, navigate] = useLocation();
  const isBundle = p.slug === BUNDLE_SLUG;
  return (
    <div className="card card-lift flex flex-col bg-paper">
      <div className="relative block overflow-hidden border-b-[3px] border-ink">
        <Link to={`/product/${p.slug}`} className="block">
          {p.image ? (
            <img src={p.image} alt={p.name} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105" />
          ) : (
            <ProductArt tone={p.tone} icon={p.icon} num={p.num} size="md" className="aspect-square w-full border-0" />
          )}
        </Link>
        <span className="display absolute left-3 top-3 bg-paper px-2 py-0.5 text-lg b3">{p.num}</span>
        <div className="absolute right-3 top-3 z-10">
          <WishlistButton product={p} size="sm" />
        </div>
        <span className="absolute bottom-3 right-3 bg-ink px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-sun">
          {isBundle ? "All 13 Tools · Best Value" : "Included in All-Access"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-extrabold uppercase tracking-widest">
          {isBundle ? "All-Access Subscription" : `${p.category} Engine · 60 gens/mo`}
        </span>
        <Link to={`/product/${p.slug}`}>
          <h3 className="display mt-1 text-xl hover:underline">{p.name}</h3>
        </Link>
        <p className="mt-1 text-sm font-semibold text-muted">{p.tagline}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div>
            <span className="display text-2xl">
              {money(p.price)}
              <span className="font-sans text-sm normal-case">/mo</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              add(p, { open: false });
              navigate("/subscribe");
            }}
            className="btn btn-sm btn-yellow font-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={3} /> Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ className = "h-40" }: { className?: string }) {
  return <div className={`b3 animate-pulse bg-cream ${className}`} />;
}
