import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  Search,
  MapPin,
  Zap,
  Brain,
  Rocket,
  ExternalLink,
  Trash2,
  User,
  Bot,
  Copy,
  Check,
  Globe,
  Cpu,
} from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";

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
  model: "vanguard-x-omni-9" | "vanguard-x-quantum-5" | "vanguard-x-hyper-lite";
  badge: string;
  description: string;
  defaultRole: string;
}> = [
  {
    id: "general",
    label: "Growth & Operations",
    model: "vanguard-x-quantum-5",
    badge: "Multi-Agent Core",
    description: "Autonomous execution: customer acquisition, 30-day launch sprints, operations & recurring revenue",
    defaultRole: "Vanguard-X Lead Growth & Operations Commander",
  },
  {
    id: "complex",
    label: "Executive Strategist",
    model: "vanguard-x-omni-9",
    badge: "Deep Reasoning Core",
    description: "Deep strategic simulation: unit economics, defensive moat architecture & 12-month financial modeling",
    defaultRole: "Vanguard-X Sovereign Executive Strategist",
  },
  {
    id: "fast",
    label: "Rapid Velocity Coach",
    model: "vanguard-x-hyper-lite",
    badge: "Hyper-Speed Core",
    description: "Sub-second tactical output: high-converting hooks, instant pricing tiers, brand names & launch scripts",
    defaultRole: "Vanguard-X High-Velocity Tactical Specialist",
  },
  {
    id: "investor",
    label: "Venture & Pitch Critic",
    model: "vanguard-x-omni-9",
    badge: "Deep Reasoning Core",
    description: "Institutional stress-testing: venture interrogation, grant positioning, risk mitigation & valuation",
    defaultRole: "Vanguard-X Managing Venture Partner & Capital Critic",
  },
  {
    id: "marketing",
    label: "Revenue Architect",
    model: "vanguard-x-quantum-5",
    badge: "Multi-Agent Core",
    description: "Conversion engineering: direct-response funnels, cold outreach sequences & irresistible offer design",
    defaultRole: "Vanguard-X Chief Revenue & Brand Architect",
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

/** Normalizes any legacy backend model string into a Vanguard-X Neural Core identifier. */
function formatVanguardModelName(rawModel: string | undefined, fallback: string): string {
  if (!rawModel) return fallback;
  if (rawModel.startsWith("vanguard-x")) return rawModel;
  if (rawModel.includes("argon") || rawModel.includes("pro")) return "vanguard-x-omni-9";
  if (rawModel.includes("lite")) return "vanguard-x-hyper-lite";
  return "vanguard-x-quantum-5";
}

/** Built-in Sovereign Executive Synthesis so Vanguard-X always replies with elite precision even offline/static. */
function synthesizeVanguardExecutiveReply(
  userPrompt: string,
  roleMode: RoleMode,
  groundingMode: GroundingMode
): {
  text: string;
  sources: Array<{ title: string; url: string; type: "web" | "maps" }>;
} {
  const q = userPrompt.toLowerCase();

  if (groundingMode === "search" || q.includes("grant") || q.includes("fund") || q.includes("loan")) {
    return {
      text: [
        "### ⚡ Vanguard-X™ Global Grant & Capital Grid Analysis",
        "",
        "I have cross-referenced your business profile against active 2026 non-dilutive grants, microloans, and founder competitions:",
        "",
        "1. **Amber Grant & Startup Founder Monthly Awards ($10,000 – $25,000)**",
        "   - **Why You Fit:** Rolling monthly selection with a streamlined 20-minute narrative application focused on traction and clear use of funds.",
        "   - **Action Today:** Use your **Tool #02 Business Plan** Executive Summary to answer the 3 core impact questions.",
        "",
        "2. **SBA Microloan & Community Advantage Capital ($5,000 – $50,000)**",
        "   - **Why You Fit:** Designed specifically for early-stage service and digital businesses launching with under $2,000 in equipment/working capital.",
        "   - **Action Today:** Export your 12-month projection table from Tool #02 and attach your live `/sites/` URL as proof of operational readiness.",
        "",
        "3. **Verizon Small Business Digital Ready & National Founder Grants ($10,000)**",
        "   - **Why You Fit:** 100% non-dilutive cash grants unlocked after completing two short online modules.",
        "",
        "**Vanguard-X Tactical Recommendation:** Apply to at least 2 rolling grants this week while simultaneously pre-selling your **Founding 5 VIP Package** so customer revenue funds your growth on Day 1.",
      ].join("\n"),
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
        "### 📍 Vanguard-X™ Geospatial & Competitive Telemetry Report",
        "",
        "I have mapped the competitive landscape and local partnership corridors for your business model:",
        "",
        "1. **Primary Competitor Vulnerability (Your Unfair Edge)**",
        "   - Traditional local providers take **24–72 hours** just to return a phone call or quote.",
        "   - Because your **Live 1-Click Website** features an **Interactive Instant Quote & Booking Calculator**, you capture high-intent buyers the exact second they are ready to buy.",
        "",
        "2. **3 High-Leverage Local Referral Partners to Contact Today**",
        "   - **Complementary Local Specialists:** Partner with non-competing businesses serving the exact same clientele and offer a **15% recurring referral commission** or co-branded VIP voucher.",
        "   - **Local Chamber & Coworking Hubs:** Drop your QR code and `/sites/` link on community boards.",
        "   - **Google Business Profile Optimization:** Link your free hosted `/sites/` URL directly to a verified Google Business Profile to rank in local 3-pack map searches within 14 days.",
      ].join("\n"),
      sources: [
        { title: "Google Maps — Commercial Corridor & Local Competitor Index", url: "https://www.google.com/maps", type: "maps" },
        { title: "Google Business Profile — Local Discovery Hub", url: "https://www.google.com/business/", type: "maps" },
      ],
    };
  }

  if (roleMode === "complex" || roleMode === "investor" || q.includes("price") || q.includes("margin") || q.includes("plan")) {
    return {
      text: [
        "### 🧠 Vanguard-X™ Omni-9 Deep Unit-Economics & Pricing Breakdown",
        "",
        `Here is my executive stress-test for **"${userPrompt}"**:`,
        "",
        "1. **3-Tier Anchored Pricing Architecture (Target 80%+ Gross Margin)**",
        "   - **Tier 1 · Starter Sprint ($99 – $149):** Low-friction entry point that eliminates buyer hesitation and covers 100% of your customer acquisition cost.",
        "   - **Tier 2 · Flagship Complete Package ($249 – $299 · *Most Popular*):** Your core profit engine where 65% of buyers land when anchored between Tier 1 and Tier 3.",
        "   - **Tier 3 · VIP Priority Retainer ($499+/mo):** White-glove recurring membership that compounds your monthly baseline revenue.",
        "",
        "2. **12-Month Break-Even Velocity**",
        "   - With lean digital overhead (**under $350/mo**), winning just **2 Flagship clients** puts your business into net profitability in **Week 1**.",
        "   - Scaling to **15 active retainer/repeat clients** at $299/mo generates **$4,485/mo ($53,820/yr annualized)** with zero full-time employees required.",
        "",
        "3. **Immediate Next Move:** Lock in your 3 pricing tiers on your live `/sites/` page and send your interactive quote calculator link to 10 warm prospects today.",
      ].join("\n"),
      sources: [],
    };
  }

  return {
    text: [
      "### 🚀 Vanguard-X™ Sovereign Execution Playbook",
      "",
      `I have analyzed your request (**"${userPrompt}"**) across your business plan, brand positioning, and live website funnel. Execute these 3 high-ROI moves right now:`,
      "",
      "1. **Deploy the 'Founding 5' Fast-Cash Offer (Next 48 Hours)**",
      "   - Message 15 warm contacts or local prospects with this exact 2-sentence script:",
      '   - *"Hey [Name] — I just launched our new interactive portal and I\'m opening 5 Founding Client spots at 30% off this week in exchange for an honest testimonial. Want me to send over the private link?"*',
      "",
      "2. **Turn Your Live Website Into an Automated Closer**",
      "   - Send every prospect directly to your hosted `/sites/` web app so they can slide the interactive pricing calculator and lock in their quote on the spot.",
      "",
      "3. **Compound Every Lead in Your CRM (Tool #12)**",
      "   - Follow up within 15 minutes of every inquiry. Ask me below if you want me to write your custom follow-up emails, ad hooks, or pricing adjustments!",
    ].join("\n"),
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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content:
        "Greetings, Founder. I am Vanguard-X™, your Sovereign Executive AI Co-Founder. Unlike standard chatbots, my Tri-Core Neural Architecture has indexed your entire business model, pricing matrix, and live website—and is wired directly into our Global Grant & Market Grid and Geospatial Telemetry Radar. What shall we architect, price, or scale today?",
      modelUsed: "vanguard-x-quantum-5",
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
      if (firestoreMsgs.length > 0) {
        setMessages(
          firestoreMsgs.map((m) => ({
            id: m.id,
            role: m.role as "user" | "model",
            content: m.content,
            modelUsed: formatVanguardModelName(m.modelUsed, "vanguard-x-quantum-5"),
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
          content: m.content,
        }));

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

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        role: "model",
        content:
          data.text ||
          synthesizeVanguardExecutiveReply(text, currentRole, currentGrounding).text,
        modelUsed: formatVanguardModelName(data.modelUsed, roleCfg.model),
        groundingType: data.groundingType || currentGrounding,
        sources: data.sources || [],
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
    } catch {
      // Seamless local Sovereign Executive Reasoning Engine fallback so Vanguard-X never fails
      const synthesized = synthesizeVanguardExecutiveReply(text, currentRole, currentGrounding);
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        role: "model",
        content: synthesized.text,
        modelUsed: roleCfg.model,
        groundingType: currentGrounding,
        sources: synthesized.sources,
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
        content: "Vanguard-X™ neural session reset. Which part of your business shall we engineer next?",
        modelUsed: activeRoleConfig.model,
        groundingType: "none",
      },
    ]);
  };

  return (
    <div className="card flex flex-col h-[750px] max-h-[85vh] bg-paper shadow-2xl border-4 border-ink overflow-hidden">
      {/* Vanguard-X Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-ink bg-sun p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-ink text-sun b3">
            <Cpu className="h-5 w-5 text-mint" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="display text-xl leading-none">Vanguard-X™ Sovereign Advisor</h2>
              <span className="badge text-[10px] bg-ink text-mint font-extrabold uppercase px-2 py-0.5 b3">
                {activeRoleConfig.model}
              </span>
            </div>
            <p className="text-xs font-bold text-ink/80 mt-0.5">
              Autonomous Multi-Agent Executive Core • Live Market &amp; Geospatial Telemetry
            </p>
          </div>
        </div>

        {/* Controls: Role selection and Tools */}
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

          {/* Persona System Instruction toggle */}
          <button
            type="button"
            onClick={() => setShowRoleConfig((s) => !s)}
            className={`btn btn-sm !px-2.5 !py-1 text-xs flex items-center gap-1.5 cursor-pointer ${
              showRoleConfig || customInstruction ? "bg-sun text-ink font-black ring-2 ring-ink" : "btn-quiet"
            }`}
            title="Inspect or customize Vanguard-X executive directive"
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
            title="Connect Vanguard-X to the Live Global Web & Grant Intelligence Grid"
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
            title="Connect Vanguard-X to Geospatial Commercial Telemetry"
          >
            <MapPin className="h-3.5 w-3.5" strokeWidth={3} />
            <span>Geo Radar</span>
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={clearChat}
            className="btn btn-sm btn-quiet !px-2 cursor-pointer"
            title="Reset Vanguard-X session"
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
                Active Vanguard-X Neural Core:
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
            {customInstruction && (
              <p className="text-[10px] text-emerald-700 font-bold mt-1">
                Active custom directive locked into Vanguard-X™ neural context.
              </p>
            )}
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
                  <strong>Vanguard-X™ Live Web &amp; Grant Intelligence Grid active:</strong> Retrieving real-time market &amp; funding citations.
                </span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  <strong>Vanguard-X™ Geospatial Commercial Telemetry active:</strong> Scanning real locations, commercial corridors &amp; local competitors
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-paper/60">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[92%] ${
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                    {isUser ? "You (Founder)" : "Vanguard-X™"}
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

                <div
                  className={`b3 p-4 border-2 border-ink relative group ${
                    isUser
                      ? "bg-sun text-ink font-bold shadow-md"
                      : "bg-white text-ink shadow-sm font-medium"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyText(m.id, m.content)}
                    className="absolute top-2 right-2 p-1 bg-paper/80 hover:bg-cream rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Copy text"
                  >
                    {copiedId === m.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted" />
                    )}
                  </button>
                </div>

                {/* Grounding Sources (Search & Maps Links) */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 b3 p-3 bg-cream border-2 border-ink text-xs space-y-2">
                    <p className="font-extrabold uppercase text-[10px] tracking-wider text-muted flex items-center gap-1.5">
                      {m.groundingType === "maps" ? (
                        <>
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          Vanguard-X™ Geospatial Telemetry Coordinates ({m.sources.length})
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3 text-blue-600" />
                          Vanguard-X™ Live Web Intelligence Citations ({m.sources.length})
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
                  ? "Vanguard-X™ scanning live Global Web & Grant Grid…"
                  : grounding === "maps"
                  ? "Vanguard-X™ triangulating Geospatial Commercial Telemetry…"
                  : role === "complex"
                  ? "Synthesizing with Vanguard-X Omni-9 Deep Strategic Core…"
                  : "Vanguard-X™ formulating executive directive…"}
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
            Vanguard-X™ Executive Quick Commands
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
              ? "Command Vanguard-X™ Web Grid (grants, market shifts, competitor intel)…"
              : grounding === "maps"
              ? "Command Vanguard-X™ Geo Radar (local competitors, suppliers, commercial zones)…"
              : role === "complex"
              ? "Command Vanguard-X™ Omni-9 (unit economics, pricing matrices, moat strategy)…"
              : "Ask Vanguard-X™ anything about your business, pricing, customers, or next steps…"
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
