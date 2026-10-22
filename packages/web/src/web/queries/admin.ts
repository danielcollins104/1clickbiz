import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { useSession } from "./business";

export function useAdminStatus() {
  const { data: s } = useSession();
  const opts = orpc.admin.status.queryOptions({ enabled: !!s, retry: false });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch {
        // Not admin or auth error
      }
      return { allowed: false };
    },
  });
}

export function useAdminOverview(enabled: boolean) {
  const opts = orpc.admin.overview.queryOptions({ enabled, retry: false, refetchInterval: 60_000 });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[admin.overview] query failed:", err);
      }
      return null;
    },
  });
}

export function useAdminCustomers(search: string, page: number, enabled: boolean) {
  const opts = orpc.admin.customers.queryOptions({ input: { search, page }, enabled, retry: false, refetchInterval: 60_000 });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[admin.customers] query failed:", err);
      }
      return [];
    },
  });
}

export function useAdminCustomer(id: string) {
  const opts = orpc.admin.customer.queryOptions({ input: { id }, enabled: !!id, retry: false });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn(`[admin.customer] query failed for ${id}:`, err);
      }
      return null;
    },
  });
}

export function useAdminOutputs(id: number) {
  const opts = orpc.admin.outputs.queryOptions({ input: { id }, enabled: !!id, retry: false });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn(`[admin.outputs] query failed for ${id}:`, err);
      }
      return null;
    },
  });
}

export function useAdminErrors(page: number, enabled: boolean) {
  const opts = orpc.admin.errors.queryOptions({ input: { page }, enabled, retry: false });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[admin.errors] query failed:", err);
      }
      return [];
    },
  });
}

export function useAdminMessages(enabled: boolean) {
  const opts = orpc.admin.messages.queryOptions({ enabled, retry: false });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[admin.messages] query failed:", err);
      }
      return [];
    },
  });
}

export function useAdminComp() {
  const q = useQueryClient();
  return useMutation(orpc.admin.comp.mutationOptions({ onSuccess: () => q.invalidateQueries({ queryKey: orpc.admin.key() }) }));
}

export function useResolveMessage() {
  const q = useQueryClient();
  return useMutation(orpc.admin.resolve.mutationOptions({ onSuccess: () => q.invalidateQueries({ queryKey: orpc.admin.messages.key() }) }));
}
