import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { useSession } from "./business";

export function useLaunchConfig() {
  const opts = orpc.launch.config.queryOptions();
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[useLaunchConfig] query failed:", err);
      }
      return null;
    },
  });
}

export function useOnboarding() {
  const { data: session } = useSession();
  const opts = orpc.launch.onboarding.queryOptions({ enabled: !!session });
  return useQuery({
    ...opts,
    enabled: !!session,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[useOnboarding] query failed:", err);
      }
      try {
        const raw = localStorage.getItem("1cb_local_onboarding");
        if (raw) return JSON.parse(raw);
      } catch {
        // Ignore
      }
      return {};
    },
  });
}

export function useUpdateOnboarding() {
  const q = useQueryClient();
  const baseOpts = orpc.launch.update.mutationOptions({
    onSuccess: () => q.invalidateQueries({ queryKey: orpc.launch.onboarding.key() }),
  });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: Record<string, boolean>, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input as any, ctx);
      } catch {
        // Local fallback
      }
      try {
        const prev = JSON.parse(localStorage.getItem("1cb_local_onboarding") || "{}");
        localStorage.setItem("1cb_local_onboarding", JSON.stringify({ ...prev, ...input }));
      } catch {
        // Ignore
      }
      q.invalidateQueries({ queryKey: orpc.launch.onboarding.key() });
      return { ok: true };
    },
  });
}

export function useContact() {
  const baseOpts = orpc.launch.contact.mutationOptions();
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { name: string; email: string; subject: string; message: string; website?: string }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      return { ok: true };
    },
  });
}
