import { createAgentUIStreamResponse, stepCountIs, tool, ToolLoopAgent } from "ai";
import dedent from "dedent";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../database";
import { businesses } from "../database/schema";
import { auth } from "../auth";
import { getAccess, requireTool, trackGeneration } from "../lib/autumn";
import { loadContext, runTool } from "../lib/pipeline";
import { CHAT_MODEL, gateway } from "./gateway";
import { GENERATORS } from "./generators";

const strip = (v: unknown): unknown => {
  if (Array.isArray(v)) return v.map(strip);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) if (!["image", "images", "url", "key"].includes(k)) o[k] = strip(val);
    return o;
  }
  return v;
};

/** POST /api/agent/messages — streaming Advisor chat scoped to one business. */
export async function advisorHandler(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });
  const body = (await req.json()) as { messages: unknown[]; businessId?: number };
  const access = await getAccess(session.user);
  if (!access.tools.includes("ai-advisor")) return new Response("AI Advisor isn't in your plan.", { status: 403 });
  try {
    await requireTool(session.user, "ai-advisor");
  } catch (e) {
    return new Response(e instanceof Error ? e.message : "No generations left.", { status: 403 });
  }
  void trackGeneration(session.user.id);

  const biz = body.businessId
    ? await db.query.businesses.findFirst({
        where: and(eq(businesses.id, Number(body.businessId)), eq(businesses.userId, session.user.id)),
      })
    : null;
  const ctx = biz ? await loadContext(biz.id) : null;
  const user = session.user;

  const agent = new ToolLoopAgent({
    model: gateway(CHAT_MODEL),
    instructions: dedent`
      You are the AI Business Advisor inside "1 Click Business". You coach a first-time founder.
      Be direct, specific and practical. Prefer short paragraphs and bullet lists. No hype.
      Never claim you did something you didn't. If a tool call fails, say so.
      ${
        ctx
          ? dedent`
            The founder's business is "${ctx.name}". Their intake answers: ${JSON.stringify(ctx.intake)}.
            Everything generated so far (JSON, may be truncated): ${JSON.stringify(strip(ctx.assets)).slice(0, 24000)}
            You can rewrite any generated asset with the regenerateAsset tool when the founder asks for a change
            (e.g. "make the website warmer", "new logo ideas"). Only call it when they ask for a change.
            The founder owns these tools: ${access.tools.join(", ")}.
          `
          : "The founder hasn't created a business yet. Encourage them to run the intake at /start."
      }
    `,
    tools: ctx
      ? {
          regenerateAsset: tool({
            description: "Regenerate one of the founder's assets with an instruction. Slow (10-60s).",
            inputSchema: z.object({
              tool: z.enum(Object.keys(GENERATORS) as [string, ...string[]]),
              instruction: z.string().describe("What to change, in the founder's words"),
            }),
            async execute({ tool: slug, instruction }) {
              try {
                await requireTool(user, slug);
                await runTool(user, ctx.businessId, slug, instruction);
                return { ok: true, message: `Updated ${slug}. The founder can see it on their dashboard.` };
              } catch (e) {
                return { ok: false, message: e instanceof Error ? e.message : "Failed" };
              }
            },
          }),
        }
      : {},
    stopWhen: [stepCountIs(6)],
  });

  return createAgentUIStreamResponse({ agent, uiMessages: body.messages });
}
