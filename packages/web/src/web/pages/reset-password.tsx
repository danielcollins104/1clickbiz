import { useState } from "react";
import { Link, useSearch } from "wouter";
import { authClient } from "../lib/auth";
import {
  confirmFirebasePasswordReset,
  sendFirebasePasswordReset,
} from "../lib/firebase";
import { useLaunchConfig } from "../queries/launch";

export default function ResetPasswordPage() {
  const searchParams = new URLSearchParams(useSearch());
  const token = searchParams.get("token");
  const oobCode = searchParams.get("oobCode");
  const resetToken = oobCode || token;
  const { data: config } = useLaunchConfig();
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
      // 1. Try Firebase Auth password reset first
      if (oobCode) {
        await confirmFirebasePasswordReset(oobCode, password);
        setDone(true);
        return;
      }
      if (!resetToken) {
        try {
          await sendFirebasePasswordReset(email);
          setDone(true);
          return;
        } catch (fbErr: any) {
          // If Firebase password reset fails due to invalid email, surface it
          if (fbErr?.code === "auth/invalid-email") {
            setError("Please enter a valid email address.");
            return;
          }
          // Otherwise fall back to backend resetPassword if configured
        }
      }

      // 2. Fallback to backend authClient
      if (config?.emailEnabled || token) {
        const res = token
          ? await authClient.resetPassword({ token, newPassword: password })
          : await authClient.requestPasswordReset({
              email,
              redirectTo: `${window.location.origin}/reset-password`,
            });
        if (res.error) {
          setError(res.error.message ?? "That did not work. Try again.");
        } else {
          setDone(true);
        }
        return;
      }

      // Even on static hosting, confirm request so we don't leak account existence
      setDone(true);
    } catch {
      setError("Could not connect. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="display text-5xl">
        {resetToken ? "New password." : "Forgot password?"}
      </h1>
      <div className="card bg-paper mt-8 p-6">
        {done ? (
          <output className="font-bold">
            {resetToken
              ? "Password changed. Sign in with your new password."
              : "If this email has an account, you will receive a password reset link shortly."}
          </output>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block font-extrabold">
              {resetToken ? "New password" : "Account email"}
              <input
                aria-label={resetToken ? "New password" : "Account email"}
                className="input mt-2"
                type={resetToken ? "password" : "email"}
                required
                minLength={resetToken ? 8 : undefined}
                autoComplete={resetToken ? "new-password" : "email"}
                placeholder={resetToken ? "At least 8 characters" : "you@business.com"}
                value={resetToken ? password : email}
                onChange={(e) =>
                  resetToken ? setPassword(e.target.value) : setEmail(e.target.value)
                }
              />
            </label>
            {error && (
              <p role="alert" className="b3 bg-sun p-3 text-sm font-extrabold">
                {error}
              </p>
            )}
            <button className="btn" disabled={busy}>
              {busy
                ? "Working…"
                : resetToken
                  ? "Save password"
                  : "Send reset link"}
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
