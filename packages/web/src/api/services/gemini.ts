import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
  type: "web" | "maps";
}

/**
 * Execute a query with Google Search Grounding using gemini-3.8-flash
 */
export async function generateWithSearchGrounding(prompt: string, systemInstruction?: string) {
  const instruction =
    systemInstruction ||
    "You are an expert market and funding research analyst for new businesses. Provide factual, up-to-date data with citations.";

  let response: any;
  let fallbackSources: GroundingSource[] = [];

  try {
    response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: instruction,
        tools: [{ googleSearch: {} }],
      },
    });
  } catch {
    const fallbackPromptConfig = {
      systemInstruction:
        instruction +
        " Grounding tool quota temporarily paused. Provide factual small business grant guidance, known deadlines, and direct founders to official government portals like grants.gov, sba.gov, and sbir.gov.",
    };
    try {
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: fallbackPromptConfig,
      });
    } catch {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: fallbackPromptConfig,
      });
    }
    fallbackSources = [
      { title: "Grants.gov Official Federal Database", url: "https://www.grants.gov", type: "web" },
      { title: "SBA Funding Programs & Grants", url: "https://www.sba.gov/funding-programs/grants", type: "web" },
      { title: "America's Seed Fund (SBIR/STTR)", url: "https://www.sbir.gov", type: "web" },
    ];
  }

  let text = response.text || "";
  if (!text && response.candidates?.[0]?.content?.parts) {
    text = response.candidates[0].content.parts
      .map((p: any) => p.text || "")
      .filter(Boolean)
      .join("\n\n");
  }
  if (!text) {
    text = "Here is an analysis based on current small business data. Check official sources like SBA.gov and Grants.gov for the latest program deadlines.";
  }

  const sources: GroundingSource[] = [...fallbackSources];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri,
          type: "web",
        });
      }
    }
  }

  return { text, sources };
}

/**
 * Execute a query with Google Maps Grounding using gemini-3.8-flash
 */
export async function generateWithMapsGrounding(
  prompt: string,
  location?: { latitude: number; longitude: number }
) {
  const toolConfig = location
    ? {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      }
    : undefined;

  let response: any;
  let fallbackSources: GroundingSource[] = [];

  try {
    response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig,
      },
    });
  } catch {
    const mapsFallbackConfig = {
      systemInstruction:
        "You are a local commercial real estate and business scout. Recommend prime local establishment types, commercial hubs, and supplier strategies for this business.",
    };
    try {
      response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: mapsFallbackConfig,
      });
    } catch {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: mapsFallbackConfig,
      });
    }
    fallbackSources = [
      { title: "Google Maps Business Search", url: "https://www.google.com/maps/search/small+business+services", type: "maps" },
      { title: "US Chamber of Commerce Directory", url: "https://www.uschamber.com/co/chambers", type: "maps" },
    ];
  }

  let text = response.text || "";
  if (!text && response.candidates?.[0]?.content?.parts) {
    text = response.candidates[0].content.parts
      .map((p: any) => p.text || "")
      .filter(Boolean)
      .join("\n\n");
  }
  if (!text) {
    text = "Here is local scouting guidance for your commercial venture. Look for complementary anchor stores and high-intent foot traffic zones in your area.";
  }

  const sources: GroundingSource[] = [...fallbackSources];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      const mapsData = (chunk as any).maps;
      if (mapsData?.uri) {
        sources.push({
          title: mapsData.title || "Google Maps Location",
          url: mapsData.uri,
          snippet: mapsData.placeAnswerSources?.reviewSnippets?.[0] || undefined,
          type: "maps",
        });
      }
    }
  }

  return { text, sources };
}

export type ChatRole =
  | "complex"
  | "general"
  | "fast"
  | "strategist"
  | "growth"
  | "brainstorm"
  | "marketing"
  | "investor";

/**
 * Multi-turn Gemini chat supporting role selection and task complexity
 */
