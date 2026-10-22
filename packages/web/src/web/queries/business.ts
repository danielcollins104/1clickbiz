import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { authClient } from "../lib/auth";

export function useSession() {
  return authClient.useSession();
}

/** Unlocked tools, plans and remaining generations. Only runs when signed in. */
export function useAccess() {
  const { data: session } = useSession();
  const opts = orpc.billing.access.queryOptions({ enabled: !!session, staleTime: 15_000 });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[useAccess] fetch failed:", err);
      }
      return { tools: [], plans: [], generations: null };
    },
  });
}

export function useBusinesses() {
  const { data: session } = useSession();
  const opts = orpc.businesses.list.queryOptions({ enabled: !!session });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[useBusinesses] fetch failed:", err);
      }
      return [];
    },
  });
}

export function useBusiness(id: number | undefined) {
  const opts = orpc.businesses.get.queryOptions({
    input: { id: id ?? 0 },
    enabled: !!id,
    // Poll while anything is generating.
    refetchInterval: (q) => {
      const d = q.state.data;
      if (!d) return false;
      const busy = d.running || Object.values(d.assets).some((a) => a.status === "running");
      return busy ? 2500 : false;
    },
  });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn(`[useBusiness] fetch failed for ${id}:`, err);
      }
      return null;
    },
  });
}

function useInvalidateBusiness() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.businesses.key() });
    qc.invalidateQueries({ queryKey: orpc.billing.access.key() });
  };
}

export function useCreateBusiness() {
  const done = useInvalidateBusiness();
  return useMutation(orpc.businesses.create.mutationOptions({ onSuccess: done }));
}

export function useRegenerate() {
  const done = useInvalidateBusiness();
  return useMutation(orpc.businesses.regenerate.mutationOptions({ onSettled: done }));
}

export function useRebuild() {
  const done = useInvalidateBusiness();
  return useMutation(orpc.businesses.rebuild.mutationOptions({ onSettled: done }));
}

export function useChoose() {
  const done = useInvalidateBusiness();
  return useMutation(orpc.businesses.choose.mutationOptions({ onSettled: done }));
}

export function useToggleTask() {
  const done = useInvalidateBusiness();
  return useMutation(orpc.businesses.toggleTask.mutationOptions({ onSettled: done }));
}

export function useUpdateIntake() {
  const done = useInvalidateBusiness();
  return useMutation(orpc.businesses.updateIntake.mutationOptions({ onSuccess: done }));
}

export function useUpdateSlug() {
  const done = useInvalidateBusiness();
  return useMutation(orpc.businesses.updateSlug.mutationOptions({ onSuccess: done }));
}

export function useRemoveBusiness() {
  const done = useInvalidateBusiness();
  return useMutation(orpc.businesses.remove.mutationOptions({ onSuccess: done }));
}

/* CRM */
export function useLeads(businessId: number | undefined) {
  const opts = orpc.crm.list.queryOptions({ input: { businessId: businessId ?? 0 }, enabled: !!businessId });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn(`[useLeads] fetch failed for ${businessId}:`, err);
      }
      return [];
    },
  });
}

function useInvalidateLeads() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.crm.key() });
    qc.invalidateQueries({ queryKey: orpc.businesses.key() });
  };
}

export function useAddLead() {
  const done = useInvalidateLeads();
  return useMutation(orpc.crm.add.mutationOptions({ onSuccess: done }));
}
export function useUpdateLead() {
  const done = useInvalidateLeads();
  return useMutation(orpc.crm.update.mutationOptions({ onSettled: done }));
}
export function useRemoveLead() {
  const done = useInvalidateLeads();
  return useMutation(orpc.crm.remove.mutationOptions({ onSettled: done }));
}

/* Billing */
export function useCheckout() {
  return useMutation(orpc.billing.checkout.mutationOptions());
}
export function usePortal() {
  return useMutation(orpc.billing.portal.mutationOptions());
}
export function useDropSingles() {
  const qc = useQueryClient();
  return useMutation(
    orpc.billing.dropSingles.mutationOptions({
      // Autumn's read lags its write by a few seconds, so mark the plans locally rather than refetching.
      onSuccess: () =>
        qc.setQueryData(orpc.billing.access.queryKey(), (a) =>
          a ? { ...a, plans: a.plans.map((p) => (p.planId.startsWith("tool_") ? { ...p, canceling: true } : p)) } : a,
        ),
    }),
  );
}
export function useRefreshAccess() {
  const qc = useQueryClient();
  return useMutation(
    orpc.billing.refresh.mutationOptions({
      onSuccess: (data) => qc.setQueryData(orpc.billing.access.queryKey(), data),
    }),
  );
}

/* Public site */
export function useSite(slug: string) {
  const opts = orpc.sites.get.queryOptions({ input: { slug }, retry: false });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn(`[useSite] fetch failed for ${slug}:`, err);
      }
      return null;
    },
  });
}
export function useSubmitLead() {
  return useMutation(orpc.sites.submitLead.mutationOptions());
}

/** Human message from an oRPC / fetch error. */
export function errorMessage(e: unknown, fallback = "Something went wrong. Try again.") {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    const m = (e as { message: string }).message;
    return m && m !== "Internal server error" ? m : fallback;
  }
  return fallback;
}
