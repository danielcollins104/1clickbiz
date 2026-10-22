import { useState } from "react";
import { Link, useSearch } from "wouter";
import { AlertTriangle, ArrowLeft, ArrowUpRight, Loader2, Lock, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { PageLoader } from "../components/protected-route";
import { ProductIcon } from "../components/product-art";
import { EDIT_HINTS, UPSTREAM, VIEWERS } from "../components/viewers";
import { STATUS, toolBySlug } from "../lib/tools";
import { money } from "../lib/format";
import { useCart } from "../lib/cart";
import { errorMessage, useAccess, useBusiness, useBusinesses, useChoose, useRebuild, useRegenerate } from "../queries/business";

const NEXT_WAVE: Record<string, string> = {
  "idea-wizard": "name-generator",
  "name-generator": "business-plan",
  "brand-generator": "color-font-system",
  "color-font-system": "logo-generation",
};

export default function ToolPage({ slug }: { slug: string }) {
  const tool = toolBySlug(slug);
  const params = new URLSearchParams(useSearch());
  const { data: access, isLoading: accessLoading } = useAccess();
  const { data: list, isLoading: listLoading } = useBusinesses();
  const bizId = Number(params.get("b")) || list?.[0]?.id;
  const { data, isLoading: bizLoading, error: bizError } = useBusiness(bizId);
  const regenerate = useRegenerate();
  const rebuild = useRebuild();
  const choose = useChoose();
  const { add } = useCart();
  const [instruction, setInstruction] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [offerRebuild, setOfferRebuild] = useState(false);

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="display text-5xl">No such tool.</h1>
        <Link to="/dashboard" className="btn mt-6">Back to dashboard</Link>
      </div>
    );
  }
  if (accessLoading || listLoading || (bizId && bizLoading)) return <PageLoader label={`Opening ${tool.name}`} />;

  const owned = access?.tools.includes(slug) ?? false;
  const asset = data?.assets[slug];
  const statuses = Object.fromEntries(Object.entries(data?.assets ?? {}).map(([k, v]) => [k, v.status]));
  const running = regenerate.isPending || asset?.status === "running";
  const status = !owned ? "locked" : running ? "running" : asset?.status ?? "idle";
  const st = STATUS[status] ?? STATUS.idle!;
  const Viewer = VIEWERS[slug];
  const gens = access?.generations;
  const outOfGens = gens ? gens.remaining <= 0 : false;
  const content = asset?.content as Record<string, unknown> | null | undefined;
  const isChat = slug === "ai-advisor";
  const isCrm = slug === "customer-crm";

  const run = (text?: string) => {
    if (!data) return;
    setErr(null);
    regenerate.mutate(
      { id: data.business.id, tool: slug, instruction: text },
      {
        onSuccess: () => {
          setInstruction("");
          if (UPSTREAM.has(slug)) setOfferRebuild(true);
        },
        onError: (e) => setErr(errorMessage(e)),
      },
    );
  };

  const onChoose = (index: number) => {
    if (!data) return;
    setErr(null);
    choose.mutate(
      { id: data.business.id, tool: slug as "idea-wizard" | "name-generator" | "logo-generation", index },
      {
        onSuccess: () => slug !== "logo-generation" && setOfferRebuild(true),
        onError: (e) => setErr(errorMessage(e)),
      },
    );
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      <Link to={`/dashboard${bizId ? `?b=${bizId}` : ""}`} className="ulink inline-flex items-center gap-2 text-sm font-extrabold uppercase">
        <ArrowLeft className="h-4 w-4" strokeWidth={3} /> Dashboard
      </Link>

      {/* header */}
      <header className="mt-5 grid gap-6 border-b-[3px] border-ink pb-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex items-start gap-4">
          <img src={tool.image} alt="" className="b3 hard hidden h-24 w-24 bg-paper object-cover sm:block" />
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em]">
              <ProductIcon name={tool.icon} className="h-4 w-4" /> Tool {tool.num} · {tool.category}
              {data && <> · {data.business.name}</>}
            </p>
            <h1 className="display mt-1 text-4xl md:text-6xl">{tool.name}</h1>
            <p className="mt-2 max-w-2xl font-bold">{tool.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`chip ${st.cls}`}>
            {status === "running" && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={3} />}
            {status === "locked" && <Lock className="h-3 w-3" strokeWidth={3} />}
            {st.label}
          </span>
          {gens && owned && (
            <span className="chip bg-cream"><Sparkles className="h-3.5 w-3.5" strokeWidth={3} /> {gens.remaining} left</span>
          )}
          {owned && data && !isCrm && (
            <button type="button" className="btn btn-sm btn-quiet" disabled={running || outOfGens} onClick={() => run()}>
              <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} strokeWidth={3} /> {asset?.content ? "Regenerate" : "Generate"}
            </button>
          )}
        </div>
      </header>

      {err && (
        <p role="alert" className="b3 mt-6 flex items-center gap-2 bg-paper p-3 font-extrabold">
          <AlertTriangle className="h-5 w-5" strokeWidth={3} /> {err}
        </p>
      )}
      {outOfGens && owned && (
        <p className="b3 mt-6 bg-cream p-3 font-extrabold">You've used this month's AI generations. They reset when your plan renews.</p>
      )}
      {offerRebuild && data && NEXT_WAVE[slug] && (
        <div className="b3 hard mt-6 flex flex-wrap items-center justify-between gap-3 bg-sun p-4">
          <p className="font-extrabold">Other tools were built from the old version. Rebuild them to match?</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-sm"
              disabled={rebuild.isPending || data.running}
              onClick={() =>
                rebuild.mutate(
                  { id: data.business.id, from: NEXT_WAVE[slug] },
                  { onSuccess: () => setOfferRebuild(false), onError: (e) => setErr(errorMessage(e)) },
                )
              }
            >
              <RefreshCw className="h-4 w-4" strokeWidth={3} /> Rebuild the rest
            </button>
            <button type="button" className="btn btn-sm btn-quiet" onClick={() => setOfferRebuild(false)}>Not now</button>
          </div>
        </div>
      )}

      <div className="mt-8">
        {/* locked */}
        {!owned ? (
          <div className="card grid items-center gap-8 bg-paper p-6 md:grid-cols-[320px_1fr] md:p-8">
            <img src={tool.image} alt={tool.name} className="b3 aspect-square w-full bg-cream object-cover" />
            <div>
              <span className="chip bg-ink text-sun"><Lock className="h-3.5 w-3.5" strokeWidth={3} /> Not in your plan</span>
              <h2 className="display mt-4 text-4xl">Unlock {tool.name}</h2>
              <p className="mt-3 max-w-xl font-semibold">{tool.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/cart" className="btn" onClick={() => add(tool, { open: false })}>
                  Subscribe · {money(tool.price)}/mo <ArrowUpRight className="h-5 w-5" strokeWidth={3} />
                </Link>
                <Link to="/product/phase-1-launch" className="btn btn-quiet">All 13 for $99/mo</Link>
              </div>
            </div>
          </div>
        ) : !data ? (
          /* no business yet */
          <div className="card grid items-center gap-8 bg-paper p-6 md:grid-cols-[280px_1fr] md:p-8">
            <img src="/images/stage-1.webp" alt="" className="b3 aspect-square w-full object-cover" />
            <div>
              <h2 className="display text-4xl">{bizError ? "Couldn't load that business." : "Start with 8 questions."}</h2>
              <p className="mt-3 font-semibold">{bizError ? errorMessage(bizError) : `${tool.name} works from your intake answers. Answer them once and every tool you own builds.`}</p>
              <Link to="/start" className="btn mt-6"><Wand2 className="h-5 w-5" strokeWidth={3} /> Start the intake</Link>
            </div>
          </div>
        ) : status === "running" && !content ? (
          /* first build */
          <div className="card grid items-center gap-8 bg-paper p-6 md:grid-cols-[280px_1fr] md:p-8">
            <img src={tool.image} alt="" className="b3 aspect-square w-full animate-pulse bg-cream object-cover" />
            <div>
              <p className="flex items-center gap-3 display text-3xl"><Loader2 className="h-8 w-8 animate-spin" strokeWidth={3} /> Building {tool.name}…</p>
              <p className="mt-3 font-semibold">
                {data.running ? "Your tools build in order. This one starts once the tools it depends on are done." : "This usually takes under a minute. Image tools take longer."}
              </p>
              <div className="mt-6 space-y-3">
                <div className="h-4 w-5/6 animate-pulse bg-cream" />
                <div className="h-4 w-2/3 animate-pulse bg-cream" />
                <div className="h-4 w-3/4 animate-pulse bg-cream" />
              </div>
            </div>
          </div>
        ) : !content && !isCrm ? (
          /* error / never run */
          <div className="card bg-paper p-6 md:p-8">
            <h2 className="display flex items-center gap-3 text-3xl">
              {asset?.status === "error" ? <><AlertTriangle className="h-8 w-8" strokeWidth={3} /> That didn't work.</> : "Not generated yet."}
            </h2>
            {asset?.error && <p className="mt-3 font-semibold">{asset.error}</p>}
            <button type="button" className="btn mt-6" disabled={running || outOfGens} onClick={() => run()}>
              <RefreshCw className="h-5 w-5" strokeWidth={3} /> {asset?.status === "error" ? "Try again" : "Generate now"}
            </button>
          </div>
        ) : (
          <>
            {/* describe a change */}
            {!isChat && !isCrm && (
              <form
                className="card mb-8 flex flex-col gap-3 bg-cream p-4 md:flex-row md:items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (instruction.trim()) run(instruction.trim());
                }}
              >
                <label htmlFor="instruction" className="flex shrink-0 items-center gap-2 font-extrabold uppercase">
                  <Wand2 className="h-5 w-5" strokeWidth={3} /> Change it
                </label>
                <input
                  id="instruction"
                  aria-label="Describe what to change"
                  className="input"
                  maxLength={800}
                  placeholder={EDIT_HINTS[slug] ?? "Describe what to change"}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  disabled={running}
                />
                <button className="btn shrink-0" disabled={running || outOfGens || !instruction.trim()}>
                  {running ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <Sparkles className="h-5 w-5" strokeWidth={3} />}
                  {running ? "Working…" : "Apply"}
                </button>
              </form>
            )}
            {running && content && (
              <p className="mb-6 flex items-center gap-2 font-extrabold">
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> Generating a new version. The current one stays until it's ready.
              </p>
            )}
            {asset?.error && content && !running && (
              <p className="b3 mb-6 bg-paper p-3 text-sm font-extrabold">Last attempt failed: {asset.error}. Showing the previous version.</p>
            )}
            <div className={running && content ? "pointer-events-none opacity-60" : ""}>
              {Viewer && (
                <Viewer
                  content={(content ?? {}) as Record<string, unknown>}
                  bizId={data.business.id}
                  bizSlug={data.business.slug}
                  bizName={data.business.name}
                  statuses={statuses}
                  choose={onChoose}
                  choosing={choose.isPending}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
