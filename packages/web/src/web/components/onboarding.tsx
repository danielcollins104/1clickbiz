import { Link } from "wouter";
import { Check, ArrowUpRight, X, Sparkles, ArrowRight } from "lucide-react";
import { useOnboarding, useUpdateOnboarding } from "../queries/launch";
import { useState } from "react";

export function Onboarding({
  tools,
  bizId,
  slug,
  building,
  complete,
  siteReady,
  leadCount,
}: {
  tools: number;
  bizId?: number;
  slug?: string;
  building: boolean;
  complete: boolean;
  siteReady: boolean;
  leadCount: number;
}) {
  const { data: state, isLoading } = useOnboarding();
  const update = useUpdateOnboarding();
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const steps = [
    true,
    tools > 0,
    !!bizId,
    complete && !building,
    !!state?.openedSite,
    !!state?.sharedSite || leadCount > 0,
  ];
  const done = steps.filter(Boolean).length;
  if (isLoading || state?.dismissed) return null;

  const stepDetails = [
    {
      title: "1. Create your founder account",
      desc: "Step 1 Done! You officially claimed your workspace. Now go right to Step 2 →",
      nextHint: "Leads to Step 2: Unlock your 13 AI income engines →",
    },
    {
      title: "2. Unlock your 13 AI engines",
      desc: "Activate all 13 AI builders so your plan, brand, website, and ads build automatically. Then move to Step 3 →",
      nextHint: "Leads to Step 3: Tell the AI about your dream business →",
    },
    {
      title: "3. Answer 8 quick questions",
      desc: "Share your skills, budget, and location in 60 seconds. Once you click submit, head straight to Step 4 →",
      nextHint: "Leads to Step 4: Watch your 13 business assets come alive →",
    },
    {
      title: "4. Approve your idea, name & logo",
      desc: "Check off your favorite idea card facets, pick your business name, and lock in your logo. Then go to Step 5 →",
      nextHint: "Leads to Step 5: Launch your free live website & web app →",
    },
    {
      title: "5. Open your free live website today",
      desc: "Use the Generative AI Builder (Steps 1 → 2 → 3) to create, iterate until you love it, and publish free! Then finish at Step 6 →",
      nextHint: "Leads to Step 6: Share your link & start earning income! →",
    },
    {
      title: "6. Share your link & make your first income!",
      desc: "Send your live link to customers or post it online—every inquiry lands in Tool #12 (CRM) so you can close sales and get paid!",
      nextHint: "🎉 Goal Reached: Your business is LIVE & ready to generate income!",
    },
  ];

  return (
    <section className="b3 hard mb-8 bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-ink bg-sun/40 p-5">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-ink px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-sun">
              <Sparkles className="h-3 w-3 text-mint" /> Day 1 of Your Financial Independence
            </span>
            <span className="bg-mint border border-ink px-2 py-0.5 text-xs font-black uppercase tracking-wider text-ink">
              {done} of 6 steps complete
            </span>
          </div>
          <h2 className="display mt-2 text-2xl md:text-4xl">
            Your Step-by-Step Path to Real Income &amp; Freedom.
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm font-bold text-ink/85 leading-relaxed">
            Each box below leads directly into the next! Don’t overthink it—just follow <strong>1 → 2 → 3 → 4 → 5 → 6</strong>. Once you complete Step 6, you own a live, cash-flowing business built to bring real income into your life!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-36 h-4 border-2 border-ink bg-white">
            <div
              className="h-full bg-mint transition-all"
              style={{ width: `${Math.round((done / steps.length) * 100)}%` }}
            />
          </div>
          <button
            className="btn btn-sm btn-quiet !p-2"
            aria-label="Dismiss getting-started checklist"
            title="Hide launch guide"
            disabled={update.isPending}
            onClick={() => update.mutate({ dismissed: true })}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Full-width Financial Independence Momentum Banner right above the steps */}
      <div className="border-b-[3px] border-ink bg-ink text-paper px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-black">
        <span className="flex items-center gap-2 text-sun">
          <span>🔥</span>
          <span>
            KEEP GOING! This is the beginning of your financial independence — every step below brings you closer to your own income stream!
          </span>
        </span>
        <span className="text-mint uppercase tracking-wider text-[11px]">
          Step 1 ➔ Step 2 ➔ Step 3 ➔ Live Income!
        </span>
      </div>

      <div className="grid md:grid-cols-3">
        {stepDetails.map((item, i) => {
          const isCurrent = !steps[i] && steps.slice(0, i).every(Boolean);
          return (
            <div
              className={`border-b-[3px] border-ink p-5 md:[&:not(:nth-child(3n))]:border-r-[3px] flex flex-col justify-between ${
                isCurrent ? "bg-sun/25" : steps[i] ? "bg-paper" : "bg-paper/60"
              }`}
              key={item.title}
            >
              <div>
                {i === 2 && (
                  <div className="mb-3 border-2 border-ink bg-mint px-3 py-2 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000] leading-snug">
                    💰 KEEP GOING — YOUR NEW INCOME STARTS HERE! Most people only dream of financial freedom. Answering these 8 quick questions turns your dream into a real, money-making business!
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-extrabold text-sm">
                    <span
                      className={`b3 flex h-6 w-6 shrink-0 items-center justify-center text-xs ${
                        steps[i] ? "bg-mint text-ink" : isCurrent ? "bg-ink text-sun" : "bg-cream"
                      }`}
                    >
                      {steps[i] ? <Check className="h-4 w-4 stroke-[3]" /> : i + 1}
                    </span>
                    {item.title}
                  </p>
                  {isCurrent && (
                    <span className="bg-ink text-sun px-2 py-0.5 text-[10px] font-black uppercase">
                      Do This Now
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold text-ink/80 leading-relaxed">
                  {item.desc}
                </p>
                <p className="mt-2 text-[11px] font-black text-emerald-800 bg-cream/80 border border-ink/20 px-2 py-1">
                  {item.nextHint}
                </p>
              </div>

              <div className="mt-4 pt-2">
                {steps[i] ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-emerald-700">
                    <Check className="h-3.5 w-3.5 stroke-[3]" /> Completed
                  </span>
                ) : i === 1 ? (
                  <Link to="/pricing" className="btn btn-sm btn-yellow text-xs font-black">
                    Choose subscription plan <ArrowUpRight className="inline h-4 w-4" />
                  </Link>
                ) : i === 2 ? (
                  <Link to="/start" className="btn btn-sm btn-yellow text-xs font-black">
                    Start 8-Question Intake <ArrowRight className="inline h-4 w-4" />
                  </Link>
                ) : i === 3 ? (
                  <a href="#phase-tools" className="ulink text-xs font-black uppercase">
                    {building ? "Building now…" : "Review your 13 tools below ↓"}
                  </a>
                ) : i === 4 ? (
                  siteReady && slug ? (
                    <a
                      href={`/sites/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-yellow text-xs font-black"
                      onClick={() => update.mutate({ openedSite: true })}
                    >
                      Open Free Live Website &amp; AI Builder ↗
                    </a>
                  ) : (
                    <Link
                      to={`/dashboard/website-generator${bizId ? `?b=${bizId}` : ""}`}
                      className="btn btn-sm btn-yellow text-xs font-black"
                    >
                      Open Free Live Website Builder →
                    </Link>
                  )
                ) : i === 5 ? (
                  siteReady && slug ? (
                    <button
                      className="btn btn-sm btn-quiet text-xs font-black cursor-pointer"
                      type="button"
                      disabled={update.isPending}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/sites/${slug}`,
                          );
                          setCopied(true);
                          update.mutate({ sharedSite: true });
                          setTimeout(() => setCopied(false), 2500);
                        } catch {
                          setErr(
                            "Copy the site URL from your browser, then share it with a customer.",
                          );
                        }
                      }}
                    >
                      {copied ? "✓ Link Copied!" : "Copy Your Website Link to Share"}
                    </button>
                  ) : (
                    <p className="text-xs font-bold text-muted">Complete Step 5 first to share your link.</p>
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {(err || update.error) && (
        <p role="alert" className="p-4 font-bold">
          {err || "Could not save progress. Try again."}
        </p>
      )}
    </section>
  );
}
