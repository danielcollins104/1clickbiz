import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import { useGoogleFonts } from "../components/viewers/design";
import type { Img } from "../lib/tools";
import { errorMessage, useSite, useSubmitLead } from "../queries/business";

function luminance(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return 0;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Black or white, whichever reads better on `hex`. */
function on(hex: string) {
  return luminance(hex) > 0.4 ? "#131313" : "#FFFFFF";
}

/** First colour that has at least 3:1 contrast against `bg` (WCAG large text), else the text colour. */
function readable(bg: string, fallback: string, ...candidates: string[]) {
  const lb = luminance(bg);
  const ok = candidates.find((c) => {
    const l = luminance(c);
    return (Math.max(l, lb) + 0.05) / (Math.min(l, lb) + 0.05) >= 3;
  });
  return ok ?? fallback;
}

type Site = {
  seo?: { title: string; description: string };
  hero?: { eyebrow: string; headline: string; subheadline: string; cta: string };
  about?: { title: string; body: string };
  services?: { title: string; description: string; price: string }[];
  steps?: { title: string; body: string }[];
  benefits?: string[];
  faq?: { q: string; a: string }[];
  contact?: { title: string; body: string; button: string };
  heroImage?: Img;
};

export default function SitePage({ slug }: { slug: string }) {
  const { data, isLoading, error } = useSite(slug);
  const submit = useSubmitLead();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", company: "" });
  const [sent, setSent] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  useGoogleFonts([data?.theme.headingFont, data?.theme.bodyFont]);

  const s = (data?.site ?? {}) as Site;
  useEffect(() => {
    if (!data) return;
    document.title = s.seo?.title || data.name;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", s.seo?.description ?? "");
  }, [data, s.seo?.title, s.seo?.description]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-sun px-4 text-center">
        <div>
          <h1 className="display text-5xl">Site not found.</h1>
          <p className="mt-3 font-bold">{errorMessage(error, "This site doesn't exist or hasn't been generated yet.")}</p>
          <Link to="/" className="btn mt-6">1 Click Business</Link>
        </div>
      </div>
    );
  }

  const t = data.theme;
  const heading = { fontFamily: `"${t.headingFont}", Georgia, serif` };
  const body = { fontFamily: `"${t.bodyFont}", system-ui, sans-serif` };
  const btn = { background: t.primary, color: on(t.primary) };
  const dark = { background: t.secondary, color: on(t.secondary) };
  const logo = data.logo as Img;

  return (
    <div style={{ ...body, background: t.background, color: t.text }} className="min-h-screen">
      {/* nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <a href="#top" className="flex items-center gap-3 no-underline" style={{ color: t.text }}>
          {logo?.url && <img src={logo.url} alt={`${data.name} logo`} className="h-11 w-11 rounded-lg object-contain mix-blend-multiply" />}
          <span className="text-xl font-bold" style={heading}>{data.name}</span>
        </a>
        <nav className="hidden gap-7 text-sm font-semibold md:flex">
          <a href="#services" style={{ color: t.text }}>Services</a>
          <a href="#about" style={{ color: t.text }}>About</a>
          <a href="#faq" style={{ color: t.text }}>FAQ</a>
        </nav>
        <a href="#contact" className="rounded-full px-5 py-2.5 text-sm font-bold" style={btn}>{s.hero?.cta ?? "Get in touch"}</a>
      </header>

      {/* hero */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-2 md:pt-14">
        <div>
          {s.hero?.eyebrow && (
            <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: readable(t.background, t.text, t.accent, t.primary, t.secondary) }}>{s.hero.eyebrow}</p>
          )}
          <h1 className="mt-4 text-4xl leading-[1.05] md:text-6xl" style={heading}>{s.hero?.headline}</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed opacity-85">{s.hero?.subheadline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact" className="rounded-full px-7 py-3.5 font-bold" style={btn}>{s.hero?.cta ?? "Get in touch"}</a>
            <a href="#services" className="rounded-full border-2 px-7 py-3.5 font-bold" style={{ borderColor: t.text, color: t.text }}>See services</a>
          </div>
          {data.tagline && <p className="mt-8 text-sm font-semibold opacity-70">{data.tagline}</p>}
        </div>
        {s.heroImage?.url ? (
          <img src={s.heroImage.url} alt={s.hero?.headline ?? data.name} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl" />
        ) : (
          <div className="aspect-[4/3] w-full rounded-3xl" style={{ background: t.primary }} />
        )}
      </section>

      {/* services */}
      {!!s.services?.length && (
        <section id="services" className="py-20" style={dark}>
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-3xl md:text-5xl" style={heading}>What we offer</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {s.services.map((x) => (
                <div key={x.title} className="rounded-2xl p-6" style={{ background: t.background, color: t.text }}>
                  <h3 className="text-xl font-bold" style={heading}>{x.title}</h3>
                  <p className="mt-3 leading-relaxed opacity-85">{x.description}</p>
                  {x.price && <p className="mt-5 text-lg font-bold">{x.price}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* how it works */}
      {!!s.steps?.length && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl md:text-5xl" style={heading}>How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {s.steps.map((x, i) => (
              <li key={x.title}>
                <span className="grid h-12 w-12 place-items-center rounded-full text-lg font-bold" style={btn}>{i + 1}</span>
                <h3 className="mt-4 text-xl font-bold" style={heading}>{x.title}</h3>
                <p className="mt-2 leading-relaxed opacity-85">{x.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* about + benefits */}
      <section id="about" className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 md:grid-cols-2">
        <div>
          <h2 className="text-3xl md:text-4xl" style={heading}>{s.about?.title ?? `About ${data.name}`}</h2>
          <p className="mt-5 whitespace-pre-line text-lg leading-relaxed opacity-85">{s.about?.body}</p>
        </div>
        {!!s.benefits?.length && (
          <ul className="space-y-4 self-center">
            {s.benefits.map((b) => (
              <li key={b} className="flex gap-3 text-lg">
                <span className="mt-2 h-3 w-3 shrink-0 rounded-full" style={{ background: readable(t.background, t.text, t.primary, t.accent, t.secondary) }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* faq */}
      {!!s.faq?.length && (
        <section id="faq" className="mx-auto max-w-3xl px-5 pb-20">
          <h2 className="text-3xl md:text-4xl" style={heading}>Questions</h2>
          <div className="mt-8 divide-y" style={{ borderColor: t.text }}>
            {s.faq.map((f) => (
              <details key={f.q} className="group py-4" style={{ borderColor: `${t.text}33` }}>
                <summary className="cursor-pointer list-none text-lg font-bold">{f.q}</summary>
                <p className="mt-3 leading-relaxed opacity-85">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* contact */}
      <section id="contact" className="py-20" style={dark}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2">
          <div>
            <h2 className="text-3xl md:text-5xl" style={heading}>{s.contact?.title ?? "Get in touch"}</h2>
            <p className="mt-5 text-lg leading-relaxed opacity-85">{s.contact?.body}</p>
            {data.location && <p className="mt-6 font-semibold opacity-80">{data.location}</p>}
          </div>
          <div className="rounded-2xl p-6" style={{ background: t.background, color: t.text }}>
            {sent ? (
              <div className="py-10 text-center">
                <p className="text-2xl font-bold" style={heading}>Thanks, {form.name.split(" ")[0] || "friend"}.</p>
                <p className="mt-2 opacity-85">Your message is in. We'll get back to you soon.</p>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormErr(null);
                  submit.mutate(
                    {
                      slug,
                      name: form.name,
                      email: form.email,
                      phone: form.phone || undefined,
                      message: form.message || undefined,
                      company: form.company || undefined,
                    },
                    { onSuccess: () => setSent(true), onError: (er) => setFormErr(errorMessage(er)) },
                  );
                }}
              >
                {(["name", "email", "phone"] as const).map((k) => (
                  <label key={k} className="block">
                    <span className="text-sm font-bold capitalize">{k}{k === "phone" ? " (optional)" : ""}</span>
                    <input
                      aria-label={k}
                      required={k !== "phone"}
                      type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                      className="mt-1 w-full rounded-lg border-2 bg-transparent px-3 py-2.5 outline-none focus:ring-2"
                      style={{ borderColor: `${t.text}55` }}
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="text-sm font-bold">Message</span>
                  <textarea
                    aria-label="Message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-1 w-full rounded-lg border-2 bg-transparent px-3 py-2.5 outline-none focus:ring-2"
                    style={{ borderColor: `${t.text}55` }}
                  />
                </label>
                {/* honeypot */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
                {formErr && <p role="alert" className="text-sm font-bold">{formErr}</p>}
                <button disabled={submit.isPending} className="w-full rounded-full px-6 py-3.5 font-bold disabled:opacity-60" style={btn}>
                  {submit.isPending ? "Sending…" : s.contact?.button ?? "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm opacity-70">
        <span>© {new Date().getFullYear()} {data.name}</span>
        <a href="/" style={{ color: t.text }} className="underline">Built with 1 Click Business</a>
      </footer>
    </div>
  );
}
