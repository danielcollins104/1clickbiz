import { Link } from "wouter";
import { Sparkles, ShieldCheck, Zap, ArrowRight, Quote, CheckCircle2 } from "lucide-react";
import { useQuickStart } from "../context/QuickStartContext";

export function AboutCreator() {
  const { openQuickStart } = useQuickStart();

  return (
    <section className="border-b-[3px] border-ink bg-paper py-14 sm:py-20 px-4 md:px-8 overflow-hidden">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 flex flex-col items-start justify-between gap-4 border-b-[3px] border-ink pb-6 sm:pb-8 md:flex-row md:items-end">
          <div className="min-w-0 max-w-full">
            <div className="inline-flex items-center gap-2 border-[2px] border-ink bg-sun px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-[2px_2px_0px_#000]">
              <Sparkles className="h-3.5 w-3.5 shrink-0 fill-ink" />
              <span>Our Creator &amp; Vision</span>
            </div>
            <h2 className="display mt-3 text-3xl sm:text-5xl md:text-7xl">Meet Daniel Collins.</h2>
            <p className="mt-2 text-sm sm:text-base font-bold text-muted md:text-lg">
              Founder, architect, and developer behind the 1 Click Business ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider max-w-full">
            <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-mint border border-ink animate-pulse" />
            <span className="leading-snug">Built for Financial Independence · 10,000+ Launches Target</span>
          </div>
        </div>

        {/* Main Creator Showcase Grid */}
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 lg:items-center">
          {/* Creator Dual-Photo Column: 1 Portrait + 1 By the Fire */}
          <div className="min-w-0 w-full max-w-full lg:col-span-5">
            <div className="relative mx-auto w-full max-w-lg pr-2 pb-2 sm:pr-3 sm:pb-3 lg:max-w-none">
              {/* Backing decorative frame kept 100% inside container bounds */}
              <div className="absolute bottom-0 right-0 left-2 top-2 sm:left-3 sm:top-3 bg-sun border-[3px] border-ink" />

              {/* Dual Portrait + Fireside Card */}
              <div className="relative w-full max-w-full b3 border-[3px] border-ink bg-ink overflow-hidden shadow-[2px_2px_0px_#000] sm:shadow-[8px_8px_0px_#000]">
                <div className="grid grid-cols-2">
                  {/* Photo 1: Outdoor Portrait (825x1024 = 4:5 aspect ratio so neither left nor right side is cropped) */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-ink border-r-[3px] border-ink">
                    <img
                      src="/images/creator-daniel-collins.webp"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/creator-daniel-collins.jpg";
                      }}
                      alt="Daniel Collins — Founder Portrait"
                      width={825}
                      height={1024}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-[center_18%] hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-2 left-2 bg-ink/85 border border-sun/80 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-sun backdrop-blur">
                      Portrait
                    </div>
                  </div>

                  {/* Photo 2: By the Fire */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                    <img
                      src="/images/creator-daniel-collins-fire.webp"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/creator-daniel-collins-fire.png";
                      }}
                      alt="Daniel Collins by the fire — Night Shift Builder Mode"
                      width={896}
                      height={1600}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-[center_55%] hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-2 right-2 bg-ink/85 border border-sun/80 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-sun backdrop-blur">
                      By the Fire
                    </div>
                  </div>
                </div>

                {/* Founder Info Section Below Photos */}
                <div className="border-t-[3px] border-ink bg-paper p-3.5 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="display text-xl sm:text-2xl md:text-3xl leading-tight">Daniel Collins</h3>
                      <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-muted">
                        Creator &amp; Lead Architect
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 border-2 border-ink bg-mint px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase text-ink shadow-[2px_2px_0px_#000]">
                      <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span>Verified Creator</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Quote Stamp */}
              <div className="absolute -top-4 left-2 hidden sm:flex items-center gap-2 border-[2px] border-ink bg-sun p-3 text-xs font-black uppercase tracking-wider text-ink shadow-[4px_4px_0px_#000]">
                <Zap className="h-4 w-4 fill-ink" />
                <span>13-in-1 Engine Creator</span>
              </div>
            </div>
          </div>

          {/* Creator Story & Bio Column */}
          <div className="min-w-0 space-y-6 lg:col-span-7">
            <div className="space-y-3 sm:space-y-4">
              <span className="block text-xs font-black uppercase tracking-widest text-ink/70">
                A Personal Message From The Founder
              </span>
              <h3 className="display text-2xl sm:text-3xl md:text-4xl leading-tight">
                "I built 1 Click Business so anyone can claim their financial independence and create their own income — without spending thousands first."
              </h3>
            </div>

            <div className="prose max-w-none text-sm sm:text-base md:text-lg font-semibold leading-relaxed text-ink/90 space-y-4">
              <p>
                Starting a business that generates real income for you and your family shouldn't require juggling twenty expensive SaaS subscriptions, paying
                $5,000 agency retainers, or losing three months to decision fatigue over brand colors, legal models,
                and website copy.
              </p>
              <p>
                I engineered <strong>1 Click Business</strong> with an obsessive standard:
                give everyday people and visionary creators the unfair execution speed of a funded 10-person venture studio.
                Instead of isolated chatbots that forget your context, every single one of our 13 AI engines communicates
                with the rest — so your core answers flow seamlessly from market validation straight into logos,
                free hosted websites &amp; interactive web apps, targeted ads, and customer revenue tracking.
              </p>
            </div>

            {/* Creator Guiding Principles */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <div className="b3 border-[2px] border-ink bg-cream/70 p-3.5 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={3} />
                  <span className="text-xs font-black uppercase tracking-wider">No Agency Markups</span>
                </div>
                <p className="text-xs font-bold text-muted">
                  Own high-grade pitch decks, logo vectors, and hosted sites without burning months of savings.
                </p>
              </div>

              <div className="b3 border-[2px] border-ink bg-cream/70 p-3.5 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={3} />
                  <span className="text-xs font-black uppercase tracking-wider">Connected Context</span>
                </div>
                <p className="text-xs font-bold text-muted">
                  Your business plan sets your brand voice, and your brand voice writes your ads and website.
                </p>
              </div>

              <div className="b3 border-[2px] border-ink bg-cream/70 p-3.5 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={3} />
                  <span className="text-xs font-black uppercase tracking-wider">Solomon™ Sovereign AI</span>
                </div>
                <p className="text-xs font-bold text-muted">
                  24/7 executive business advisor + click-to-save Slide-Out Founder Notebook built right into your workspace.
                </p>
              </div>

              <div className="b3 border-[2px] border-ink bg-cream/70 p-3.5 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={3} />
                  <span className="text-xs font-black uppercase tracking-wider">100% Income Ownership</span>
                </div>
                <p className="text-xs font-bold text-muted">
                  You keep 100% of your sales and can download all deliverables as vector SVG, PDF, and HTML5.
                </p>
              </div>
            </div>

            {/* Quote Callout Box */}
            <div className="relative b3 border-[3px] border-ink bg-sun/40 p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
              <Quote className="absolute right-3 top-3 h-7 w-7 sm:h-8 sm:w-8 text-ink/20" />
              <p className="font-extrabold text-sm md:text-base italic text-ink pr-6">
                "The ambition was never the issue. It was the friction of execution.
                With 1 Click Business, you follow each step in order and walk away with a real business ready to generate your own income."
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-widest text-ink">
                — Daniel Collins, Creator &amp; Founder
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openQuickStart()}
                className="btn btn-yellow w-full sm:w-auto cursor-pointer"
              >
                <Zap className="h-4 w-4 shrink-0" strokeWidth={3} /> <span>Try Daniel's 1-Click Wizard</span>
              </button>
              <Link to="/advisor" className="btn btn-quiet w-full sm:w-auto">
                <span>Consult Solomon™ Advisor</span> <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={3} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
