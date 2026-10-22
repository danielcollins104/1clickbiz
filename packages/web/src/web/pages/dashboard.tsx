import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowUpRight, Check, ExternalLink, Globe, Loader2, Lock, Pencil, Plus, RefreshCw, Sparkles, X, Zap } from "lucide-react";
import { Onboarding } from "../components/onboarding";
import { useUpdateOnboarding } from "../queries/launch";
import { PageLoader } from "../components/protected-route";
import { ProductIcon } from "../components/product-art";
import { STATUS, TOOLS, type Img } from "../lib/tools";
import { money } from "../lib/format";
import { useCart } from "../lib/cart";
import {
  errorMessage,
  useAccess,
  useBusiness,
  useBusinesses,
  useRebuild,
  useRefreshAccess,
  useSession,
  useUpdateSlug,
} from "../queries/business";

type Asset = { status: string; content: Record<string, unknown> | null; error: string | null };

/** A one-line preview of each tool's output for the dashboard card. */
function Preview({ tool, a, leads = 0 }: { tool: string; a: Asset; leads?: number }) {
  const c = a.content as Record<string, any> | null;
  if (!c) return null;
  const pick = <T,>(arr: T[] | undefined, i: unknown) => arr?.[typeof i === "number" ? i : 0];
  switch (tool) {
    case "idea-wizard":
      return <p className="line-clamp-2 text-sm font-bold">{pick(c.ideas as { title: string }[], c.chosen)?.title}</p>;
    case "name-generator":
      return <p className="display text-xl">{pick(c.names as { name: string }[], c.chosen)?.name}</p>;
    case "business-plan":
      return <p className="line-clamp-2 text-sm font-semibold">{c.executiveSummary}</p>;
    case "brand-generator":
      return <p className="line-clamp-2 text-sm font-semibold">"{c.mission}"</p>;
    case "color-font-system":
      return (
        <div className="flex">
          {(c.colors ?? []).map((x: { hex: string }) => (
            <span key={x.hex} className="h-7 flex-1 border-[3px] border-ink [&:not(:first-child)]:border-l-0" style={{ background: x.hex }} />
          ))}
        </div>
      );
    case "logo-generation": {
      const img = pick(c.concepts as { image: Img }[] | undefined, c.chosen)?.image;
      return img?.url ? <img src={img.url} alt="Chosen logo" className="b3 h-16 w-16 bg-paper object-contain" /> : null;
    }
    case "website-generator":
      return <p className="line-clamp-2 text-sm font-bold">{c.hero?.headline}</p>;
    case "ad-generator":
      return <p className="text-sm font-bold">{(c.ads ?? []).length} ads · {(c.images ?? []).length} images</p>;
    case "social-generator":
      return <p className="text-sm font-bold">{(c.posts ?? []).length} posts planned</p>;
    case "launch-checklist": {
      const items = (c.items ?? []) as { done: boolean }[];
      return <p className="text-sm font-bold">{items.filter((i) => i.done).length} of {items.length} legal tasks done</p>;
    }
    case "funding-finder":
      return <p className="text-sm font-bold">{(c.results ?? []).length} funding leads found</p>;
    case "customer-crm":
      return <p className="text-sm font-bold">{leads === 1 ? "1 contact" : `${leads} contacts`}</p>;
    case "ai-advisor":
      return <p className="line-clamp-2 text-sm font-semibold">{c.headline}</p>;
    case "cold-outreach":
      return <p className="line-clamp-2 text-sm font-bold">{(c.sequence ?? []).length}-step sequence · {c.icp?.targetTitle ?? "B2B Outreach"}</p>;
    case "competitor-radar":
      return <p className="line-clamp-2 text-sm font-semibold">{(c.competitors ?? []).length} competitors audited · {c.defensiveMoat?.unfairAdvantage ?? ""}</p>;
    case "seo-engine":
      return <p className="line-clamp-2 text-sm font-bold">{(c.commercialKeywords ?? []).length} keywords · {(c.pillarArticles ?? []).length} pillar briefs</p>;
    default:
      return null;
  }
}

