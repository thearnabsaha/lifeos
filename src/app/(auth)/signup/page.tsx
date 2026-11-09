"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/AuthShell";
import { ArrowRight, Loader2 } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore((s) => s.signup);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name || undefined);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive lr-rise">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="mono-label">Name</label>
            <Input
              className="h-11"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="mono-label">Email</label>
            <Input
              className="h-11"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <label className="mono-label">Password</label>
            <Input
              className="h-11"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" size="lg" className="group mt-2 h-11 w-full rounded-lg" disabled={loading}>
            {loading ? (<><Loader2 className="size-4 animate-spin" />Creating account...</>) : (<>Create account<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>)}
          </Button>
        </form>
    </AuthShell>
  );
}
