import { Link } from "wouter";
import { Check, ArrowUpRight, X } from "lucide-react";
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
  const steps = [
    true,
    tools > 0,
    !!bizId,
    complete && !building,
    !!state?.openedSite,
    !!state?.sharedSite || leadCount > 0,
  ];
  const done = steps.filter(Boolean).length;
  if (isLoading || state?.dismissed || done === steps.length) return null;
  return (
    <section className="b3 hard mb-8 bg-paper">
      <header className="flex items-center justify-between gap-4 border-b-[3px] border-ink p-5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest">
            Your launch path · {done}/6 complete
          </p>
          <h2 className="display mt-2 text-2xl md:text-3xl">
            Get your business open.
          </h2>
        </div>
        <button
          className="btn btn-sm btn-quiet !p-2"
          aria-label="Dismiss getting-started checklist"
          disabled={update.isPending}
          onClick={() => update.mutate({ dismissed: true })}
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      <div className="grid md:grid-cols-3">
        {[
          "Create your account",
          "Pick your plan",
          "Answer 8 questions",
          "Finish your first build",
          "Open your live site",
          "Share it / get a lead",
        ].map((label, i) => (
          <div
            className="border-b-[3px] border-ink p-5 md:[&:not(:nth-child(3n))]:border-r-[3px]"
            key={label}
          >
            <p className="flex items-center gap-2 font-extrabold">
              <span
                className={`b3 flex h-6 w-6 shrink-0 items-center justify-center text-xs ${steps[i] ? "bg-mint" : "bg-cream"}`}
              >
                {steps[i] ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              {label}
            </p>
            {!steps[i] && (
              <div className="mt-3">
                {i === 1 ? (
                  <Link to="/pricing" className="ulink text-sm font-bold">
                    Choose subscription plan <ArrowUpRight className="inline h-4 w-4" />
                  </Link>
                ) : i === 2 ? (
                  <Link to="/start" className="ulink text-sm font-bold">
                    Start intake
                  </Link>
                ) : i === 3 ? (
                  <p className="text-sm font-semibold">
                    {building
                      ? "Building now…"
                      : "Run any unfinished tools from the cards below."}
                  </p>
                ) : i === 4 ? (
                  siteReady && slug ? (
                    <a
                      href={`/sites/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ulink text-sm font-bold"
                      onClick={() => update.mutate({ openedSite: true })}
                    >
                      View your site ↗
                    </a>
                  ) : (
                    <p className="text-sm">Requires Website Generator</p>
                  )
                ) : i === 5 ? (
                  siteReady && slug ? (
                    <button
                      className="ulink text-sm font-bold"
                      type="button"
                      disabled={update.isPending}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/sites/${slug}`,
                          );
                          update.mutate({ sharedSite: true });
                        } catch {
                          setErr(
                            "Copy the site URL from your browser, then share it with a customer.",
                          );
                        }
                      }}
                    >
                      Copy link to share
                    </button>
                  ) : (
                    <p className="text-sm">Your first customer is next.</p>
                  )
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
      {(err || update.error) && (
        <p role="alert" className="p-4 font-bold">
          {err || "Could not save progress. Try again."}
        </p>
      )}
    </section>
  );
}
