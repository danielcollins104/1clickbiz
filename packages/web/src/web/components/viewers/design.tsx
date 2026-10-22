import { useEffect, useState } from "react";
import { ExternalLink, Monitor, Tablet, Smartphone } from "lucide-react";
import type { Img } from "../../lib/tools";
import { ChooseButton, CopyButton, DownloadButton, GenImage, List, Section, type ViewerProps } from "./common";

/** Injects a Google Fonts stylesheet for the given families (once per set). */
export function useGoogleFonts(families: (string | undefined)[]) {
  const key = families.filter(Boolean).join("|");
  useEffect(() => {
    if (!key) return;
    const id = `gf-${key.replace(/[^a-z0-9]/gi, "")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${key
      .split("|")
      .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;600;700;800`)
      .join("&")}&display=swap`;
    document.head.appendChild(link);
  }, [key]);
}

/* ---------------- 06 Color / Font System ---------------- */

type Color = { name: string; hex: string; role: string; usage: string; onColor: string };

export function ColorFontViewer({ content: c, bizName }: ViewerProps) {
  const colors = (c.colors ?? []) as Color[];
  const heading = c.headingFont as string;
  const body = c.bodyFont as string;
  useGoogleFonts([heading, body]);
  const get = (role: string) => colors.find((x) => x.role === role)?.hex;

  const css = [
    ":root {",
    ...colors.map((x) => `  --color-${x.role.toLowerCase()}: ${x.hex}; /* ${x.name} */`),
    `  --font-heading: "${heading}", sans-serif;`,
    `  --font-body: "${body}", sans-serif;`,
    "}",
  ].join("\n");
  const importLine = `@import url("https://fonts.googleapis.com/css2?family=${heading.replace(/ /g, "+")}:wght@400;700&family=${body.replace(/ /g, "+")}:wght@400;600&display=swap");`;

  return (
    <div className="space-y-6">
      <div className="grid gap-0 sm:grid-cols-5">
        {colors.map((x, i) => (
          <div
            key={x.hex + i}
            className="b3 flex min-h-56 flex-col justify-between p-4 sm:[&:not(:first-child)]:border-l-0"
            style={{ background: x.hex, color: x.onColor }}
          >
            <span className="text-xs font-extrabold uppercase tracking-widest">{x.role}</span>
            <div>
              <p className="text-lg font-extrabold">{x.name}</p>
              <button
                type="button"
                className="font-mono text-sm font-bold underline decoration-2 underline-offset-4"
                onClick={() => navigator.clipboard?.writeText(x.hex)}
                title="Copy hex"
              >
                {x.hex}
              </button>
              <p className="mt-2 text-xs font-semibold opacity-90">{x.usage}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Type pairing">
          <p className="text-xs font-extrabold uppercase">Heading · {heading}</p>
          <p className="mt-1 text-4xl leading-tight" style={{ fontFamily: `"${heading}", sans-serif` }}>{bizName}</p>
          <p className="mt-5 text-xs font-extrabold uppercase">Body · {body}</p>
          <p className="mt-1 text-base" style={{ fontFamily: `"${body}", sans-serif` }}>
            The quick brown fox jumps over the lazy dog. 0123456789. Body copy should be easy to read at small sizes on any screen.
          </p>
        </Section>
        <Section title="Preview">
          <div className="b3 p-5" style={{ background: get("Background"), color: get("Text") }}>
            <p className="text-2xl" style={{ fontFamily: `"${heading}", sans-serif`, color: get("Primary") === get("Background") ? get("Text") : undefined }}>
              Launch day is here.
            </p>
            <p className="mt-2 text-sm" style={{ fontFamily: `"${body}", sans-serif` }}>
              A sample card using your palette and fonts together.
            </p>
            <span
              className="mt-4 inline-block border-[3px] px-4 py-2 text-sm font-bold"
              style={{ background: get("Primary"), color: colors.find((x) => x.role === "Primary")?.onColor, borderColor: get("Text"), fontFamily: `"${body}", sans-serif` }}
            >
              Book now
            </span>
            <span className="ml-3 text-sm font-bold underline decoration-[3px] underline-offset-4" style={{ color: get("Text"), textDecorationColor: get("Accent") }}>Learn more</span>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Why this works"><p className="font-semibold">{c.rationale}</p></Section>
        <Section title="Usage rules"><List items={c.rules} /></Section>
      </div>

      <Section title="Developer handoff" kicker="CSS">
        <pre className="b3 overflow-x-auto bg-ink p-4 text-xs text-sun"><code>{importLine + "\n\n" + css}</code></pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <CopyButton text={importLine + "\n\n" + css} label="Copy CSS variables" />
          <a
            className="btn btn-sm btn-quiet"
            href={`https://fonts.google.com/share?selection.family=${encodeURIComponent(heading)}|${encodeURIComponent(body)}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={3} /> Open in Google Fonts
          </a>
        </div>
      </Section>
    </div>
  );
}

