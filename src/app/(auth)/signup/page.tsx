"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/AuthShell";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  type FieldErrors,
  validateSignupFields,
} from "@/lib/validation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore((s) => s.signup);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const next = validateSignupFields(email, password, name);
    setFieldErrors(next);
    if (next.name || next.email || next.password) return;

    setLoading(true);
    try {
      await signup(email, password, name.trim());
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      label="Receipt · New account"
      title="Create your account"
      subtitle="Start organizing your life with LifeOS"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:opacity-70">
            Sign in
          </Link>
        </>
      }
    >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive lr-rise">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="mono-label" htmlFor="signup-name">Name</label>
            <Input
              id="signup-name"
              className="h-11"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((f) => ({ ...f, name: undefined }));
              }}
              aria-invalid={!!fieldErrors.name}
              autoComplete="name"
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="mono-label" htmlFor="signup-email">Email</label>
            <Input
              id="signup-email"
              className="h-11"
              type="email"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
              }}
              aria-invalid={!!fieldErrors.email}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="mono-label" htmlFor="signup-password">Password</label>
            <Input
              id="signup-password"
              className="h-11"
              type="password"
              placeholder="Min 8 characters · letter + number"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
              }}
              aria-invalid={!!fieldErrors.password}
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="group mt-2 h-11 w-full rounded-lg" disabled={loading}>
            {loading ? (<><Loader2 className="size-4 animate-spin" />Creating account...</>) : (<>Create account<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>)}
          </Button>
        </form>
    </AuthShell>
  );
}
