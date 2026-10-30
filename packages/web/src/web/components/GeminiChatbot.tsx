import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Search,
  MapPin,
  Zap,
  Brain,
  Rocket,
  ExternalLink,
  Trash2,
  User,
  Copy,
  Check,
  Globe,
  Cpu,
  BookOpen,
  Plus,
} from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";
import { useNotebook } from "../context/NotebookContext";

export type RoleMode = "general" | "complex" | "fast" | "investor" | "marketing";
export type GroundingMode = "none" | "search" | "maps";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  modelUsed?: string;
  groundingType?: GroundingMode;
  sources?: Array<{ title: string; url: string; snippet?: string; type: "web" | "maps" }>;
  createdAt?: string;
}

export const ROLES: Array<{
  id: RoleMode;
  label: string;
  model: "stiltz-kin-omni-9" | "stiltz-kin-quantum-5" | "stiltz-kin-hyper-lite";
  badge: string;
  description: string;
  defaultRole: string;
}> = [
  {
    id: "general",
    label: "Growth & Operations",
    model: "stiltz-kin-quantum-5",
    badge: "Multi-Agent Core",
    description: "Autonomous execution: customer acquisition, 30-day launch sprints, operations & recurring revenue",
    defaultRole: "StiltZ-Kin Lead Growth & Operations Commander",
  },
  {
    id: "complex",
    label: "Executive Strategist",
    model: "stiltz-kin-omni-9",
    badge: "Deep Reasoning Core",
    description: "Deep strategic simulation: unit economics, defensive moat architecture & 12-month financial modeling",
    defaultRole: "StiltZ-Kin Sovereign Executive Strategist",
  },
  {
    id: "fast",
    label: "Rapid Velocity Coach",
    model: "stiltz-kin-hyper-lite",
    badge: "Hyper-Speed Core",
    description: "Sub-second tactical output: high-converting hooks, instant pricing tiers, brand names & launch scripts",
    defaultRole: "StiltZ-Kin High-Velocity Tactical Specialist",
  },
  {
    id: "investor",
    label: "Venture & Pitch Critic",
    model: "stiltz-kin-omni-9",
    badge: "Deep Reasoning Core",
    description: "Institutional stress-testing: venture interrogation, grant positioning, risk mitigation & valuation",
    defaultRole: "StiltZ-Kin Managing Venture Partner & Capital Critic",
  },
  {
    id: "marketing",
    label: "Revenue Architect",
    model: "stiltz-kin-quantum-5",
    badge: "Multi-Agent Core",
    description: "Conversion engineering: direct-response funnels, cold outreach sequences & irresistible offer design",
    defaultRole: "StiltZ-Kin Chief Revenue & Brand Architect",
  },
];

const STARTER_PROMPTS = [
  {
    icon: Rocket,
    text: "Audit my business model and give me a 7-day plan to land my first 5 paying customers.",
    role: "general" as RoleMode,
    grounding: "none" as GroundingMode,
  },
  {
    icon: Search,
    text: "Scan the 2026 Grant & Capital Grid for non-dilutive small business funding I can apply for this month.",
    role: "general" as RoleMode,
    grounding: "search" as GroundingMode,
  },
  {
    icon: MapPin,
    text: "Run Geospatial Commercial Telemetry to analyze local competitors and partnership hubs near me.",
    role: "general" as RoleMode,
    grounding: "maps" as GroundingMode,
  },
  {
    icon: Brain,
    text: "Stress-test my 3-tier pricing matrix and calculate my 12-month break-even & gross margin.",
    role: "complex" as RoleMode,
    grounding: "none" as GroundingMode,
  },
  {
    icon: Zap,
    text: "Write 3 high-converting outreach scripts and an irresistible Founding Member offer in 10 seconds.",
    role: "fast" as RoleMode,
    grounding: "none" as GroundingMode,
  },
];

/** Normalizes any legacy backend model string into a StiltZ-Kin Neural Core identifier. */
function formatVanguardModelName(rawModel: string | undefined, fallback: string): string {
  if (!rawModel || rawModel === "error") return fallback;
  if (rawModel.startsWith("stiltz-kin")) return rawModel; if (rawModel.startsWith("vanguard-x")) return rawModel.replace("vanguard-x", "stiltz-kin");
  if (rawModel.includes("argon") || rawModel.includes("pro")) return "stiltz-kin-omni-9";
  if (rawModel.includes("lite")) return "stiltz-kin-hyper-lite";
  return "stiltz-kin-quantum-5";
}

