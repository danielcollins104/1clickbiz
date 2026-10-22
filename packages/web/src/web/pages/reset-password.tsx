import { useState } from "react";
import { Link, useSearch } from "wouter";
import { authClient } from "../lib/auth";
import { useLaunchConfig } from "../queries/launch";
export default function ResetPasswordPage() {
  const token = new URLSearchParams(useSearch()).get("token");
  const { data: config, isLoading } = useLaunchConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = token
        ? await authClient.resetPassword({ token, newPassword: password })
        : await authClient.requestPasswordReset({
            email,
            redirectTo: `${window.location.origin}/reset-password`,
          });
      if (res.error)
        setError(res.error.message ?? "That did not work. Try again.");
      else setDone(true);
    } catch {
      setError("Could not connect. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="display text-5xl">
        {token ? "New password." : "Forgot password?"}
      </h1>
      <div className="card bg-paper mt-8 p-6">
        {done ? (
          <output className="font-bold">
            {token
              ? "Password changed. Sign in with your new password."
              : "If this email has an account, you will receive a reset link shortly."}
          </output>
        ) : isLoading ? (
          <p>Checking email availability…</p>
        ) : !token && !config?.emailEnabled ? (
          <>
            <p className="font-bold">
              Password reset emails aren't enabled yet.
            </p>
            <p className="mt-3">
              If you registered with Google, use Continue with Google. For email
              accounts, contact support for help.
            </p>
            <a
              className="ulink block mt-4 font-bold break-all"
              href={`mailto:${config?.support}`}
            >
              {config?.support}
            </a>
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block font-extrabold">
              {token ? "New password" : "Account email"}
              <input
                aria-label={token ? "New password" : "Account email"}
                className="input mt-2"
                type={token ? "password" : "email"}
                required
                minLength={token ? 8 : undefined}
                autoComplete={token ? "new-password" : "email"}
                value={token ? password : email}
                onChange={(e) =>
                  token ? setPassword(e.target.value) : setEmail(e.target.value)
                }
              />
            </label>
            {error && (
              <p role="alert" className="font-bold">
                {error}
              </p>
            )}
            <button className="btn" disabled={busy}>
              {busy ? "Working…" : token ? "Save password" : "Send reset link"}
            </button>
          </form>
        )}
        <Link to="/login" className="ulink block mt-6 font-bold">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
