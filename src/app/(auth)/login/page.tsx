"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/AuthShell";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      label="Receipt · Sign in"
      title="Welcome back"
      subtitle="Sign in to your LifeOS account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-4 hover:opacity-70">
            Sign up
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" size="lg" className="group mt-2 h-11 w-full rounded-lg" disabled={loading}>
            {loading ? (<><Loader2 className="size-4 animate-spin" />Signing in...</>) : (<>Sign in<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></>)}
          </Button>
        </form>
    </AuthShell>
  );
}