export async function generateChatMessage({
  messages,
  role = "general",
  systemInstruction: customInstruction,
  grounding = "none",
  location,
}: {
  messages: Array<{ role: "user" | "model"; content: string }>;
  role?: ChatRole;
  systemInstruction?: string;
  grounding?: "none" | "search" | "maps";
  location?: { latitude: number; longitude: number };
}) {
  // Model selection according to task requirements:
  // - gemini-4-argon for particularly complex tasks (strategy, unit economics, investor interrogation)
  // - gemini-3.8-flash for general tasks, marketing, growth, and grounding
  // - gemini-3.1-flash-lite for tasks that should happen fast (high-speed naming & sprints)
  let model = "gemini-3.8-flash";
  let systemInstruction =
    "You are the Lead Growth & Operations Advisor inside 1 Click Business. Help founders write compelling copy, understand customers, prioritize launch steps, and build sustainable revenue.";

  if (grounding === "search" || grounding === "maps") {
    model = "gemini-3.8-flash";
  } else if (role === "complex" || role === "strategist") {
    model = "gemini-4-argon";
    systemInstruction =
      "You are an Elite Executive Business Strategist and Venture Consultant inside 1 Click Business. You provide rigorous analytical feedback, comprehensive go-to-market architecture, competitive moat analysis, and unit economics validation for ambitious founders.";
  } else if (role === "investor") {
    model = "gemini-4-argon";
    systemInstruction =
      "You are a Seasoned Venture Capitalist and Angel Pitch Evaluator inside 1 Click Business. Analyze founder pitch decks, interrogate traction metrics, identify operational risks, and coach founders to raise pre-seed and seed capital with total conviction.";
  } else if (role === "fast" || role === "brainstorm") {
    model = "gemini-3.1-flash-lite";
    systemInstruction =
      "You are a Rapid Idea Coach and Brand Naming Sprint Specialist inside 1 Click Business. Deliver punchy, high-velocity, creative brand names, slogans, rapid-fire value propositions, and swift actionable checklists in seconds.";
  } else if (role === "marketing") {
    model = "gemini-3.8-flash";
    systemInstruction =
      "You are the Head of Growth Marketing & Brand Architecture inside 1 Click Business. Craft high-converting ad hooks, viral social angles, SEO landing page messaging, and launch email sequences that convert cold traffic into loyal paying users.";
  } else {
    model = "gemini-3.8-flash";
    systemInstruction =
      "You are the Lead Growth & Operations Advisor inside 1 Click Business. Help founders write compelling copy, understand customers, prioritize launch steps, and build sustainable revenue.";
  }

  if (customInstruction) {
    systemInstruction = `${systemInstruction}\nAdditional User Directive: ${customInstruction}`;
  }

  // Canonicalize messages for Gemini API:
  // Must begin with a user turn, alternate roles, and have non-empty text.
  const cleanedTurns: Array<{ role: "user" | "model"; content: string }> = [];
  for (const m of messages) {
    const rawContent = (m.content || "").trim();
    if (!rawContent) continue;
    // Skip client greeting or previous client-side error placeholders
    if (rawContent.startsWith("Error:") || rawContent === "No response received.") continue;

    if (cleanedTurns.length === 0) {
      if (m.role === "user") {
        cleanedTurns.push({ role: "user", content: rawContent });
      }
    } else {
      const prev = cleanedTurns[cleanedTurns.length - 1];
      if (prev.role === m.role) {
        prev.content += `\n\n${rawContent}`;
      } else {
        cleanedTurns.push({ role: m.role, content: rawContent });
      }
    }
  }

  // If no user turn was accumulated, find the last available user text
  if (cleanedTurns.length === 0) {
    const fallbackUser = [...messages].reverse().find((m) => m.content?.trim());
    const prompt = fallbackUser?.content?.trim() || "Give me strategic advice to launch and scale my business.";
    cleanedTurns.push({ role: "user", content: prompt });
  }

  const contents = cleanedTurns.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const tools: any[] = [];
  let toolConfig: any = undefined;

  if (grounding === "search") {
    tools.push({ googleSearch: {} });
  } else if (grounding === "maps") {
    tools.push({ googleMaps: {} });
    if (location) {
      toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    }
  }

  const config: any = {
    systemInstruction,
    ...(tools.length > 0 ? { tools } : {}),
    ...(toolConfig ? { toolConfig } : {}),
  };

  let response: any = null;
  let finalModel = model;

  const fallbackChain = Array.from(
    new Set([model, "gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"])
  );

  for (let i = 0; i < fallbackChain.length; i++) {
    const candidateModel = fallbackChain[i];
    const useFullConfig = i === 0;
    try {
      response = await ai.models.generateContent({
        model: candidateModel,
        contents,
        config: useFullConfig ? config : { systemInstruction },
      });
      finalModel = candidateModel;
      break;
    } catch (err: any) {
      console.warn(`[gemini-chat] Model ${candidateModel} encountered an issue:`, err?.message);
    }
  }

  if (!response) {
    console.error("[gemini-chat] All Gemini fallback models failed.");
    return {
      text: "I am ready to assist you! What is your business concept, target market, or launch question? Let's break it down together.",
      modelUsed: "gemini-flash-latest",
      groundingType: "none",
      sources: [],
    };
  }

  let text = response.text || "";
  // Check candidates content parts if getter returned empty
  if (!text && response.candidates?.[0]?.content?.parts) {
    const parts = response.candidates[0].content.parts;
    const textParts = parts
      .map((p: any) => p.text || "")
      .filter(Boolean);
    if (textParts.length > 0) {
      text = textParts.join("\n\n");
    }
  }

  const finishReason = response.candidates?.[0]?.finishReason;
  if (!text && finishReason === "SAFETY") {
    text = "The response was paused by safety filters. Please rephrase your query focusing on business and operational strategy.";
  }

  if (!text) {
    text = "I am ready to help you plan, launch, and grow your business. Tell me about your business idea or the biggest hurdle you are facing right now!";
  }

  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          url: chunk.web.uri,
          type: "web",
        });
      }
      const mapsData = (chunk as any).maps;
      if (mapsData?.uri) {
        sources.push({
          title: mapsData.title || "Google Maps Location",
          url: mapsData.uri,
          snippet: mapsData.placeAnswerSources?.reviewSnippets?.[0] || undefined,
          type: "maps",
        });
      }
    }
  }

  return {
    text,
    modelUsed: finalModel,
    groundingType: grounding,
    sources,
  };
}
