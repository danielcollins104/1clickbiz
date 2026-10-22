import type { ComponentType } from "react";
import type { ViewerProps } from "./common";
import { BrandViewer, IdeaViewer, NameViewer, PlanViewer } from "./plan";
import { ColorFontViewer, LogoViewer, WebsiteViewer } from "./design";
import { AdViewer, SocialViewer } from "./market";
import { AdvisorViewer, ChecklistViewer, CrmViewer, FundingViewer } from "./run";
import { ColdOutreachViewer, CompetitorRadarViewer, SeoEngineViewer } from "./growth";

export type { ViewerProps } from "./common";

export const VIEWERS: Record<string, ComponentType<ViewerProps>> = {
  "idea-wizard": IdeaViewer,
  "name-generator": NameViewer,
  "business-plan": PlanViewer,
  "brand-generator": BrandViewer,
  "color-font-system": ColorFontViewer,
  "logo-generation": LogoViewer,
  "website-generator": WebsiteViewer,
  "ad-generator": AdViewer,
  "social-generator": SocialViewer,
  "launch-checklist": ChecklistViewer,
  "funding-finder": FundingViewer,
  "customer-crm": CrmViewer,
  "ai-advisor": AdvisorViewer,
  "cold-outreach": ColdOutreachViewer,
  "competitor-radar": CompetitorRadarViewer,
  "seo-engine": SeoEngineViewer,
};

/** Tools whose output feeds others — regenerating them offers a downstream rebuild. */
export const UPSTREAM = new Set(["idea-wizard", "name-generator", "brand-generator", "color-font-system"]);

/** Placeholder for the "describe a change" box, per tool. */
export const EDIT_HINTS: Record<string, string> = {
  "idea-wizard": "e.g. Lower startup cost, something I can run from home",
  "name-generator": "e.g. Shorter names, more playful, avoid the word 'co'",
  "business-plan": "e.g. Assume I charge $45 per session and work 15 hours a week",
  "brand-generator": "e.g. Warmer and more personal, less corporate",
  "color-font-system": "e.g. Earthier colours, a serif for headings",
  "logo-generation": "e.g. Use a leaf symbol, thicker lettering",
  "website-generator": "e.g. Add a section about weekend bookings, new hero photo",
  "ad-generator": "e.g. Focus on busy parents, more urgency",
  "social-generator": "e.g. Only Instagram and TikTok, more behind-the-scenes",
  "launch-checklist": "e.g. I'm registering as an LLC in Texas",
  "funding-finder": "e.g. Only grants for women founders, nothing over $50k",
  "ai-advisor": "e.g. Focus the brief on getting the first 10 customers",
  "cold-outreach": "e.g. Shorter emails, focus on decision makers in healthcare",
  "competitor-radar": "e.g. Focus on low-cost competitors and their shipping delays",
  "seo-engine": "e.g. Target commercial local keywords and zero-click answer engine summaries",
};
