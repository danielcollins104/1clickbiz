import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Plus, Check, Zap, Sparkles, ArrowRight } from "lucide-react";
import type { Product } from "../../api/catalog";
import { BUNDLE_SLUG, PRODUCTS } from "../../api/catalog";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { ProductArt } from "./product-art";

// Strategic pairings based on customer journey logic
const PAIRING_MAP: Record<string, string[]> = {
  "idea-wizard": ["business-plan", "logo-generation"],
  "name-generator": ["logo-generation", "brand-generator"],
  "business-plan": ["funding-finder", "ai-advisor"],
  "brand-generator": ["color-font-system", "logo-generation"],
  "color-font-system": ["logo-generation", "website-generator"],
  "logo-generation": ["brand-generator", "website-generator"],
  "website-generator": ["customer-crm", "ad-generator"],
  "ad-generator": ["website-generator", "social-generator"],
  "social-generator": ["website-generator", "ad-generator"],
  "launch-checklist": ["business-plan", "ai-advisor"],
  "funding-finder": ["business-plan", "ai-advisor"],
  "customer-crm": ["cold-outreach", "website-generator"],
  "ai-advisor": ["business-plan", "customer-crm"],
  "cold-outreach": ["website-generator", "customer-crm"],
  "competitor-radar": ["business-plan", "idea-wizard"],
  "seo-engine": ["website-generator", "cold-outreach"],
};

interface Props {
  currentProduct: Product;
  allProducts: Product[];
}

export function FrequentlyBoughtTogether({ currentProduct, allProducts }: Props) {
  const { add, lines } = useCart();
  const [, navigate] = useLocation();

  const isBundle = currentProduct.slug === BUNDLE_SLUG;
  const bundle = PRODUCTS.find((p) => p.slug === BUNDLE_SLUG);

  // Pick complementary products
  const pairProducts = useMemo(() => {
    const pairSlugs = PAIRING_MAP[currentProduct.slug] || ["business-plan", "website-generator"];
    return pairSlugs
      .map((slug) => allProducts.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p && p.slug !== currentProduct.slug));
  }, [allProducts, currentProduct.slug]);

  // All 3 items in the stack: current + up to 2 companions
  const stack = useMemo(() => [currentProduct, ...pairProducts], [currentProduct, pairProducts]);

  // Track checked state
  const [selectedSlugs, setSelectedSlugs] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = { [currentProduct.slug]: true };
    pairProducts.forEach((p) => {
      init[p.slug] = true;
    });
    return init;
  });

  if (isBundle || pairProducts.length === 0) {
    return null;
  }

  const toggleSlug = (slug: string) => {
    setSelectedSlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const selectedProducts = stack.filter((p) => selectedSlugs[p.slug]);
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = bundle?.price ?? 99;
  const bundleBetter = totalPrice >= bundlePrice;

  const handleAddSelected = () => {
    selectedProducts.forEach((p) => {
      add(p, { open: false });
    });
    navigate("/subscribe");
  };

  const handleUpgradeToBundle = () => {
    if (bundle) {
      add(bundle, { open: false });
      navigate("/subscribe");
    }
  };

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
      <div className="b3 hard border-[3px] border-ink bg-paper p-6 md:p-8 shadow-[6px_6px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink pb-4">
          <div>
            <span className="chip bg-mint text-ink text-xs font-black">
              <Sparkles className="h-3.5 w-3.5 inline mr-1 fill-ink" />
              Connected Stage Stack
            </span>
            <h3 className="display mt-2 text-2xl md:text-3xl">Subscribe to a Connected Workflow Stack</h3>
          </div>
          <span className="text-xs font-black uppercase text-muted tracking-wide">
            Outputs flow automatically between engines
          </span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] items-center">
          {/* Visual Formula Strip */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {stack.map((item, idx) => {
              const isCurrent = item.slug === currentProduct.slug;
              const isChecked = selectedSlugs[item.slug] ?? false;
              const inCart = lines.some((l) => l.slug === item.slug);

              return (
                <div key={item.slug} className="flex items-center gap-4">
                  <div
                    className={`card p-3 border-2 border-ink transition-all ${
                      isChecked ? "bg-cream shadow-[3px_3px_0px_#000]" : "bg-paper opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSlug(item.slug)}
                          aria-label={`Select ${item.name}`}
                          className="h-4 w-4 rounded accent-ink cursor-pointer"
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {isCurrent ? "This item" : "Recommended pair"}
                        </span>
                      </label>
                      {inCart && (
                        <span className="text-[10px] bg-mint px-1 border border-ink font-bold">
                          In cart
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden b3 border border-ink">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <ProductArt tone={item.tone} icon={item.icon} num={item.num} size="sm" className="h-full w-full border-0" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/product/${item.slug}`} className="hover:underline">
                          <p className="display text-sm leading-tight truncate">{item.name}</p>
                        </Link>
                        <p className="text-xs font-bold text-muted truncate">{item.category}</p>
                        <p className="display text-sm mt-0.5">{money(item.price)}<span className="font-sans text-[10px]">/mo</span></p>
                      </div>
                    </div>
                  </div>

                  {idx < stack.length - 1 && (
                    <span className="text-2xl font-black text-ink select-none hidden sm:inline">
                      <Plus className="h-6 w-6 stroke-[3]" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buy Box */}
          <div className="b3 hard bg-sun p-5 border-[3px] border-ink">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-black uppercase text-ink">
                Stack Price ({selectedProducts.length} items):
              </span>
              <span className="display text-3xl text-ink">
                {money(totalPrice)}
                <span className="font-sans text-xs normal-case">/mo</span>
              </span>
            </div>

            {bundleBetter ? (
              <div className="mt-3 bg-mint p-2.5 border-2 border-ink text-xs font-bold text-ink">
                <span className="font-black">⚡ Max Value Opportunity:</span> You're getting {selectedProducts.length} tools for {money(totalPrice)}/mo. The <strong>Phase 1 Bundle</strong> gives you ALL 13 tools for only {money(bundlePrice)}/mo!
              </div>
            ) : (
              <p className="mt-2 text-xs font-bold text-ink">
                Tools work better together: inputs automatically transfer between your selected tools.
              </p>
            )}

            <div className="mt-4 space-y-2">
              {bundleBetter && bundle ? (
                <button
                  type="button"
                  onClick={handleUpgradeToBundle}
                  className="btn btn-yellow w-full text-xs font-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="h-4 w-4 fill-ink" strokeWidth={2.5} />
                  Get All 13 Tools for {money(bundle.price)}/mo
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleAddSelected}
                disabled={selectedProducts.length === 0}
                className="btn bg-ink text-sun w-full text-xs font-black shadow-[3px_3px_0px_#79e784] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-neutral-800"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
                Subscribe to {selectedProducts.length} Engine{selectedProducts.length === 1 ? "" : "s"} ({money(totalPrice)}/mo)
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
