import { feature, item, plan } from "atmn";
import {
  BUNDLE_GENERATIONS,
  BUNDLE_SLUG,
  GENERATIONS,
  PRODUCTS,
  TOOL_GENERATIONS,
  featureIdFor,
  planIdFor,
} from "./packages/web/src/api/catalog";

const tools = PRODUCTS.filter((p) => p.slug !== BUNDLE_SLUG);
const bundle = PRODUCTS.find((p) => p.slug === BUNDLE_SLUG)!;

export const generations = feature({
  id: GENERATIONS,
  name: "AI generations",
  type: "metered",
  consumable: true,
});

const toolFeatures = tools.map((t) =>
  feature({ id: featureIdFor(t.slug), name: t.name, type: "boolean" }),
);

export const phase1 = plan({
  id: planIdFor(BUNDLE_SLUG),
  name: bundle.name,
  description: bundle.tagline,
  // Autumn takes whole currency units: amount 99 => $99.00/mo in Stripe (verified with a fresh customer).
  price: { amount: bundle.price, interval: "month" },
  items: [
    ...toolFeatures.map((f) => item({ featureId: f.id })),
    item({ featureId: generations.id, included: BUNDLE_GENERATIONS, reset: { interval: "month" } }),
  ],
});

const toolPlans = tools.map((t) =>
  plan({
    id: planIdFor(t.slug),
    name: t.name,
    description: t.tagline,
    addOn: true,
    price: { amount: t.price, interval: "month" },
    items: [
      item({ featureId: featureIdFor(t.slug) }),
      item({ featureId: generations.id, included: TOOL_GENERATIONS, reset: { interval: "month" } }),
    ],
  }),
);

export default {
  features: [generations, ...toolFeatures],
  plans: [phase1, ...toolPlans],
};
