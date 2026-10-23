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
      title: "1. Create your account",
      desc: "Your founder workspace is active and saves all generated assets.",
    },
    {
      title: "2. Unlock your AI tools",
      desc: "Unlock all 13 AI engines so your plan, brand, website, and ads build together.",
    },
    {
      title: "3. Answer 8 intake questions",
      desc: "Tell us your skills, budget, location, and idea so the AI can tailor your business.",
    },
    {
      title: "4. Review your 13 deliverables",
      desc: "Open each card below to pick your business name, logo, 5-year plan, and ad copy.",
    },
    {
      title: "5. Open your free live website",
      desc: "Preview your live hosted site and customize your free /sites/your-name URL.",
    },
    {
      title: "6. Share your link & get a lead",
      desc: "Send your live website link to customers—every inquiry lands in Tool #12 (CRM).",
    },
  ];

  return (
    <section className="b3 hard mb-8 bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-ink bg-sun/40 p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-ink px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-sun">
              <Sparkles className="h-3 w-3 text-mint" /> Step-by-Step Launch Guide
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest">
              {done} of 6 steps complete
            </span>
          </div>
          <h2 className="display mt-2 text-2xl md:text-3xl">
            Follow these 6 steps to get your business open &amp; making sales.
          </h2>
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
                      Do Next
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold text-ink/75 leading-relaxed">
                  {item.desc}
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
                      Preview Your Live Site ↗
                    </a>
                  ) : (
                    <Link
                      to={`/dashboard/website-generator${bizId ? `?b=${bizId}` : ""}`}
                      className="ulink text-xs font-black"
                    >
                      Open Tool #07 (Website Generator) →
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