export default function DashboardPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [, navigate] = useLocation();
  const { data: session } = useSession();
  const { data: access, isLoading: accessLoading } = useAccess();
  const { data: list, isLoading: listLoading } = useBusinesses();
  const refresh = useRefreshAccess();
  const rebuild = useRebuild();
  const onboarding = useUpdateOnboarding();
  const { add } = useCart();
  const updateSlug = useUpdateSlug();
  const [rebuildError, setRebuildError] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState(false);
  const [customSlugInput, setCustomSlugInput] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugSuccess, setSlugSuccess] = useState<string | null>(null);
  const justPaid = params.get("checkout") === "success";
  const tried = useRef(0);

  const bizId = Number(params.get("b")) || list?.[0]?.id;
  const { data, isLoading: bizLoading } = useBusiness(bizId);

  // After Stripe redirects back, the subscription can take a moment to land. Re-check a few times.
  useEffect(() => {
    if (!justPaid || refresh.isPending) return;
    if (tried.current >= 4) return;
    if (tried.current > 0 && (access?.tools.length ?? 0) > 0) return;
    const t = setTimeout(() => {
      tried.current += 1;
      refresh.mutate({});
    }, tried.current === 0 ? 0 : 2500);
    return () => clearTimeout(t);
  }, [justPaid, access, refresh]);

  if (accessLoading || listLoading) return <PageLoader label="Loading your dashboard" />;

  const owned = new Set(access?.tools ?? []);
  const gens = access?.generations;
  const firstName = session?.user.name?.split(" ")[0];

  const assets = (data?.assets ?? {}) as Record<string, Asset>;
  const ownedTools = TOOLS.filter((t) => owned.has(t.slug));
  const doneCount = ownedTools.filter((t) => assets[t.slug]?.status === "done").length;
  const building = data?.running || ownedTools.some((t) => assets[t.slug]?.status === "running");
  const siteReady = assets["website-generator"]?.status === "done";
  const activePlans = (access?.plans ?? []).filter((p) => p.status === "active");
  const redundantSingles =
    activePlans.some((p) => p.planId === "phase_1_launch") && activePlans.some((p) => p.planId.startsWith("tool_") && !p.canceling);

  return (
    <div>
      {/* banner */}
      <section className="relative border-b-[3px] border-ink bg-ink">
        <img src="/images/dashboard-banner.webp" alt="Three founders in black and yellow" className="h-56 w-full object-cover object-[center_20%] opacity-90 md:h-72" />
        <div className="absolute inset-0 mx-auto flex max-w-[1400px] items-end px-4 pb-6 md:px-8">
          <div className="b3 hard max-w-2xl bg-paper p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em]">
              {data ? "Your business" : `Welcome${firstName ? `, ${firstName}` : ""}`}
            </p>
            <h1 className="display mt-1 text-4xl md:text-6xl">{data?.business.name ?? "Dashboard"}</h1>
            {data && (
              <p className="mt-2 text-sm font-extrabold uppercase">
                {building ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} /> Building · {doneCount}/{ownedTools.length} ready</span>
                ) : (
                  <span>{doneCount}/{ownedTools.length} tools ready</span>
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
        {justPaid && (
          <div className="b3 hard mb-8 flex flex-wrap items-center justify-between gap-4 bg-mint p-4">
            <p className="flex items-center gap-2 font-extrabold">
              {owned.size ? <Check className="h-5 w-5" strokeWidth={4} /> : <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} />}
              {owned.size ? `Payment received. ${owned.size} tool${owned.size === 1 ? "" : "s"} unlocked.` : "Confirming your payment…"}
            </p>
            {owned.size > 0 && !list?.length && (
              <Link to="/start" className="btn btn-sm">Start the intake <ArrowUpRight className="h-4 w-4" strokeWidth={3} /></Link>
            )}
          </div>
        )}

        {redundantSingles && (
          <div className="b3 hard mb-8 flex flex-wrap items-center justify-between gap-4 bg-cream p-4">
            <p className="font-extrabold">Your bundle covers your single-tool plans, and they're still billing.</p>
            <Link to="/account" className="btn btn-sm">Stop them <ArrowUpRight className="h-4 w-4" strokeWidth={3} /></Link>
          </div>
        )}

        <Onboarding tools={owned.size} bizId={bizId} slug={data?.business.slug} building={!!building} complete={!!data && ownedTools.length > 0 && doneCount === ownedTools.length} siteReady={siteReady} leadCount={data?.leadCount ?? 0} />

        {/* top bar */}
        <div className="flex flex-col gap-4 border-b-[3px] border-ink pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {list && list.length > 1 && (
              <select
                aria-label="Switch business"
                className="input !w-auto !py-2 text-sm"
                value={bizId}
                onChange={(e) => navigate(`/dashboard?b=${e.target.value}`)}
              >
                {list.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
            <span className="chip bg-paper">{owned.size} of 13 tools unlocked</span>
            {gens && (
              <span className="chip bg-cream">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={3} /> {gens.remaining} / {gens.granted} generations left
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {siteReady && data && (
              <a href={`/sites/${data.business.slug}`} onClick={() => onboarding.mutate({ openedSite: true })} target="_blank" rel="noreferrer" className="btn btn-sm btn-yellow">
                <ExternalLink className="h-4 w-4" strokeWidth={3} /> View live site
              </a>
            )}
            {data && (
              <>
                <Link to={`/start?edit=${data.business.id}`} className="btn btn-sm btn-quiet">
                  <Pencil className="h-4 w-4" strokeWidth={3} /> Edit answers
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-quiet"
                  disabled={building || rebuild.isPending}
                  onClick={() => {
                    if (!confirm("Rebuild every tool from scratch? Your current outputs will be replaced.")) return;
                    setRebuildError(null);
                    rebuild.mutate({ id: data.business.id }, { onError: (e) => setRebuildError(errorMessage(e)) });
                  }}
                >
                  <RefreshCw className={`h-4 w-4 ${rebuild.isPending ? "animate-spin" : ""}`} strokeWidth={3} /> Rebuild all
                </button>
              </>
            )}
            {owned.size > 0 && (
              <Link to="/start" className="btn btn-sm">
                <Plus className="h-4 w-4" strokeWidth={3} /> New business
              </Link>
            )}
          </div>
        </div>
        {rebuildError && <p role="alert" className="b3 mt-4 bg-paper p-3 font-extrabold">{rebuildError}</p>}

        {/* Free Live Website URL Bar & Custom URL Slug Selector */}
        {data && (
          <div className="b3 hard mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-paper p-4 border-[2.5px] border-ink shadow-[3px_3px_0px_#000]">
            <div className="flex items-start sm:items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center bg-sun text-ink border-2 border-ink shadow-[2px_2px_0px_#000]">
                <Globe className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-wider text-muted">Your Free Live Website URL</p>
                  <span className="chip bg-mint text-ink text-[10px] font-black px-1.5 py-0.2">100% FREE</span>
                </div>
                <p className="font-mono text-sm font-black text-ink break-all mt-0.5">
                  {typeof window !== "undefined" ? window.location.origin : ""}/sites/<span className="text-blue-700 bg-sun/40 px-1 border border-ink/40 font-bold">{data.business.slug}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomSlugInput(data.business.slug);
                  setSlugError(null);
                  setSlugSuccess(null);
                  setEditingSlug(true);
                }}
                className="btn btn-sm btn-quiet flex items-center gap-1.5 text-xs font-black border-2 border-ink"
                title="Choose your own free custom URL name"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Choose Free URL Name</span>
              </button>
              {siteReady && (
                <a
                  href={`/sites/${data.business.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onboarding.mutate({ openedSite: true })}
                  className="btn btn-sm btn-yellow flex items-center gap-1.5 text-xs font-black border-2 border-ink shadow-[2px_2px_0px_#000]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open Site ↗</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Custom URL Selection Modal */}
        {editingSlug && data && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close"
              className="fixed inset-0 bg-ink/70 backdrop-blur-xs cursor-default"
              onClick={() => !updateSlug.isPending && setEditingSlug(false)}
            />
            <div className="relative w-full max-w-lg bg-paper border-[3px] border-ink shadow-[6px_6px_0px_#000] p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-ink" />
                  <h3 className="display text-2xl">Choose Your Free URL Name</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSlug(false)}
                  disabled={updateSlug.isPending}
                  className="btn btn-sm btn-quiet !p-1.5 border border-ink"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs font-bold text-ink/80 mb-4">
                Choose any custom name for your live business website. Only lowercase letters, numbers, and hyphens are allowed.
              </p>

              {slugError && (
                <div className="bg-rose-50 border-2 border-rose-600 p-2.5 text-rose-800 text-xs font-bold mb-3">
                  {slugError}
                </div>
              )}
              {slugSuccess && (
                <div className="bg-mint/30 border-2 border-ink p-2.5 text-ink text-xs font-bold mb-3">
                  {slugSuccess}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSlugError(null);
                  const clean = customSlugInput.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
                  if (!clean || clean.length < 2) {
                    setSlugError("Please enter at least 2 characters.");
                    return;
                  }
                  updateSlug.mutate(
                    { id: data.business.id, slug: clean },
                    {
                      onSuccess: (res) => {
                        setSlugSuccess(`URL updated! New link: /sites/${res.slug}`);
                        setTimeout(() => {
                          setEditingSlug(false);
                        }, 1000);
                      },
                      onError: (err) => {
                        setSlugError(errorMessage(err));
                      },
                    }
                  );
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="custom-slug-field" className="block text-xs font-black uppercase tracking-wider mb-1">
                    Your Web Address Slug:
                  </label>
                  <div className="flex items-center border-[2.5px] border-ink bg-white shadow-[2px_2px_0px_#000]">
                    <span className="bg-cream px-3 py-2 text-xs font-bold text-muted border-r-2 border-ink select-none hidden sm:inline">
                      /sites/
                    </span>
                    <input
                      id="custom-slug-field"
                      type="text"
                      aria-label="Custom website URL slug"
                      value={customSlugInput}
                      onChange={(e) => setCustomSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                      placeholder="my-awesome-business"
                      className="w-full px-3 py-2 text-sm font-bold outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-muted font-bold mt-1.5">
                    Live preview: {typeof window !== "undefined" ? window.location.origin : ""}/sites/{customSlugInput || "your-name"}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingSlug(false)}
                    disabled={updateSlug.isPending}
                    className="btn btn-sm btn-quiet border border-ink text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateSlug.isPending || !customSlugInput.trim()}
                    className="btn btn-sm btn-yellow border-2 border-ink font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                  >
                    {updateSlug.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        <span>Save Free URL</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* empty states */}
        {!list?.length && (
          <div className="b3 hard mt-10 grid items-center gap-8 bg-paper p-6 md:grid-cols-[280px_1fr] md:p-8">
            <img src="/images/stage-1.webp" alt="Clipboard with an empty checklist" className="b3 aspect-square w-full object-cover" />
            {owned.size ? (
              <div>
                <h2 className="display text-4xl md:text-5xl">Answer 8 questions. Watch it build.</h2>
                <p className="mt-3 max-w-xl font-bold">Your {owned.size} unlocked tool{owned.size === 1 ? "" : "s"} run in order, and each one feeds the next.</p>
                <Link to="/start" className="btn mt-6"><Zap className="h-5 w-5" strokeWidth={3} /> Start the intake</Link>
              </div>
            ) : (
              <div>
                <h2 className="display text-4xl md:text-5xl">No active subscription yet.</h2>
                <p className="mt-3 max-w-xl font-bold">Subscribe to an individual AI engine, or unlock all 13 with the Phase 1 All-Access Pass, and your workspace opens right here.</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to="/subscribe" className="btn"><Zap className="h-5 w-5" strokeWidth={3} /> Subscribe All-Access · $99/mo</Link>
                  <Link to="/pricing" className="btn btn-quiet">Compare Subscription Plans</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* tool grid */}
        {(list?.length ?? 0) > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TOOLS.map((t) => {
              const locked = !owned.has(t.slug);
              const a = assets[t.slug];
              const status = locked ? "locked" : a?.status ?? "idle";
              const st = STATUS[status] ?? STATUS.idle!;
              const body = (
                <>
                  <div className="flex items-center justify-between border-b-[3px] border-ink px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className={`grid h-9 w-9 place-items-center b3 ${locked ? "bg-cream" : "bg-sun"}`}>
                        <ProductIcon name={t.icon} className="h-5 w-5" />
                      </span>
                      <span className="display text-lg">{t.num}</span>
                    </span>
                    <span className={`chip ${st.cls}`}>
                      {status === "running" && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={3} />}
                      {status === "locked" && <Lock className="h-3 w-3" strokeWidth={3} />}
                      {st.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="display text-xl leading-tight">{t.name}</h3>
                    <div className="mt-3 flex-1">
                      {locked ? (
                        <p className="text-sm font-semibold text-muted">{t.tagline}</p>
                      ) : status === "running" ? (
                        <div className="space-y-2">
                          <div className="h-3 w-5/6 animate-pulse bg-cream" />
                          <div className="h-3 w-2/3 animate-pulse bg-cream" />
                        </div>
                      ) : status === "error" ? (
                        <p className="line-clamp-2 text-sm font-bold">{a?.error ?? "Generation failed."}</p>
                      ) : a ? (
                        <Preview tool={t.slug} a={a} leads={data?.leadCount ?? 0} />
                      ) : (
                        <p className="text-sm font-semibold text-muted">Not generated yet.</p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm font-extrabold uppercase">
                      {locked ? (
                        <>
                          <span>{money(t.price)}/mo</span>
                          <span className="flex items-center gap-1">Unlock <ArrowUpRight className="h-4 w-4" strokeWidth={3} /></span>
                        </>
                      ) : (
                        <span className="ml-auto flex items-center gap-1">Open <ArrowUpRight className="h-4 w-4" strokeWidth={3} /></span>
                      )}
                    </div>
                  </div>
                </>
              );
              const cls = `card card-lift flex flex-col no-underline ${locked ? "bg-paper opacity-80" : "bg-paper"}`;
              return locked ? (
                <Link key={t.slug} to={`/product/${t.slug}`} className={cls} onClick={() => add(t, { open: false })}>
                  {body}
                </Link>
              ) : (
                <Link key={t.slug} to={`/dashboard/${t.slug}?b=${bizId}`} className={cls}>
                  {body}
                </Link>
              );
            })}
          </div>
        )}
        {bizLoading && (list?.length ?? 0) > 0 && !data && (
          <p className="mt-6 flex items-center gap-2 font-extrabold"><Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> Loading tools…</p>
        )}
      </div>
    </div>
  );
}
