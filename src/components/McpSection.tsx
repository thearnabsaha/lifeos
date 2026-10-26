"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Key = { id: string; name: string; prefix: string; createdAt: string; lastUsedAt?: string | null };

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Request failed: ${res.status}`);
  return res.json();
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900/5 text-zinc-600 transition-all active:scale-90 hover:bg-accent/15 hover:text-accent dark:bg-white/10 dark:text-zinc-300"
      aria-label="Copy"
    >
      {done ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export function McpSection() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");

  const load = useCallback(async () => {
    try { setKeys((await call<{ keys: Key[] }>("/api/keys")).keys); } catch (e) { setError((e as Error).message); }
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    load();
  }, [load]);

  const url = `${origin}/api/mcp`;

  async function create() {
    setBusy(true); setError("");
    try {
      const r = await call<{ key: Key & { key: string } }>("/api/keys", { method: "POST", body: JSON.stringify({ name: `Key ${new Date().toLocaleDateString()}` }) });
      setNewKey(r.key.key);
      await load();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this key? Connected assistants will lose access.")) return;
    try { await call(`/api/keys/${id}`, { method: "DELETE" }); await load(); } catch (e) { setError((e as Error).message); }
  }

  return (
    <Card className="relative overflow-hidden p-4">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative mb-2 flex items-center gap-2">
        <div className="accent-gradient flex h-8 w-8 items-center justify-center rounded-xl">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">MCP / AI assistant</h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Connect Grok Bot, Cursor or Claude to your LifeOS</p>
        </div>
      </div>

      <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Server URL</p>
      <div className="flex items-center gap-2 rounded-2xl border border-zinc-900/10 bg-white/60 py-1.5 pl-3 pr-1.5 dark:border-white/10 dark:bg-white/5">
        <code className="flex-1 truncate font-mono text-xs select-text">{url}</code>
        <CopyBtn text={url} />
      </div>

      {newKey && (
        <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 animate-fade-in">
          <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">New key — copy it now, it won&apos;t be shown again</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all font-mono text-xs select-text">{newKey}</code>
            <CopyBtn text={newKey} />
          </div>
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            Header: <code className="font-mono">Authorization: Bearer {newKey.slice(0, 10)}…</code>
          </p>
        </div>
      )}

      {error && <p className="mt-3 rounded-xl bg-red-500/10 p-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      {keys.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center gap-2 rounded-2xl bg-zinc-900/[0.03] px-3 py-2 dark:bg-white/[0.04]">
              <KeyRound className="h-4 w-4 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-900 dark:text-white">{k.name}</p>
                <p className="font-mono text-[10px] text-zinc-500">
                  {k.prefix}… · {k.lastUsedAt ? `used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "never used"}
                </p>
              </div>
              <button onClick={() => revoke(k.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-500 active:scale-90" aria-label="Revoke key">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={create} disabled={busy} className="mt-3 w-full gap-2">
        <Plus className="h-4 w-4" />
        {busy ? "Creating…" : "Create API key"}
      </Button>
    </Card>
  );
}
