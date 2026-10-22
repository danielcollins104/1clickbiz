import { Star, ShieldCheck, CheckCircle2, ThumbsUp } from "lucide-react";
import type { Product } from "../../api/catalog";

interface Review {
  id: string;
  author: string;
  role: string;
  company: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  highlight: string;
  verified: boolean;
}

const REVIEWS_BY_CATEGORY: Record<string, Review[]> = {
  Plan: [
    {
      id: "r-plan-1",
      author: "Marcus Vance",
      role: "Co-Founder",
      company: "Apex Systems & RevOps",
      location: "San Francisco, CA",
      rating: 5,
      date: "3 days ago",
      title: "Saved weeks of financial modeling",
      body: "I was skeptical that an AI could understand multi-tiered B2B retainer models. The Business Plan generator produced our unit economics, cash flow breakeven, and executive summary cleanly on the first run. Passed our advisory committee review without major edits.",
      highlight: "Passed our advisory committee review without major edits.",
      verified: true,
    },
    {
      id: "r-plan-2",
      author: "Samantha Lee",
      role: "Owner",
      company: "Kinship Hearth Bread Co.",
      location: "Denver, CO",
      rating: 5,
      date: "1 week ago",
      title: "Gave me clarity when I was overwhelmed",
      body: "The Idea Wizard and Launch Checklist kept me from spinning my wheels. Knowing exactly which legal permit to get and how to price our artisan loaves saved me hours of confusing Google searches.",
      highlight: "Kept me from spinning my wheels.",
      verified: true,
    },
  ],
  Brand: [
    {
      id: "r-brand-1",
      author: "Elena Rostova",
      role: "Founder",
      company: "TerraCycle Living",
      location: "Portland, OR",
      rating: 5,
      date: "4 days ago",
      title: "Vector files and color codes were production-grade",
      body: "Usually AI logos look like blurry cartoons or clip art. The Vector Logo generator gave me clean geometric SVG files that we sent straight to our cardboard box printer. The color font system gave us exact hex and Pantone codes.",
      highlight: "Sent straight to our cardboard box printer.",
      verified: true,
    },
    {
      id: "r-brand-2",
      author: "Julian Thorne",
      role: "Managing Director",
      company: "Lumen & Key Digital",
      location: "Austin, TX",
      rating: 5,
      date: "2 weeks ago",
      title: "The brand voice generator paid for itself instantly",
      body: "Finding a name that was available and sounded authoritative was always our bottleneck. The Brand Generator gave us a tagline and elevator pitch that our team adopted immediately.",
      highlight: "Tagline and elevator pitch our team adopted immediately.",
      verified: true,
    },
  ],
  Market: [
    {
      id: "r-market-1",
      author: "Mateo Cruz",
      role: "Head of Growth",
      company: "PulseFit Conditioning",
      location: "Miami, FL",
      rating: 5,
      date: "5 days ago",
      title: "Website went live in under 5 minutes",
      body: "Hosted website generator is unreal. It wrote the copy tailored to our local fitness demographic, set up the booking inquiry form, and looked sharp on mobile right out of the box.",
      highlight: "Looked sharp on mobile right out of the box.",
      verified: true,
    },
    {
      id: "r-market-2",
      author: "Kelsey Miller",
      role: "Founder",
      company: "Haven Home Maintenance",
      location: "Charlotte, NC",
      rating: 5,
      date: "1 week ago",
      title: "Ad copy produced our first 14 inquiries",
      body: "We took the Meta and Google Search ad copy directly from the Ad Generator, ran $15/day on Facebook, and booked 14 home inspections in our first weekend. Best launch investment we made.",
      highlight: "Booked 14 home inspections in our first weekend.",
      verified: true,
    },
  ],
  Run: [
    {
      id: "r-run-1",
      author: "David H.",
      role: "Solo Operator",
      company: "Highline Property Valuations",
      location: "Chicago, IL",
      rating: 5,
      date: "6 days ago",
      title: "CRM automatically syncs with our landing page",
      body: "When leads submit the form on our site, they drop directly into the CRM stage pipeline. Zero Zapier spaghetti or webhook bugs. It just works.",
      highlight: "Zero Zapier spaghetti or webhook bugs.",
      verified: true,
    },
  ],
  Bundle: [
    {
      id: "r-bundle-1",
      author: "Elena Rostova",
      role: "Founder",
      company: "TerraCycle Living",
      location: "Portland, OR",
      rating: 5,
      date: "2 days ago",
      title: "The only tool you need to launch a business",
      body: "Taking the Phase 1 bundle is a no-brainer. Having your answers from the Idea Wizard feed your Brand Generator, which then feeds your Website and your Ads, makes everything feel cohesive and professional.",
      highlight: "Taking the Phase 1 bundle is a no-brainer.",
      verified: true,
    },
    {
      id: "r-bundle-2",
      author: "Marcus Vance",
      role: "Co-Founder",
      company: "Apex Systems & RevOps",
      location: "San Francisco, CA",
      rating: 5,
      date: "1 week ago",
      title: "Replaced 6 different SaaS subscriptions",
      body: "We cancelled our Canva, standalone CRM, business plan software, and copywriting tools. Having 500 AI generations in one unified workspace with one invoice is unmatched value.",
      highlight: "Replaced 6 different SaaS subscriptions.",
      verified: true,
    },
  ],
};

export function ProductReviews({ currentProduct }: { currentProduct: Product }) {
  const reviews = REVIEWS_BY_CATEGORY[currentProduct.category] || REVIEWS_BY_CATEGORY.Brand;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
      <div className="b3 hard border-[3px] border-ink bg-paper p-6 md:p-10 shadow-[6px_6px_0px_#000]">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          {/* Summary Column */}
          <div className="space-y-6 lg:border-r-[3px] lg:border-ink lg:pr-8">
            <div>
              <span className="chip bg-mint text-ink text-xs font-black uppercase">
                Verified Founder Reviews
              </span>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="display text-6xl text-ink">4.9</span>
                <div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-muted mt-1">Based on 840+ verified launches</p>
                </div>
              </div>
            </div>

            {/* Distribution bars */}
            <div className="space-y-2 text-xs font-bold">
              {[
                { stars: "5★", pct: 94 },
                { stars: "4★", pct: 5 },
                { stars: "3★", pct: 1 },
                { stars: "2★", pct: 0 },
                { stars: "1★", pct: 0 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-2">
                  <span className="w-6 text-muted">{row.stars}</span>
                  <div className="h-2 flex-1 bg-cream b3 overflow-hidden border border-ink">
                    <div className="h-full bg-emerald-500" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted">{row.pct}%</span>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="space-y-2 pt-2 border-t-2 border-ink">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>100% Verified Buyer Reviews</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>14-Day Money Back Guarantee</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <h3 className="display text-2xl md:text-3xl text-ink">
              What Founders Launching With {currentProduct.name} Say
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((r) => (
                <div key={r.id} className="b3 border-2 border-ink bg-cream p-5 shadow-[3px_3px_0px_#000] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-muted">{r.date}</span>
                    </div>

                    <p className="display text-base mb-1 text-ink">{r.title}</p>
                    <p className="text-xs font-semibold leading-relaxed text-ink/90">{r.body}</p>

                    <div className="mt-3 bg-paper p-2 b3 border border-ink/40 text-[11px] font-bold text-ink italic">
                      "{r.highlight}"
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ink/20 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-black text-ink">{r.author}</p>
                      <p className="text-[11px] text-muted font-bold">
                        {r.role}, {r.company}
                      </p>
                    </div>
                    {r.verified && (
                      <span className="chip bg-mint text-ink text-[10px] font-black uppercase flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
