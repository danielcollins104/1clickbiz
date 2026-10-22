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
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn("[useOnboarding] query failed:", err);
      }
      return null;
    },
  });
}

export function useUpdateOnboarding() {
  const q = useQueryClient();
  return useMutation(
    orpc.launch.update.mutationOptions({
      onSuccess: () => q.invalidateQueries({ queryKey: orpc.launch.onboarding.key() }),
    })
  );
}

export function useContact() {
  return useMutation(orpc.launch.contact.mutationOptions());
}
