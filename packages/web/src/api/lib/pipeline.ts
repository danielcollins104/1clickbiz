import { and, eq } from "drizzle-orm";
import { db } from "../database";
import { notify, appUrl } from "../services/email";
import { generationLog, assets, businesses } from "../database/schema";
import { GENERATORS, PIPELINE, type Content, type GenContext } from "../agent/generators";
import { getAccess, trackGeneration } from "./autumn";

type User = { id: string; name?: string | null; email?: string | null };

/** Businesses currently being generated — prevents double-runs from double clicks. */
const running = new Set<number>();
export const isRunning = (businessId: number) => running.has(businessId);
/** Individual tool runs in flight (pipeline or single regenerate), keyed `${businessId}:${tool}`. */
const active = new Set<string>();
/** True if a "running" asset is genuinely being worked on (not left over from a server restart). */
export const isLive = (businessId: number, tool: string) => running.has(businessId) || active.has(`${businessId}:${tool}`);

export async function loadContext(businessId: number): Promise<GenContext | null> {
  const biz = await db.query.businesses.findFirst({ where: eq(businesses.id, businessId) });
  if (!biz) return null;
  const rows = await db.select().from(assets).where(eq(assets.businessId, businessId));
  const map: Record<string, Content | null> = {};
  for (const r of rows) if (r.status === "done" && r.content) map[r.tool] = r.content;
  return { businessId, slug: biz.slug, intake: biz.intake, name: biz.name, assets: map };
}

async function setAsset(businessId: number, tool: string, patch: Partial<typeof assets.$inferInsert>) {
  const existing = await db.query.assets.findFirst({
    where: and(eq(assets.businessId, businessId), eq(assets.tool, tool)),
  });
  if (existing) {
    await db
      .update(assets)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(assets.id, existing.id));
  } else {
    await db.insert(assets).values({ businessId, tool, ...patch });
  }
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "business";

/** Applies the side effects of a tool's output to the business row (name + public slug). */
export async function applyChoice(businessId: number, tool: string, content: Content) {
  if (tool !== "name-generator") return;
  const names = (content as { names?: { name: string }[]; chosen?: number }).names ?? [];
  const chosen = names[(content as { chosen?: number }).chosen ?? 0];
  if (!chosen) return;
  let slug = slugify(chosen.name);
  const clash = await db.query.businesses.findFirst({ where: eq(businesses.slug, slug) });
  if (clash && clash.id !== businessId) slug = `${slug}-${businessId}`;
  await db
    .update(businesses)
    .set({ name: chosen.name, slug, updatedAt: new Date() })
    .where(eq(businesses.id, businessId));
}

/** Runs one tool for a business and stores the result. Throws on failure. */
export async function runTool(user: User, businessId: number, tool: string, instruction?: string) {
  const gen = GENERATORS[tool];
  if (!gen) throw new Error(`Unknown tool ${tool}`);
  const ctx = await loadContext(businessId);
  if (!ctx) throw new Error("Business not found");
  const prev = await db.query.assets.findFirst({
    where: and(eq(assets.businessId, businessId), eq(assets.tool, tool)),
  });
  const key = `${businessId}:${tool}`;
  if (active.has(key)) throw new Error("This tool is already generating — give it a moment.");
  active.add(key);
  await setAsset(businessId, tool, { status: "running", error: null });
  try {
    const content = await gen(ctx, instruction, prev?.content ?? null);
    await setAsset(businessId, tool, {
      status: "done",
      content,
      error: null,
      version: (prev?.version ?? 0) + 1,
    });
    await applyChoice(businessId, tool, content);
    await trackGeneration(user.id);
    return content;
  } catch (e) {
    console.error(`[pipeline] ${tool} failed`, e);
    const msg = friendlyError(e);
    await db.insert(generationLog).values({ userId: user.id, businessId, tool, error: msg }).catch((err) => console.error("[generation log]", err));
    // Keep the previous good version visible if there was one.
    await setAsset(businessId, tool, {
      status: prev?.content ? "done" : "error",
      error: msg,
    });
    throw new Error(msg);
  } finally {
    active.delete(key);
  }
}

/**
 * Runs the whole pipeline in the background, wave by wave. Each wave reads the
 * outputs of the previous ones. Tools the user hasn't unlocked are skipped.
 * `from` restarts the pipeline at the wave containing that tool.
 */
export function startPipeline(user: User, businessId: number, opts: { from?: string } = {}) {
  if (running.has(businessId)) return false;
  running.add(businessId);
  void (async () => {
    try {
      const access = await getAccess(user);
      const owned = new Set(access.tools);
      const startWave = opts.from ? Math.max(0, PIPELINE.findIndex((w) => w.includes(opts.from!))) : 0;
      const waves = PIPELINE.slice(startWave).map((w) => w.filter((t) => owned.has(t)));
      // Mark everything queued so the UI can show the full plan immediately.
      for (const wave of waves) for (const t of wave) await setAsset(businessId, t, { status: "running", error: null });
      for (const wave of waves) {
        await Promise.allSettled(wave.map((t) => runTool(user, businessId, t)));
      }
      const rows = await db.select().from(assets).where(eq(assets.businessId, businessId));
      const planned = waves.flat();
      if (user.email && planned.length > 0 && planned.every((t) => rows.some((a) => a.tool === t && a.status === "done" && !a.error))) {
        await notify({ to: user.email, title: "Your business is ready", message: "Your first build is complete. Review your results before publishing or using them.", url: appUrl(`/dashboard?b=${businessId}`), key: `ready-${businessId}` });
      }
    } catch (e) {
      console.error("[pipeline] crashed", e);
    } finally {
      running.delete(businessId);
    }
  })();
  return true;
}

/** Provider errors (credits, rate limits, schema misses) mean nothing to a founder; say what happened and what to do. */
function friendlyError(e: unknown) {
  const raw = e instanceof Error ? e.message : String(e);
  const status = (e as { statusCode?: number })?.statusCode;
  if (status === 402 || /insufficient.credits/i.test(raw)) return "Our AI service is temporarily unavailable. Nothing was charged. Try again shortly.";
  if (status === 429 || /rate.limit/i.test(raw)) return "Too many requests right now. Nothing was charged. Try again in a minute.";
  if (/No object generated|did not match schema/i.test(raw)) return "The AI returned an incomplete answer. Nothing was charged. Regenerate to try again.";
  return `Generation failed: ${raw.slice(0, 200)}. Nothing was charged.`;
}
