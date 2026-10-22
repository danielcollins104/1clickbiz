import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowDown, ArrowLeft, ArrowRight, Check, Eye, Hand, RefreshCw, ShieldCheck, Sparkles, Wand2, Zap, Star } from "lucide-react";
import { useProduct } from "../queries/products";
import { ProductArt } from "../components/product-art";
import { GridCard, CardSkeleton } from "../components/product-card";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { BUNDLE_GENERATIONS, BUNDLE_SLUG, TOOL_GENERATIONS, PRODUCTS } from "../../api/catalog";
import { useAccess } from "../queries/business";
import { SocialShare } from "../components/SocialShare";
import { WishlistButton } from "../components/WishlistButton";
import { SampleOutputModal } from "../components/SampleOutputModal";
import { SocialProofTicker } from "../components/SocialProofTicker";
import { FrequentlyBoughtTogether } from "../components/FrequentlyBoughtTogether";
import { ProductReviews } from "../components/ProductReviews";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useProduct(slug);
  const { add, lines } = useCart();
  const { data: access } = useAccess();
  const [, navigate] = useLocation();
  const [sampleOpen, setSampleOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = buyBoxRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar only when buy box has scrolled out of view and user is scrolled down
        if (entry) {
          setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 md:grid-cols-2 md:px-8">
        <CardSkeleton className="aspect-square" />
        <div className="space-y-4">
          <CardSkeleton className="h-16" />
          <CardSkeleton className="h-40" />
          <CardSkeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-24 text-center md:px-8">
        <h1 className="display text-6xl">Tool not found.</h1>
        <p className="mt-4 font-bold">That AI engine doesn't exist (yet).</p>
        <Link to="/pricing" className="btn mt-8">View Subscription Plans</Link>
      </div>
    );
  }

  const { product: p, related } = data;
  const bundleProduct = PRODUCTS.find((x) => x.slug === BUNDLE_SLUG);
  const isBundle = p.slug === BUNDLE_SLUG;
  const owned = isBundle
    ? access?.plans.some((x) => x.planId === "phase_1_launch" && x.status === "active")
    : access?.tools.includes(p.slug);
  const inCart = lines.some((l) => l.slug === p.slug || l.slug === BUNDLE_SLUG);

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-4 pt-6 md:px-8 flex flex-wrap items-center justify-between gap-2">
        <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-extrabold uppercase no-underline hover:underline">
          <ArrowLeft className="h-4 w-4" strokeWidth={3} /> All 13 AI Engines &amp; Plans
        </Link>
        {!isBundle && (
          <span className="chip bg-mint text-ink text-xs font-black">
            ✓ Included in Phase 1 All-Access Subscription ($99/mo)
          </span>
        )}
      </div>

      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 py-8 md:grid-cols-2 md:px-8 lg:gap-16">
        {/* gallery */}
        <div className="space-y-6 md:sticky md:top-24 md:self-start">
          {p.image ? (
            <div className="b3 hard relative aspect-square overflow-hidden bg-ink">
              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              <span className="display absolute left-4 top-4 bg-paper px-3 py-1 text-3xl b3">{p.num}</span>
              <div className="absolute right-4 top-4 z-10">
                <WishlistButton product={p} size="lg" />
              </div>
              <span className="absolute bottom-4 right-4 bg-ink px-2 py-1 text-xs font-extrabold uppercase tracking-wider text-sun">
                {p.isNew ? "New arrival" : p.bestSeller ? "Best seller" : p.category}
              </span>
            </div>
          ) : (
            <div className="relative aspect-square w-full">
              <ProductArt tone={p.tone} icon={p.icon} num={p.num} label={p.category} className="hard aspect-square w-full" />
              <div className="absolute right-4 top-4 z-10">
                <WishlistButton product={p} size="lg" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            <ProductArt tone={p.tone} icon={p.icon} num={p.num} size="md" className="hard aspect-square w-full" />
            <div className="b3 hard flex flex-col justify-between bg-ink p-5 text-sun">
              <p className="text-xs font-extrabold uppercase tracking-widest text-mint">Phase 1 · {p.category}</p>
              <p className="display text-2xl md:text-3xl">"{p.tagline}"</p>
              <p className="text-xs font-extrabold uppercase">1 Click Business</p>
            </div>
          </div>
        </div>

        {/* buy box */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{p.category}</span>
            {p.isNew && <span className="chip bg-mint">New</span>}
            {p.bestSeller && <span className="chip bg-ink text-sun">Best seller</span>}
          </div>
          <h1 className="display mt-4 text-5xl md:text-7xl">{p.name}</h1>
          <p className="mt-3 text-xl font-bold">{p.tagline}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-black text-ink">4.9/5</span>
            <span className="text-xs font-bold text-muted">· (840+ verified founder reviews)</span>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3 border-y-[3px] border-ink py-5">
            <span className="display text-6xl">{money(p.price)}</span>
            <span className="pb-2 font-extrabold">/month</span>
            <span className="mb-2 ml-auto chip bg-mint">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={3} /> {isBundle ? BUNDLE_GENERATIONS : TOOL_GENERATIONS} AI generations / mo
            </span>
          </div>

          <p className="mt-6 font-semibold leading-relaxed">{p.description}</p>

          {/* input -> output */}
          <div className="mt-6 grid gap-0 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
            <div className="b3 bg-paper p-4">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest"><Hand className="h-4 w-4" strokeWidth={3} /> You give</p>
              <p className="display mt-2 text-lg leading-tight">{p.youGive}</p>
            </div>
            <div className="grid place-items-center py-2 sm:px-2 sm:py-0">
              <span className="grid h-10 w-10 place-items-center bg-ink text-sun b3"><ArrowDown className="h-5 w-5 sm:-rotate-90" strokeWidth={3} /></span>
            </div>
            <div className="b3 hard bg-mint p-4">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest"><Wand2 className="h-4 w-4" strokeWidth={3} /> It builds</p>
              <p className="display mt-2 text-lg leading-tight">{p.youGet}</p>
            </div>
          </div>

          {/* Sample Deliverables Teaser Trigger */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-cream p-3.5 b3 border-2 border-ink shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-ink">
              <Eye className="h-4 w-4 text-ink" />
              <span>Inspect sample output generated by this tool</span>
            </div>
            <button
              type="button"
              onClick={() => setSampleOpen(true)}
              className="btn btn-sm btn-yellow text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              See Sample Deliverables
            </button>
          </div>

          <div ref={buyBoxRef} className="mt-6 grid gap-3 sm:grid-cols-2">
            {owned ? (
              <Link to="/dashboard" className="btn sm:col-span-2">
                <Check className="h-5 w-5" strokeWidth={3} /> Active in your subscription · Open Dashboard
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-yellow text-sm font-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={() => {
                    add(p, { open: false });
                    navigate("/subscribe#checkout");
                  }}
                >
                  <Zap className="h-4 w-4 fill-ink" strokeWidth={2.5} /> Subscribe · {money(p.price)}/mo
                </button>
                {!isBundle && bundleProduct ? (
                  <button
                    type="button"
                    className="btn bg-ink text-sun text-xs font-black shadow-[3px_3px_0px_#79e784] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-800"
                    onClick={() => {
                      add(bundleProduct, { open: false });
                      navigate("/subscribe#checkout");
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-mint" /> Unlock All 13 Engines ($99/mo)
                  </button>
                ) : (
                  <button type="button" className="btn btn-quiet" onClick={() => add(p)} disabled={inCart}>
                    {inCart ? "Selected in Plan" : "Select Plan"}
                  </button>
                )}
                <p className="sm:col-span-2 text-center text-xs font-bold text-muted flex items-center justify-center gap-2 mt-1">
                  <span>⚡ Instant SaaS access</span>
                  <span>•</span>
                  <span>🔄 Cancel anytime in 1 click</span>
                  <span>•</span>
                  <span>🔒 256-bit Stripe subscription</span>
                </p>
              </>
            )}
            <div className="sm:col-span-2">
              <WishlistButton product={p} variant="button" showLabel className="w-full" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-xs font-extrabold uppercase">
            <div className="b3 flex items-center gap-2 bg-cream p-3"><ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={3} /> Stripe checkout</div>
            <div className="b3 flex items-center gap-2 bg-cream p-3"><RefreshCw className="h-4 w-4 shrink-0" strokeWidth={3} /> Cancel anytime</div>
            <div className="b3 flex items-center gap-2 bg-cream p-3"><Wand2 className="h-4 w-4 shrink-0" strokeWidth={3} /> Edit by typing</div>
          </div>

          {/* tabs */}
          <div className="mt-10 b3 bg-paper">
            <div className="border-b-[3px] border-ink bg-ink px-4 py-3 text-sm font-extrabold uppercase text-sun">What's inside</div>
            <ul className="p-5">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-3 border-b-[3px] border-dashed border-ink/20 py-2.5 font-bold last:border-0">
                  <span className="grid h-6 w-6 shrink-0 place-items-center bg-mint b3">
                    <Check className="h-3.5 w-3.5" strokeWidth={4} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      
      <div className="mx-auto max-w-[1400px] px-4 pb-12 md:px-8">
        <SocialShare product={p} />
      </div>

      <FrequentlyBoughtTogether currentProduct={p} allProducts={PRODUCTS} />

      <ProductReviews currentProduct={p} />

      <SocialProofTicker className="my-10" />

      <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <h2 className="display mb-8 text-5xl md:text-6xl">Pairs well with</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((r) => (
            <GridCard key={r.slug} p={r} />
          ))}
        </div>
      </section>

      <SampleOutputModal
        productSlug={p.slug}
        isOpen={sampleOpen}
        onClose={() => setSampleOpen(false)}
      />

      {/* Sticky Bottom High-Conversion Buy Bar */}
      {showStickyBar && !owned && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t-[3px] border-ink bg-paper p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.15)] transition-all duration-200">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-3 min-w-0">
              <ProductArt tone={p.tone} icon={p.icon} num={p.num} size="sm" className="h-10 w-10 shrink-0 hidden sm:block" />
              <div className="min-w-0">
                <p className="display text-base md:text-lg truncate">{p.name}</p>
                <p className="text-xs font-bold text-muted truncate hidden sm:block">{p.tagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="display text-xl md:text-2xl">{money(p.price)}</span>
                <span className="text-xs font-extrabold text-muted">/mo</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-quiet hidden md:inline-flex"
                onClick={() => add(p)}
                disabled={inCart}
              >
                {inCart ? "In plan" : "+ Add to plan"}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-yellow text-xs md:text-sm font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  add(p, { open: false });
                  navigate("/subscribe#checkout");
                }}
              >
                <Zap className="h-3.5 w-3.5 fill-ink" strokeWidth={2.5} />
                Subscribe Now
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
