import { createGateway } from "ai";

export const gateway = createGateway({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

/** Fast structured-text model used by every generator. */
export const TEXT_MODEL = "google/gemini-3-flash";
/** Web-search model for the Funding Finder. */
export const SEARCH_MODEL = "perplexity/sonar";
/** Image model for logos, ads and social graphics. */
export const IMAGE_MODEL = "google/gemini-3.1-flash-image";
/** Conversational model for the Advisor. */
export const CHAT_MODEL = "anthropic/claude-sonnet-5";