/* ---------------- 05 Logo Generation ---------------- */

export function LogoViewer({ content, choose, choosing, bizName }: ViewerProps) {
  const concepts = (content.concepts ?? []) as { style: string; image: Img }[];
  const chosen = typeof content.chosen === "number" ? content.chosen : 0;
  const file = bizName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className="space-y-6">
      <p className="font-bold">
        Three AI-drawn concepts as PNG images. The one you select appears on your website. AI can misspell text, so check the lettering.
        For print or signage, have a designer redraw your favourite as a vector file.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {concepts.map((x, i) => (
          <article key={i} className={`card flex flex-col ${i === chosen ? "bg-cream" : "bg-paper"}`}>
            <GenImage img={x.image} alt={`Logo concept ${i + 1}: ${x.style}`} className="m-4 aspect-square object-contain" />
            <div className="flex flex-1 flex-col gap-3 border-t-[3px] border-ink p-4">
              <p className="text-sm font-semibold first-letter:uppercase">{x.style}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <ChooseButton selected={i === chosen} disabled={choosing} onClick={choose ? () => choose(i) : undefined} />
                <DownloadButton img={x.image} filename={`${file}-logo-${i + 1}.png`} />
              </div>
            </div>
          </article>
        ))}
      </div>
      {concepts[chosen]?.image?.url && (
        <Section title="On light backgrounds">
          <div className="grid gap-4 sm:grid-cols-3">
            {["#ffffff", "#f2f2ef", "#d4e1ff"].map((bg) => (
              <div key={bg} className="b3 grid aspect-video place-items-center p-6" style={{ background: bg }}>
                <img src={concepts[chosen]!.image!.url} alt="" className="max-h-full max-w-[70%] object-contain mix-blend-multiply" loading="lazy" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-bold uppercase text-muted">The PNG has a white background, so it suits light colours best.</p>
        </Section>
      )}
    </div>
  );
}

/* ---------------- 07 Website Generator ---------------- */

export function WebsiteViewer({ content: c, bizSlug }: ViewerProps) {
  const url = `${window.location.origin}/sites/${bizSlug}`;
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const deviceWidth =
    device === "desktop" ? "w-full" : device === "tablet" ? "w-[768px] mx-auto" : "w-[390px] mx-auto";

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 bg-ink p-5 text-sun md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Your site is live at</p>
          <p className="mt-1 truncate font-mono text-lg font-bold">{url}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton text={url} label="Copy link" className="!bg-paper" />
          <a href={`/sites/${bizSlug}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-yellow">
            <ExternalLink className="h-4 w-4" strokeWidth={3} /> Open site in new tab
          </a>
        </div>
      </div>

      <div className="card overflow-hidden bg-cream border-[3px] border-ink p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink bg-paper px-4 py-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-sun" />
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-mint" />
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-ink" />
            <span className="ml-2 font-mono text-xs font-bold text-ink truncate">/sites/{bizSlug}</span>
          </div>

          {/* Viewport switch controls */}
          <div className="flex items-center gap-1 bg-cream p-1 border-2 border-ink">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`px-3 py-1 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                device === "desktop" ? "bg-ink text-sun shadow-[1px_1px_0px_#000]" : "text-ink hover:bg-paper"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={`px-3 py-1 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                device === "tablet" ? "bg-ink text-sun shadow-[1px_1px_0px_#000]" : "text-ink hover:bg-paper"
              }`}
            >
              <Tablet className="h-3.5 w-3.5" /> Tablet
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`px-3 py-1 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                device === "mobile" ? "bg-ink text-sun shadow-[1px_1px_0px_#000]" : "text-ink hover:bg-paper"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>
        </div>

        <div className="bg-paper p-2 overflow-x-auto">
          <div className={`${deviceWidth} transition-all duration-300 border-2 border-ink shadow-[4px_4px_0px_#000]`}>
            <iframe
              title="Website preview"
              src={`/sites/${bizSlug}`}
              className="h-[680px] w-full bg-white"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="SEO" kicker="Search result">
          <p className="text-lg font-extrabold text-[#1a0dab]">{c.seo?.title}</p>
          <p className="text-sm font-semibold">{c.seo?.description}</p>
        </Section>
        <Section title="Hero image">
          <GenImage img={c.heroImage as Img} alt="Website hero" className="aspect-video w-full" />
        </Section>
      </div>
      <p className="text-sm font-bold">
        Enquiries from the contact form go to your Customer CRM. To change copy, describe the change in the box above and regenerate.
      </p>
    </div>
  );
}
