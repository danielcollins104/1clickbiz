import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "../../api";
import { authClient } from "./auth";

let staticHostDetected = false;

const link = new RPCLink({
  url: `${window.location.origin}/api/rpc`,
  headers: () => {
    const token = authClient.managedAuth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  fetch: async (input, init) => {
    if (staticHostDetected) {
      throw new Error("Static host fallback active");
    }
    const res = await globalThis.fetch(input, init);
    const ct = res.headers.get("content-type") || "";
    if (res.status === 405 || (res.status === 404 && ct.includes("text/html"))) {
      staticHostDetected = true;
      throw new Error("Static host fallback active");
    }
    return res;
  },
});

/** Direct typed client */
export const client: AppRouterClient = createORPCClient(link);

/** TanStack Query helpers */
export const orpc = createTanstackQueryUtils(client);
