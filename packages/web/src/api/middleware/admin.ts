import { ORPCError } from "@orpc/server";
import { authed } from "./auth";

const DEFAULT_ADMINS = ["danielcollins104@gmail.com"];

export function isAdmin(u: { email?: string | null; emailVerified?: boolean } | null) {
  if (!u?.email) return false;
  const email = u.email.trim().toLowerCase();
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((x: string) => x.trim().toLowerCase())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_ADMINS, ...configured]);
  return allowed.has(email);
}
export const adminOnly = authed.use(async ({ context, next }) => {
  if (!isAdmin(context.user)) throw new ORPCError("NOT_FOUND");
  return next();
});
