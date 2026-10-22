import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, ArrowRight, Loader2, Lock, Sparkles, Zap } from "lucide-react";
import type { Intake } from "../../api/database/schema";
import { PageLoader } from "../components/protected-route";
import { errorMessage, useAccess, useBusiness, useCreateBusiness, useRebuild, useUpdateIntake } from "../queries/business";

const EMPTY: Intake = { idea: "", skills: "", interests: "", budget: "", hours: "", location: "", customer: "", tone: "" };

const QUICK_TEMPLATES: { label: string; emoji: string; intake: Intake }[] = [
  {
    label: "AI / B2B SaaS",
    emoji: "⚡",
    intake: {
      skills: "Full-stack software engineering, workflow automation, B2B product strategy",
      interests: "AI agents, operations automation, helping agencies save time",
      budget: "$500–$2,000",
      hours: "20–40",
      location: "Austin, Texas, USA",
      customer: "Boutique marketing agencies and consulting firms with 5-25 employees",
      idea: "Automated client onboarding and weekly AI reporting portal for agencies",
      tone: "Bold",
    },
  },
  {
    label: "Local Artisan Food",
    emoji: "🥖",
    intake: {
      skills: "Artisan sourdough baking, hospitality management, local community events",
      interests: "Organic heritage grains, specialty coffee, neighborhood gathering spaces",
      budget: "$2,000–$10,000",
      hours: "Full-time",
      location: "Portland, Oregon, USA",
      customer: "Local families, remote workers, and weekend foodies seeking fresh organic bakes",
      idea: "Small-batch sourdough micro-bakery with weekly subscription bread drops",
      tone: "Friendly",
    },
  },
  {
    label: "Eco DTC Brand",
    emoji: "🌿",
    intake: {
      skills: "Product design, e-commerce marketing, sustainable supply chains",
      interests: "Zero-waste home essentials, botanical scents, clean living",
      budget: "$2,000–$10,000",
      hours: "10–20",
      location: "Denver, Colorado, USA",
      customer: "Eco-conscious homeowners tired of single-use plastic cleaning bottles",
      idea: "Waterless plant-based home cleaning tablets with reusable frosted glass spray bottles",
      tone: "Calm",
    },
  },
  {
    label: "Home Service Pro",
    emoji: "🏠",
    intake: {
      skills: "Residential maintenance, smart home installs, preventative home care",
      interests: "Architecture, home reliability, stress-free property ownership",
      budget: "$500–$2,000",
      hours: "Full-time",
      location: "Nashville, Tennessee, USA",
      customer: "Busy dual-income homeowners who want one trusted pro on a monthly retainer",
      idea: "Subscription preventative home maintenance and quarterly tune-up service",
      tone: "Expert",
    },
  },
];