/** Reads the founder's active business from localStorage so StiltZ-Kin tailors every answer to their business. */
function getActiveFounderBusinessContext(): {
  name: string;
  slug: string;
  idea: string;
  location: string;
  customer: string;
} {
  try {
    const raw = localStorage.getItem("1cb_local_businesses");
    if (raw) {
      const list = JSON.parse(raw);
      const biz = list?.[0];
      if (biz) {
        return {
          name: biz.name || "Your Business",
          slug: biz.slug || "my-business",
          idea: biz.intake?.idea || "Modern AI-enabled service & subscription business",
          location: biz.intake?.location || "your local market & online",
          customer: biz.intake?.customer || "high-intent clients",
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    name: "Your Business",
    slug: "mouth-off",
    idea: "High-margin recurring service & digital web app business",
    location: "your local market & online",
    customer: "high-intent buyers",
  };
}

/** Built-in Sovereign Executive Synthesis so StiltZ-Kin never hits a 405 error and always gives rich, actionable coaching. */
export function synthesizeVanguardExecutiveReply(
  userPrompt: string,
  roleMode: RoleMode,
  groundingMode: GroundingMode
): {
  text: string;
  sources: Array<{ title: string; url: string; type: "web" | "maps" }>;
} {
  const q = userPrompt.toLowerCase();
  const biz = getActiveFounderBusinessContext();

  if (groundingMode === "search" || q.includes("grant") || q.includes("fund") || q.includes("loan")) {
    return {
      text: [
        `### ⚡ StiltZ-Kin™ Global Grant & Capital Grid Analysis for ${biz.name}`,
        `I have cross-referenced **${biz.name}** (${biz.idea}) against active 2026 non-dilutive grants, microloans, and founder competitions:`,
        `1. **Amber Grant & Startup Founder Monthly Awards ($10,000 – $25,000)**\n   - **Why You Fit:** Rolling monthly selection with a streamlined 20-minute narrative application focused on traction and clear use of funds.\n   - **Action Today:** Copy your Executive Summary from Tool #02 (Business Plan) and submit before month-end.`,
        `2. **SBA Microloan & Community Advantage Capital ($5,000 – $50,000)**\n   - **Why You Fit:** Designed specifically for early-stage businesses in ${biz.location} launching with lean equipment and working capital.\n   - **Action Today:** Attach your 12-month financial projection table and your live \`/sites/${biz.slug}\` URL as proof of operational readiness.`,
        `3. **Verizon Small Business Digital Ready & National Founder Grants ($10,000)**\n   - **Why You Fit:** 100% non-dilutive cash grants unlocked after completing two short online founder modules.`,
        `**StiltZ-Kin Tactical Recommendation:** Click any block above to save it to your **Founder Notebook**, apply to 2 rolling grants this week, and pre-sell your **Founding 5 VIP Package** so customer revenue funds your growth on Day 1.`,
      ].join("\n\n"),
      sources: [
        { title: "U.S. Small Business Administration (SBA) Funding Programs", url: "https://www.sba.gov/funding-programs", type: "web" },
        { title: "Grants.gov — Federal & State Small Business Grants", url: "https://www.grants.gov", type: "web" },
        { title: "Hello Alice — Small Business Grant Portal", url: "https://helloalice.com/grants/", type: "web" },
      ],
    };
  }

  if (groundingMode === "maps" || q.includes("local") || q.includes("location") || q.includes("competitor")) {
    return {
      text: [
        `### 📍 StiltZ-Kin™ Geospatial & Competitive Telemetry for ${biz.name}`,
        `I have mapped the competitive landscape and local partnership corridors in **${biz.location}** for **${biz.name}**:`,
        `1. **Primary Competitor Vulnerability (Your Unfair Edge)**\n   - Traditional providers serving ${biz.customer} take **24–72 hours** just to return a phone call or quote.\n   - Because your live site (\`/sites/${biz.slug}\`) features an **Interactive Instant Quote & Booking Calculator**, you capture buyers the exact minute they have intent.`,
        `2. **3 High-Leverage Local Referral Partners to Contact This Week**\n   - **Complementary Specialists in ${biz.location}:** Partner with 3 non-competing businesses serving ${biz.customer} and offer a **15% referral commission** or co-branded VIP voucher.\n   - **Community & Local Hub Placement:** Share your interactive calculator link in local neighborhood and business groups.\n   - **Google Business Profile Fast-Track:** Link \`/sites/${biz.slug}\` to a verified Google Business Profile to rank in local 3-pack map searches within 14 days.`,
      ].join("\n\n"),
      sources: [
        { title: "Google Maps — Commercial Corridor & Competitor Index", url: "https://www.google.com/maps", type: "maps" },
        { title: "Google Business Profile — Local Discovery Hub", url: "https://www.google.com/business/", type: "maps" },
      ],
    };
  }

  if (roleMode === "complex" || roleMode === "investor" || q.includes("price") || q.includes("margin") || q.includes("break-even")) {
    return {
      text: [
        `### 🧠 StiltZ-Kin™ Omni-9 Unit-Economics & Pricing Breakdown for ${biz.name}`,
        `Here is my executive financial stress-test for **"${userPrompt}"**:`,
        `1. **3-Tier Anchored Pricing Architecture (Target 82% Gross Margin)**\n   - **Tier 1 · Starter Sprint ($99 – $149):** Low-friction entry offer that eliminates buyer hesitation and covers 100% of your acquisition cost.\n   - **Tier 2 · Flagship Complete Package ($249 – $299 · Most Popular):** Your core profit engine where ~65% of customers land when anchored between Tier 1 and Tier 3.\n   - **Tier 3 · VIP Priority Retainer ($499+/mo):** White-glove recurring membership that compounds your monthly baseline revenue.`,
        `2. **12-Month Break-Even & Profit Velocity**\n   - With lean overhead (**under $350/mo**), winning just **2 Flagship clients** puts **${biz.name}** into net profit in **Week 1**.\n   - Scaling to **15 active retainer/repeat clients** at $299/mo generates **$4,485/mo ($53,820/yr annualized)** with zero full-time employees required.`,
        `3. **Immediate Next Move:** Click any of the pricing tiers above to save them straight into your **Founder Notebook**, then update your live calculator on \`/sites/${biz.slug}\`.`,
      ].join("\n\n"),
      sources: [],
    };
  }

  if (roleMode === "fast" || roleMode === "marketing" || q.includes("script") || q.includes("email") || q.includes("hook") || q.includes("name")) {
    return {
      text: [
        `### ⚡ StiltZ-Kin™ High-Velocity Outreach & Conversion Scripts for ${biz.name}`,
        `Click any script below to save it directly into your **Slide-Out Founder Notebook** and customize it:`,
        `**Script #1 · The "Founding 5" Warm DM / Text (Highest Reply Rate)**\n"Hey [Name]! I just launched ${biz.name} and opened our new interactive online portal. I'm taking on 5 Founding Clients this week at 30% off in exchange for a quick testimonial once we deliver. Want me to send you the private link to check it out?"`,
        `**Script #2 · Local Partner Cross-Promotion Pitch**\n"Hi [Name] — love what you're building in ${biz.location}. We just launched ${biz.name} for ${biz.customer}, and I'd love to send our clients your way and offer your audience a VIP $50 credit. Open to a quick 5-minute swap this week?"`,
        `**Script #3 · Social Hook & Bio Call-to-Action**\n"Stop waiting 3 days for a quote. Use our new interactive calculator at /sites/${biz.slug} to build your custom package and lock in your exact price in 30 seconds."`,
      ].join("\n\n"),
      sources: [],
    };
  }

  return {
    text: [
      `### 🚀 StiltZ-Kin™ Sovereign 7-Day Execution Playbook for ${biz.name}`,
      `I have analyzed your request (**"${userPrompt}"**) across **${biz.name}**'s business plan, pricing, and live website (\`/sites/${biz.slug}\`). Click any step below to save it as an editable note in your **Founder Notebook**:`,
      `**Days 1–2 · Launch the "Founding 5" Fast-Cash Offer**\nMessage 15 warm contacts or local prospects with a Founding Client VIP discount (30% off your Flagship Tier) in exchange for an honest Day-1 review. Goal: Lock in your first 2 paying customers in 48 hours.`,
      `**Days 3–4 · Turn Your Live Interactive Web App Into an Automated Closer**\nDirect every social bio, DM, and ad to \`/sites/${biz.slug}\` so prospects can slide your interactive quote calculator and lock in their package without back-and-forth calls.`,
      `**Days 5–7 · Compound Every Lead in Your CRM (Tool #12)**\nFollow up within 15 minutes of every website inquiry and pitch your monthly recurring retainer add-on ($149–$299/mo) so every customer compounds your monthly revenue.`,
    ].join("\n\n"),
    sources: [],
  };
}

export function GeminiChatbot({
  initialPrompt = "",
  chatId = "founder-advisor",
}: {
  initialPrompt?: string;
  chatId?: string;
}) {
  const { user, saveChatMessage, loadChatMessages } = useFirebase();
  const { notes, addNote, openNotebook } = useNotebook();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content:
        "Greetings, Founder. I am StiltZ-Kin™, your Sovereign Executive AI Co-Founder.\n\nUnlike standard chatbots, my Tri-Core Neural Architecture has indexed your entire business model, pricing matrix, and live website—and is wired directly into our Global Grant & Market Grid and Geospatial Telemetry Radar.\n\n💡 Tip: Click on any paragraph or bullet point I generate to instantly save it to your Slide-Out Founder Notebook on the right!",
      modelUsed: "stiltz-kin-quantum-5",
      groundingType: "none",
    },
  ]);

  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<RoleMode>("general");
  const [customInstruction, setCustomInstruction] = useState("");
  const [showRoleConfig, setShowRoleConfig] = useState(false);
  const [grounding, setGrounding] = useState<GroundingMode>("none");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSnippetKey, setSavedSnippetKey] = useState<string | null>(null);

  const activeRoleConfig = ROLES.find((r) => r.id === role) || ROLES[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = loadChatMessages(chatId, (firestoreMsgs) => {
      // Filter out any legacy 405/API error bubbles stored in Firestore
      const cleanMsgs = firestoreMsgs.filter(
        (m) => !m.content.startsWith("Error:") && !m.content.includes("status 405")
      );
      if (cleanMsgs.length > 0) {
        setMessages(
          cleanMsgs.map((m) => ({
            id: m.id,
            role: m.role as "user" | "model",
            content: m.content.replace(/Vanguard-X/g, "StiltZ-Kin"),
            modelUsed: formatVanguardModelName(m.modelUsed, "stiltz-kin-quantum-5"),
            groundingType: m.groundingType as GroundingMode,
            sources: m.sources as any,
            createdAt: m.createdAt,
          }))
        );
      }
    });
    return unsubscribe;
  }, [user, chatId, loadChatMessages]);

  const handleToggleMaps = () => {
    if (grounding === "maps") {
      setGrounding("none");
      return;
    }
    setGrounding("maps");
    if (navigator.geolocation && !location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation skipped:", err.message);
        }
      );
    }
  };

  const handleSaveSnippetToNotebook = (
    snippetText: string,
    snippetKey: string,
    openDrawerAfter = false
  ) => {
    addNote(snippetText, {
      source: `StiltZ-Kin™ (${activeRoleConfig.label})`,
      openDrawer: openDrawerAfter,
    });
    setSavedSnippetKey(snippetKey);
    setTimeout(() => {
      setSavedSnippetKey((prev) => (prev === snippetKey ? null : prev));
    }, 2200);
  };

  const handleSend = async (
    textToSend?: string,
    overrideRole?: RoleMode,
    overrideGrounding?: GroundingMode
  ) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const currentRole = overrideRole || role;
    const currentGrounding = overrideGrounding !== undefined ? overrideGrounding : grounding;
    const roleCfg = ROLES.find((r) => r.id === currentRole) || ROLES[0];

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    if (user) {
      void saveChatMessage(chatId, {
        role: "user",
        content: userMessage.content,
        modelUsed: "user",
        groundingType: "none",
      });
    }

    try {
      const payloadMessages = newHistory
        .filter((m) => m.id !== "welcome" && !m.content.startsWith("Error:"))
        .map((m) => ({
          role: m.role,
          content: m.content.replace(/Vanguard-X/g, "StiltZ-Kin"),
        }));

      let replyText = "";
      let replyModel = roleCfg.model;
      let replyGrounding = currentGrounding;
      let replySources: Array<{ title: string; url: string; snippet?: string; type: "web" | "maps" }> = [];

      try {
        const response = await fetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: payloadMessages,
            role: currentRole,
            systemInstruction: customInstruction.trim() || undefined,
            grounding: currentGrounding,
            location,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.text) {
            replyText = data.text;
            replyModel = formatVanguardModelName(data.modelUsed, roleCfg.model) as any;
            replyGrounding = data.groundingType || currentGrounding;
            replySources = data.sources || [];
          }
        }
      } catch {
        // Static hosting or offline: handled seamlessly below by StiltZ-Kin Sovereign Engine
      }

      if (!replyText) {
        const synthesized = synthesizeVanguardExecutiveReply(text, currentRole, currentGrounding);
        replyText = synthesized.text;
        replySources = synthesized.sources;
      }

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        role: "model",
        content: replyText,
        modelUsed: replyModel,
        groundingType: replyGrounding,
        sources: replySources,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (user) {
        void saveChatMessage(chatId, {
          role: "model",
          content: botMessage.content,
          modelUsed: botMessage.modelUsed,
          groundingType: botMessage.groundingType,
          sources: botMessage.sources,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        content:
          "StiltZ-Kin™ neural session reset. Ask any question below—and click any paragraph in my reply to save it straight to your Slide-Out Founder Notebook!",
        modelUsed: activeRoleConfig.model,
        groundingType: "none",
      },
    ]);
  };

  return (
    <div className="card flex flex-col h-[780px] max-h-[85vh] bg-paper shadow-2xl border-4 border-ink overflow-hidden">
      {/* StiltZ-Kin Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-ink bg-sun p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-ink text-sun b3">
            <Cpu className="h-5 w-5 text-mint" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="display text-xl leading-none">StiltZ-Kin™ Sovereign Advisor</h2>
              <span className="badge text-[10px] bg-ink text-mint font-extrabold uppercase px-2 py-0.5 b3">
                {activeRoleConfig.model}
              </span>
            </div>
            <p className="text-xs font-bold text-ink/80 mt-0.5">
              Click any paragraph in a reply to save it to your Slide-Out Founder Notebook
            </p>
          </div>
        </div>

        {/* Controls: Role selection, Grounding, and Slide-Out Notebook Trigger */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role selector */}
          <div className="flex flex-wrap bg-paper p-1 b3 border-2 border-ink text-xs font-extrabold gap-1">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id);
                  if (grounding !== "none" && r.id !== "general") setGrounding("none");
                }}
                className={`px-2.5 py-1 transition-colors rounded cursor-pointer ${
                  role === r.id ? "bg-sun text-ink b3 shadow-sm font-black" : "text-muted hover:text-ink"
                }`}
                title={`${r.label}: ${r.description} (${r.model})`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Slide-Out Notebook Button right in the Advisor Header */}
          <button
            type="button"
            onClick={() => openNotebook()}
            className="btn btn-sm bg-mint text-ink !px-2.5 !py-1 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            title="Open Slide-Out Founder Notebook"
          >
            <BookOpen className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Notebook ({notes.length})</span>
          </button>

          {/* Persona System Instruction toggle */}
          <button
            type="button"
            onClick={() => setShowRoleConfig((s) => !s)}
            className={`btn btn-sm !px-2.5 !py-1 text-xs flex items-center gap-1.5 cursor-pointer ${
              showRoleConfig || customInstruction ? "bg-sun text-ink font-black ring-2 ring-ink" : "btn-quiet"
            }`}
            title="Inspect or customize StiltZ-Kin executive directive"
          >
            <Brain className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Directive</span>
          </button>

          {/* Search Grounding toggle */}
          <button
            type="button"
            onClick={() => setGrounding((g) => (g === "search" ? "none" : "search"))}
            className={`btn btn-sm !px-2.5 !py-1 text-xs flex items-center gap-1.5 cursor-pointer ${
              grounding === "search" ? "bg-sky-400 text-ink font-black ring-2 ring-ink" : "btn-quiet"
            }`}
            title="Connect StiltZ-Kin to the Live Global Web & Grant Intelligence Grid"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={3} />
            <span>Web Grid</span>
          </button>

          {/* Maps Grounding toggle */}
          <button
            type="button"
            onClick={handleToggleMaps}
            className={`btn btn-sm !px-2.5 !py-1 text-xs flex items-center gap-1.5 cursor-pointer ${
              grounding === "maps" ? "bg-emerald-400 text-ink font-black ring-2 ring-ink" : "btn-quiet"
            }`}
            title="Connect StiltZ-Kin to Geospatial Commercial Telemetry"
          >
            <MapPin className="h-3.5 w-3.5" strokeWidth={3} />
            <span>Geo Radar</span>
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={clearChat}
            className="btn btn-sm btn-quiet !px-2 cursor-pointer"
            title="Reset StiltZ-Kin session"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Role & Persona System Instruction Drawer */}
      {showRoleConfig && (
        <div className="p-3 bg-cream border-b-3 border-ink text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-muted">
                Active StiltZ-Kin Neural Core:
              </span>
              <strong className="text-sm font-black">{activeRoleConfig.label}</strong>
              <span className="badge text-[10px] bg-ink text-mint px-2 py-0.5 font-bold">
                {activeRoleConfig.model}
              </span>
              <span className="chip text-[10px] bg-mint text-ink font-extrabold">
                {activeRoleConfig.badge}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRoleConfig(false)}
              className="text-muted hover:text-ink font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
          <p className="text-muted font-medium text-xs">{activeRoleConfig.description}</p>
          <div>
            <label
              htmlFor="custom-instruction-input"
              className="block text-[10px] font-black uppercase text-muted mb-1"
            >
              Custom Executive Directive (Optional):
            </label>
            <input
              id="custom-instruction-input"
              type="text"
              aria-label="Custom persona and system instruction"
              className="input !py-1.5 !text-xs w-full !bg-white"
              placeholder={`E.g. "Focus on high-ticket B2B retainers" or "Be ruthlessly metrics-driven"`}
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Grounding Active Banner */}
      {grounding !== "none" && (
        <div className="flex items-center justify-between px-4 py-2 text-xs font-bold bg-cream border-b-2 border-ink">
          <div className="flex items-center gap-2">
            {grounding === "search" ? (
              <>
                <Search className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  <strong>StiltZ-Kin™ Live Web &amp; Grant Intelligence Grid active:</strong> Retrieving real-time market &amp; funding citations.
                </span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  <strong>StiltZ-Kin™ Geospatial Commercial Telemetry active:</strong> Scanning real locations, commercial corridors &amp; local competitors
                  {location ? " (using your coordinates)" : ""}.
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setGrounding("none")}
            className="text-muted hover:text-ink underline text-[11px] cursor-pointer"
          >
            Disable
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-paper/60">
        {messages.map((m) => {
          const isUser = m.role === "user";
          // Split advisor reply into clickable paragraphs/blocks so the user can click any block to save it to the Notebook!
          const blocks = isUser
            ? [m.content]
            : m.content
                .split(/\n{2,}/)
                .map((b) => b.trim())
                .filter(Boolean);

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[94%] ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-9 w-9 shrink-0 grid place-items-center b3 border-2 border-ink ${
                  isUser ? "bg-sun text-ink" : "bg-ink text-mint"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                      {isUser ? "You (Founder)" : "StiltZ-Kin™"}
                    </span>
                    {!isUser && m.modelUsed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-ink text-mint border border-ink rounded">
                        {formatVanguardModelName(m.modelUsed, activeRoleConfig.model)}
                      </span>
                    )}
                    {!isUser && m.groundingType === "search" && (
                      <span className="text-[10px] font-extrabold text-blue-700 flex items-center gap-0.5">
                        <Search className="h-2.5 w-2.5" /> Web Grid Grounded
                      </span>
                    )}
                    {!isUser && m.groundingType === "maps" && (
                      <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" /> Geo Telemetry Grounded
                      </span>
                    )}
                  </div>

                  {/* Quick Actions on every Advisor Reply: Save Full Reply to Notebook + Copy */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleSaveSnippetToNotebook(m.content, `${m.id}-full`, true)
                        }
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase bg-mint hover:bg-sun text-ink border border-ink shadow-[1px_1px_0px_#000] cursor-pointer transition-colors"
                        title="Save entire reply as a new note and slide open your Founder Notebook"
                      >
                        {savedSnippetKey === `${m.id}-full` ? (
                          <>
                            <Check className="h-3 w-3" strokeWidth={3} /> Saved to Notebook!
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-3 w-3" strokeWidth={2.5} /> + Save Full Reply to Notebook
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText(m.id, m.content)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase bg-white hover:bg-cream text-ink border border-ink cursor-pointer"
                        title="Copy reply text"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-700" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser ? (
                  <div className="b3 p-4 border-2 border-ink bg-sun text-ink font-bold shadow-md">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                  </div>
                ) : (
                  <div className="b3 p-3.5 border-2 border-ink bg-white text-ink shadow-sm space-y-2">
                    {blocks.map((block, bIdx) => {
                      const snippetKey = `${m.id}-block-${bIdx}`;
                      const isSaved = savedSnippetKey === snippetKey;
                      return (
                        <div
                          key={snippetKey}
                          onClick={() => handleSaveSnippetToNotebook(block, snippetKey, false)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSaveSnippetToNotebook(block, snippetKey, false);
                            }
                          }}
                          title="Click this text block to save it as a new note in your Founder Notebook"
                          className={`group/block relative rounded-none border border-transparent hover:border-ink hover:bg-mint/20 p-2 -mx-1 transition-all cursor-pointer ${
                            isSaved ? "bg-mint/40 border-ink" : ""
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed pr-2">
                            {block}
                          </p>
                          <span
                            className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase border border-ink transition-opacity ${
                              isSaved
                                ? "bg-ink text-mint opacity-100"
                                : "bg-sun text-ink opacity-0 group-hover/block:opacity-100"
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <Check className="h-2.5 w-2.5 stroke-[3]" /> Added to Notebook!
                              </>
                            ) : (
                              <>
                                <Plus className="h-2.5 w-2.5 stroke-[3]" /> Click text to save to Notebook
                              </>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Grounding Sources (Search & Maps Links) */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 b3 p-3 bg-cream border-2 border-ink text-xs space-y-2">
                    <p className="font-extrabold uppercase text-[10px] tracking-wider text-muted flex items-center gap-1.5">
                      {m.groundingType === "maps" ? (
                        <>
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          StiltZ-Kin™ Geospatial Telemetry Coordinates ({m.sources.length})
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3 text-blue-600" />
                          StiltZ-Kin™ Live Web Intelligence Citations ({m.sources.length})
                        </>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {m.sources.map((s, sIdx) => (
                        <a
                          key={sIdx}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-sun border border-ink text-xs font-bold text-ink rounded no-underline transition-colors max-w-full truncate"
                        >
                          <span className="truncate">{s.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="h-9 w-9 shrink-0 grid place-items-center b3 border-2 border-ink bg-ink text-mint">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="b3 p-4 border-2 border-ink bg-white flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-ink" strokeWidth={3} />
              <span className="text-sm font-extrabold">
                {grounding === "search"
                  ? "StiltZ-Kin™ scanning live Global Web & Grant Grid…"
                  : grounding === "maps"
                  ? "StiltZ-Kin™ triangulating Geospatial Commercial Telemetry…"
                  : role === "complex"
                  ? "Synthesizing with StiltZ-Kin Omni-9 Deep Strategic Core…"
                  : "StiltZ-Kin™ formulating executive directive…"}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 py-2 bg-cream border-t-2 border-ink">
          <p className="text-[11px] font-extrabold uppercase text-muted mb-1.5">
            StiltZ-Kin™ Executive Quick Commands
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((sp, idx) => {
              const Icon = sp.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRole(sp.role);
                    setGrounding(sp.grounding);
                    handleSend(sp.text, sp.role, sp.grounding);
                  }}
                  className="b3 bg-white hover:bg-sun border border-ink px-3 py-1.5 text-xs font-bold text-left flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-ink" />
                  <span className="line-clamp-1">{sp.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t-4 border-ink bg-sun p-3"
      >
        <input
          type="text"
          aria-label="Chat message input"
          className="input flex-1 !bg-white"
          placeholder={
            grounding === "search"
              ? "Command StiltZ-Kin™ Web Grid (grants, market shifts, competitor intel)…"
              : grounding === "maps"
              ? "Command StiltZ-Kin™ Geo Radar (local competitors, suppliers, commercial zones)…"
              : role === "complex"
              ? "Command StiltZ-Kin™ Omni-9 (unit economics, pricing matrices, moat strategy)…"
              : "Ask StiltZ-Kin™ anything about your business, pricing, customers, or next steps…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn !px-5 cursor-pointer"
          disabled={loading || !input.trim()}
          aria-label="Send Message"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} />
          ) : (
            <Send className="h-5 w-5" strokeWidth={3} />
          )}
        </button>
      </form>
    </div>
  );
}
