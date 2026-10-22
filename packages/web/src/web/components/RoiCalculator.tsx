import { useState } from "react";
import { Link } from "wouter";
import { Calculator, ArrowRight, Zap, TrendingUp, ShieldCheck } from "lucide-react";
import { useCart } from "../lib/cart";
import { BUNDLE_SLUG, PRODUCTS } from "../../api/catalog";
import { money } from "../lib/format";
import { useQuickStart } from "../context/QuickStartContext";

interface CostItem {
  id: string;
  name: string;
  freelancerCost: number;
  agencyTime: string;
  category: string;
  oneClickStatus: string;
}

const COST_ITEMS: CostItem[] = [
  {
    id: "brand",
    name: "Brand Identity & Vector Logo",
    freelancerCost: 1400,
    agencyTime: "2-3 weeks",
    category: "Design Agency",
    oneClickStatus: "Included in 1 Click",
  },
  {
    id: "plan",
    name: "Business Plan & Financials",
    freelancerCost: 1800,
    agencyTime: "1-2 weeks",
    category: "Consultant",
    oneClickStatus: "Included in 1 Click",
  },
  {
    id: "site",
    name: "Conversion-Ready Website",
    freelancerCost: 2500,
    agencyTime: "3-4 weeks",
    category: "Web Dev Studio",
    oneClickStatus: "Included in 1 Click",
  },
  {
    id: "marketing",
    name: "Ad Copy & 2-Week Social Media",
    freelancerCost: 950,
    agencyTime: "1 week",
    category: "Copywriter",
    oneClickStatus: "Included in 1 Click",
  },
  {
    id: "crm",
    name: "CRM Setup & Lead Capture Pipeline",
    freelancerCost: 850,
    agencyTime: "1 week",
    category: "Systems Specialist",
    oneClickStatus: "Included in 1 Click",
  },
];

export function RoiCalculator() {
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({
    brand: true,
    plan: true,
    site: true,
    marketing: true,
    crm: true,
  });

  const { add } = useCart();
  const { openQuickStart } = useQuickStart();
  const bundle = PRODUCTS.find((p) => p.slug === BUNDLE_SLUG);

  const toggle = (id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedList = COST_ITEMS.filter((item) => selectedIds[item.id]);
  const totalFreelancerCost = selectedList.reduce((sum, item) => sum + item.freelancerCost, 0);
  const bundlePrice = bundle?.price ?? 99;
  const savings = Math.max(0, totalFreelancerCost - bundlePrice);
  const percentageSaved = totalFreelancerCost > 0 ? Math.round((savings / totalFreelancerCost) * 100) : 0;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
      <div className="b3 hard border-[3px] border-ink bg-paper p-6 md:p-12 shadow-[8px_8px_0px_#000]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-ink pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center bg-ink text-sun b3">
                <Calculator className="h-4 w-4" />
              </span>
              <span className="chip bg-mint text-ink text-xs font-black uppercase">
                Interactive Launch ROI Model
              </span>
            </div>
            <h2 className="display text-4xl md:text-6xl mt-2 text-ink">
              Agency &amp; Freelancer Cost Comparison
            </h2>
            <p className="mt-2 text-base font-bold text-muted max-w-2xl">
              See how much capital you keep in your business by generating your complete Phase 1 launch suite automatically instead of hiring individual contractors.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-black uppercase text-ink bg-sun px-3 py-1.5 b3 border-2 border-ink">
            <ShieldCheck className="h-4 w-4 text-ink" />
            <span>100% Money-Back Guarantee</span>
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] items-start">
          {/* Itemized Selection Table */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-muted mb-3">
              Select the deliverables you need to launch:
            </p>

            {COST_ITEMS.map((item) => {
              const isChecked = selectedIds[item.id] ?? false;
              return (
                <div
                  key={item.id}
                  className={`p-4 b3 border-2 border-ink transition-all flex flex-wrap items-center justify-between gap-3 ${
                    isChecked
                      ? "bg-cream shadow-[3px_3px_0px_#000]"
                      : "bg-paper opacity-50 hover:opacity-80"
                  }`}
                >
                  <label className="flex items-center gap-3 min-w-0 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(item.id)}
                      aria-label={`Select ${item.name}`}
                      className="h-5 w-5 rounded accent-ink cursor-pointer shrink-0"
                    />
                    <div>
                      <p className="display text-base md:text-lg leading-tight">{item.name}</p>
                      <p className="text-xs font-bold text-muted">
                        Typical Agency / {item.category} · {item.agencyTime} turnaround
                      </p>
                    </div>
                  </label>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="display text-lg line-through decoration-[2.5px] text-muted">
                        ${item.freelancerCost.toLocaleString()}
                      </p>
                      <span className="text-[10px] font-black uppercase bg-mint px-1.5 py-0.5 border border-ink text-ink">
                        {item.oneClickStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 flex items-center justify-between text-xs font-bold text-muted pt-2">
              <span>* Pricing estimates based on 2026 Upwork, Fiverr Pro &amp; US boutique agency averages.</span>
              <button
                type="button"
                onClick={() => {
                  const allOn: Record<string, boolean> = {};
                  COST_ITEMS.forEach((c) => (allOn[c.id] = true));
                  setSelectedIds(allOn);
                }}
                className="underline font-black text-ink cursor-pointer"
              >
                Select all
              </button>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="b3 hard bg-ink p-6 md:p-8 text-sun border-[3px] border-ink space-y-6">
            <span className="chip bg-mint text-ink text-xs font-black uppercase tracking-wider">
              Launch Savings Analysis
            </span>

            <div className="space-y-4 border-b border-sun/20 pb-5">
              <div className="flex justify-between items-baseline text-sm font-bold">
                <span className="text-cream">Traditional Contractor Cost:</span>
                <span className="text-xl line-through text-rose-300 font-black">
                  ${totalFreelancerCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-baseline text-sm font-bold">
                <span className="text-cream">Traditional Wait Time:</span>
                <span className="text-sun font-black">6 to 8 Weeks</span>
              </div>

              <div className="flex justify-between items-baseline text-sm font-bold">
                <span className="text-cream">1 Click Business Launch:</span>
                <span className="text-2xl text-mint font-black">
                  {money(bundlePrice)}/mo
                </span>
              </div>
            </div>

            {/* Big Tally Callout */}
            <div className="bg-sun/10 border-2 border-sun p-4 b3 text-center">
              <p className="text-xs font-black uppercase tracking-wider text-mint">
                Immediate Upfront Capital Saved
              </p>
              <p className="display text-5xl md:text-6xl text-sun mt-1">
                ${savings.toLocaleString()}
              </p>
              <p className="text-xs font-black text-mint mt-1">
                Save {percentageSaved}% + Launch in &lt; 2 Minutes Today
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (bundle) {
                    add(bundle, { open: false });
                  }
                  openQuickStart();
                }}
                className="btn btn-yellow w-full text-sm font-black shadow-[4px_4px_0_#79e784] border-sun flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-ink" />
                Launch Blueprint in 1 Click
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                to="/product/phase-1-launch"
                className="btn border-sun w-full text-center text-xs font-black block text-sun hover:bg-white/10"
              >
                See All 13 Tools in Phase 1 Bundle
              </Link>
            </div>

            <p className="text-[11px] font-bold text-cream text-center flex items-center justify-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-mint" />
              Reinvest saved capital into inventory and ad spend.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