type Field = {
  key: keyof Intake;
  label: string;
  hint: string;
  kind: "text" | "area" | "chips";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

const STEPS: { title: string; img: string; fields: Field[] }[] = [
  {
    title: "You",
    img: "/images/stage-1.webp",
    fields: [
      { key: "skills", label: "What are you good at?", hint: "Work experience, hobbies, anything people ask you for help with.", kind: "area", placeholder: "10 years in hospitality, great with people, can bake", required: true },
      { key: "interests", label: "What do you enjoy?", hint: "Topics or industries you'd happily work on every day.", kind: "area", placeholder: "Food, local events, sustainability" },
    ],
  },
  {
    title: "Resources",
    img: "/images/stage-2.webp",
    fields: [
      { key: "budget", label: "Starting budget", hint: "Roughly what you can put in.", kind: "chips", options: ["Under $500", "$500–$2,000", "$2,000–$10,000", "$10,000+"], required: true },
      { key: "hours", label: "Hours per week", hint: "Be honest. The plan is built around it.", kind: "chips", options: ["Under 10", "10–20", "20–40", "Full-time"], required: true },
    ],
  },
  {
    title: "Market",
    img: "/images/stage-4.webp",
    fields: [
      { key: "location", label: "Where are you based?", hint: "City and country. Used for licences, tax and funding.", kind: "text", placeholder: "Austin, Texas, USA", required: true },
      { key: "customer", label: "Who would you love to serve?", hint: "Leave blank if you're not sure yet.", kind: "area", placeholder: "Busy parents who want healthy weeknight meals" },
    ],
  },
  {
    title: "Idea + vibe",
    img: "/images/stage-3.webp",
    fields: [
      { key: "idea", label: "Got an idea already?", hint: "Optional. Leave blank and the Idea Wizard suggests three.", kind: "area", placeholder: "A meal-prep delivery service for my neighbourhood" },
      { key: "tone", label: "How should the brand feel?", hint: "Pick one, or type your own.", kind: "chips", options: ["Bold", "Friendly", "Premium", "Playful", "Calm", "Expert"] },
    ],
  },
];

export default function StartPage() {
  const search = useSearch();
  const editId = Number(new URLSearchParams(search).get("edit")) || undefined;
  const [, navigate] = useLocation();
  const { data: access, isLoading: accessLoading } = useAccess();
  const { data: existing, isLoading: bizLoading } = useBusiness(editId);
  const create = useCreateBusiness();
  const update = useUpdateIntake();
  const rebuild = useRebuild();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Intake>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({ ...EMPTY, ...existing.business.intake });
    } else {
      const pending = localStorage.getItem("1cb_pending_quick_start");
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          setForm((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore parse error
        }
      }
    }
  }, [existing]);

  if (accessLoading || (editId && bizLoading)) return <PageLoader />;

  if (!access?.tools.length) {
    return (
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
        <img src="/images/spot-login.webp" alt="Founder holding up a key" className="b3 hard aspect-[4/5] w-full max-w-md object-cover" />
        <div>
          <span className="chip"><Lock className="h-3.5 w-3.5" strokeWidth={3} /> Subscription Required</span>
          <h1 className="display mt-4 text-6xl md:text-7xl">Subscribe to start building.</h1>
          <p className="mt-4 text-lg font-bold">The 8-question intake feeds every AI engine in your subscription. Pick a single engine or unlock all 13 with the Phase 1 All-Access Pass.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/subscribe" className="btn"><Zap className="h-5 w-5" strokeWidth={3} /> Unlock All 13 · $99/mo</Link>
            <Link to="/pricing" className="btn btn-quiet">Compare Subscription Plans</Link>
          </div>
        </div>
      </div>
    );
  }

  const current = STEPS[step]!;
  const missing = current.fields.filter((f) => f.required && !form[f.key].trim());
  const last = step === STEPS.length - 1;
  const busy = create.isPending || update.isPending || rebuild.isPending;

  const next = () => {
    setError(null);
    if (missing.length) {
      setError(`Answer "${missing[0]!.label}" to continue.`);
      return;
    }
    if (!last) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (editId) {
      update.mutate(
        { id: editId, intake: form },
        {
          onSuccess: () =>
            rebuild.mutate(
              { id: editId },
              {
                onSuccess: () => navigate(`/dashboard?b=${editId}`),
                onError: (e) => setError(errorMessage(e)),
              },
            ),
          onError: (e) => setError(errorMessage(e)),
        },
      );
    } else {
      create.mutate(form, {
        onSuccess: (res) => navigate(`/dashboard?b=${res.id}`),
        onError: (e) => setError(errorMessage(e)),
      });
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em]">{editId ? "Edit your answers" : "Start a business"} · step {step + 1} of {STEPS.length}</p>
          <h1 className="display mt-2 text-6xl md:text-8xl">{current.title}.</h1>
        </div>
        <p className="max-w-sm font-bold">Answer once. Every tool you own reads these answers, so you never type them again.</p>
      </div>

      {/* 1-Click Auto-Fill Starter Templates */}
      <div className="mt-6 b3 bg-cream p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-ink">
          <Sparkles className="h-4 w-4 text-ink fill-sun" />
          <span>Want to test-drive fast? Pre-fill all 8 answers in 1 click:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              type="button"
              onClick={() => {
                setForm(tpl.intake);
                setError(null);
              }}
              className="chip bg-paper hover:bg-sun text-ink text-xs font-black cursor-pointer transition-colors"
            >
              <span>{tpl.emoji}</span>
              <span>{tpl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* progress */}
      <div className="mt-8 grid grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={`b3 h-4 ${i <= step ? "bg-ink" : "bg-paper"} ${i < step ? "cursor-pointer" : "cursor-default"}`}
            aria-label={`Step ${i + 1}: ${s.title}`}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_420px]">
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          {current.fields.map((f) => (
            <div key={f.key} className="b3 hard bg-paper p-5 md:p-6">
              <label htmlFor={f.key} className="display block text-2xl md:text-3xl">
                {f.label} {f.required && <span className="text-base">*</span>}
              </label>
              <p className="mt-1 text-sm font-semibold text-muted">{f.hint}</p>
              <div className="mt-4">
                {f.kind === "area" && (
                  <textarea
                    id={f.key}
                    aria-label={f.label}
                    rows={3}
                    maxLength={f.key === "idea" ? 600 : 400}
                    className="input resize-none"
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
                {f.kind === "text" && (
                  <input
                    id={f.key}
                    aria-label={f.label}
                    className="input"
                    maxLength={120}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                )}
                {f.kind === "chips" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {f.options!.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setForm({ ...form, [f.key]: o })}
                          className={`b3 px-4 py-2 font-extrabold ${form[f.key] === o ? "hard bg-ink text-sun" : "bg-paper hover:bg-cream"}`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                    <input
                      id={f.key}
                      aria-label={f.label}
                      className="input"
                      maxLength={f.key === "tone" ? 120 : 80}
                      placeholder="…or type your own"
                      value={f.options!.includes(form[f.key]) ? "" : form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {error && (
            <p role="alert" className="b3 bg-paper p-3 font-extrabold">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            {step > 0 && (
              <button type="button" className="btn btn-quiet" onClick={() => setStep(step - 1)} disabled={busy}>
                <ArrowLeft className="h-4 w-4" strokeWidth={3} /> Back
              </button>
            )}
            <button type="submit" className="btn" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> Starting the build…
                </>
              ) : last ? (
                <>
                  <Zap className="h-5 w-5" strokeWidth={3} /> {editId ? "Save and rebuild" : "Build my business"}
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </>
              )}
            </button>
          </div>
          {last && (
            <p className="text-sm font-semibold text-muted">
              Building runs your {access.tools.length} unlocked tool{access.tools.length === 1 ? "" : "s"} in order. It usually takes a few minutes. You can watch it on the dashboard.
            </p>
          )}
        </form>

        <aside className="hidden md:block">
          <div className="b3 hard sticky top-24 overflow-hidden bg-ink">
            <img key={current.img} src={current.img} alt="" className="rise aspect-[4/5] w-full object-cover" style={{ animationDuration: "0.4s" }} />
          </div>
        </aside>
      </div>
    </div>
  );
}
