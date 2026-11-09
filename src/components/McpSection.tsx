"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react";
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
      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px"
      aria-label="Copy"
    >
      {done ? <Check className="size-4 text-success" /> : <Copy className="size-4" strokeWidth={1.5} />}
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
    <div className="rounded-xl border bg-card p-4 shadow-[0_1px_3px_#0000000d]">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bot className="size-4" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Connect an AI assistant</p>
          <p className="text-xs text-muted-foreground">Grok Bot, Cursor or Claude can read and update your Time Arena and reminders.</p>
        </div>
      </div>

      <p className="mono-label mb-1.5 mt-4">Server URL</p>
      <div className="flex items-center gap-2 rounded-lg border bg-background py-1 pl-3 pr-1 dark:bg-input/30">
        <code className="flex-1 truncate font-mono text-xs select-text">{url}</code>
        <CopyBtn text={url} />
      </div>
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Auth · Authorization: Bearer los_…</p>

      {newKey && (
        <div className="mt-4 rounded-lg border border-success/40 bg-success/5 p-3 lr-rise">
          <p className="mono-label mb-1 text-success">New key · copy it now · shown once</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all font-mono text-xs select-text">{newKey}</code>
            <CopyBtn text={newKey} />
          </div>
        </div>
      )}

      {error && <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p>}

      <div className="tear my-4" />
      <p className="mono-label mb-1">API keys · {String(keys.length).padStart(2, "0")}</p>
      {keys.length > 0 ? (
        <ul className="divide-y">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center gap-3 py-2">
              <KeyRound className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{k.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {k.prefix}… · {k.lastUsedAt ? `used ${new Date(k.lastUsedAt).toLocaleDateString()}` : "never used"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => revoke(k.id)}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Revoke key"
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-2 text-sm text-muted-foreground">No keys yet.</p>
      )}

      <Button onClick={create} disabled={busy} className="mt-3 h-10 w-full rounded-lg">
        <Plus className="size-4" />
        {busy ? "Creating…" : "Create API key"}
      </Button>
    </div>
  );
}
