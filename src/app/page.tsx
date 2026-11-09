import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bot,
  Clock,
  Download,
  Flame,
  MoonStar,
  Paperclip,
  Plus,
  Share,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LiveRing } from "@/components/landing/LiveRing";
import { HeroCtas } from "@/components/landing/HeroCtas";
import { LandingEffects } from "@/components/landing/LandingEffects";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { Faq, FAQS } from "@/components/landing/Faq";
import { Logo } from "@/components/Logo";
import { HourRing } from "@/components/HourRing";
import { ReceiptRow, Tag } from "@/components/receipt";
import { SITE_URL } from "@/lib/site";

const TITLE = "LifeOS: One line. Every hour.";
const DESCRIPTION =
  "LifeOS is a free, ad-free personal time log. Write one line for every hour of your day, see it add up on a daily receipt, keep reminders, and let AI assistants read and log your day over MCP. Installs on iPhone, works offline.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "LifeOS",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const MCP_TOOLS = [
  "get_day",
  "set_slots",
  "get_daily_summary",
  "list_reminders",
  "create_reminder",
  "update_reminder",
  "complete_reminder",
  "delete_reminder",
];

function SectionHead({ label, title, sub, center }: { label: string; title: React.ReactNode; sub?: React.ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="mono-label">{label}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-[2.6rem] sm:leading-[1.08]">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">{sub}</p>}
    </div>
  );
}

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "LifeOS",
      url: SITE_URL,
      applicationCategory: "ProductivityApplication",
      operatingSystem: "iOS, Web",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div id="landing" className="fixed inset-0 overflow-y-auto overflow-x-hidden scroll-smooth bg-background select-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingEffects />
      <LandingNav />

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="lp-grid pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-28 lg:pt-24">
            <div className="lp-in">
              <a
                href="#mcp"
                className="group inline-flex items-center gap-2 rounded-full border bg-card/80 py-1 pl-1 pr-3 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground dark:bg-input/30"
              >
                <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">New</span>
                Your AI can now log your day over MCP
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </a>
              <h1 className="mt-6 text-[3.5rem] font-semibold leading-[0.98] tracking-[-0.045em] text-balance sm:text-7xl lg:text-[5.4rem]">
                One line.
                <br />
                <span className="text-muted-foreground/45">Every hour.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
                LifeOS is a 24-slot log for your day. Write what you did each hour, watch it add up on a clean daily receipt, and finally see where the time goes.
              </p>
              <HeroCtas className="mt-8" />
              <ul className="mt-8 grid max-w-md grid-cols-2 gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:flex sm:max-w-none sm:flex-wrap">
                {["Free forever", "No ads", "Offline-first", "iPhone ready"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-success" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lp-in relative mx-auto w-full max-w-[460px]" style={{ animationDelay: "120ms" }}>
              <div aria-hidden className="lp-halo absolute inset-[12%] rounded-full" />
              <LiveRing className="relative" />
            </div>
          </div>
        </section>

        {/* ── Stat strip ───────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="reveal grid grid-cols-2 overflow-hidden rounded-xl border bg-card shadow-[0_1px_3px_#0000000d] sm:grid-cols-4">
            {[
              { l: "Slots a day", v: "24", s: "" },
              { l: "Lines per hour", v: "1", s: "" },
              { l: "MCP tools", v: "8", s: "" },
              { l: "Price", v: "$0", s: "/forever" },
            ].map((x, i) => (
              <div key={x.l} className={`px-5 py-6 sm:px-7 ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""}`}>
                <p className="mono-label">{x.l}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">
                  {x.v}
                  {x.s && <span className="ml-1 text-sm font-normal tracking-normal text-muted-foreground">{x.s}</span>}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Product: the Today screen ─────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="reveal order-2 lg:order-1">
              <div className="relative">
                <div aria-hidden className="lp-halo absolute inset-x-[10%] inset-y-[18%] rounded-full" />
                <PhoneMockup className="relative" />
              </div>
            </div>
            <div className="reveal order-1 lg:order-2">
              <SectionHead
                label="The Today screen"
                title={<>Your day, itemised.</>}
                sub="Open the app and you land on now. Every hour is a row; the current one wears a NOW badge. Type a line, hit Return, and you're on the next hour."
              />
              <div className="mt-8 rounded-xl border bg-card px-5 py-5">
                <div className="flex items-center justify-between">
                  <p className="mono-label">Time Arena · Receipt</p>
                  <p className="mono-label">#261109</p>
                </div>
                <div className="tear my-4" />
                <ReceiptRow label="Hours logged" value="8 / 24" />
                <ReceiptRow label="So far today" value="8 / 15" />
                <ReceiptRow label="Empty" value="16h" />
                <ReceiptRow label="Longest streak" value="8h" />
                <div className="tear my-4" />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold">Day complete</span>
                  <span className="font-mono text-lg font-semibold tabular-nums text-success">33%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature grid ─────────────────────────────────── */}
        <section id="features" className="scroll-mt-20 border-y bg-muted/30 py-24 sm:py-32 dark:bg-card/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="reveal">
              <SectionHead
                label="Features · 06"
                title="Small on purpose. Everything you need."
                sub="No feeds, no gamified fluff. A log, a receipt, reminders, and a door for your AI."
              />
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Feature icon={Clock} label="Time Arena" title="24 hourly slots" body="One line per hour, saved as you type. Return jumps to the next hour. Pick any date to look back.">
                <div className="grid grid-cols-24 gap-[3px]">
                  {Array.from({ length: 24 }, (_, h) => (
                    <span key={h} className={`h-4 rounded-[2px] ${h >= 6 && h < 14 ? "bg-foreground" : h === 14 ? "bg-success/80" : "bg-muted"}`} />
                  ))}
                </div>
              </Feature>
              <Feature icon={Flame} label="Daily receipt" title="Progress you can read" body="Hours logged out of 24, how many hours of today you've covered so far, and your longest streak.">
                <div className="flex items-end gap-6">
                  <p className="text-3xl font-semibold tabular-nums">8<span className="text-sm font-normal text-muted-foreground">/24</span></p>
                  <p className="pb-1 font-mono text-xs text-success">STREAK 8H</p>
                </div>
              </Feature>
              <Feature icon={Bell} label="Reminders" title="Priorities and due dates" body="Quick reminders with high, medium or low priority and due-date chips. Overdue ones call themselves out.">
                <div className="flex flex-wrap gap-1.5">
                  <Tag><span className="size-1.5 rounded-full bg-destructive" /> High</Tag>
                  <Tag>Today · Nov 9</Tag>
                  <Tag className="border-destructive/40 text-destructive">Overdue · Nov 7</Tag>
                </div>
              </Feature>
              <Feature icon={Paperclip} label="Attachments" title="Files on reminders" body="Attach photos, voice notes or documents to any reminder, so the context lives with the task." />
              <Feature icon={Download} label="CSV export" title="Your data, one tap away" body="Export your full Time Arena history as a CSV that opens in Excel, Numbers or Google Sheets." />
              <Feature icon={MoonStar} label="Light + dark" title="Easy on the eyes" body="Warm paper by day, true black by night. Follows your system, or pick one yourself." />
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
          <div className="reveal">
            <SectionHead label="How it works" title="Three steps. Then it's a habit." />
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              { t: "Create your account", b: "Sign up with a username or email. It takes ten seconds and costs nothing." },
              { t: "Write one line an hour", b: "Whenever you check in, fill the hours since last time. The NOW badge shows where you are." },
              { t: "Read your day back", b: "Your receipt totals the day. Scroll back through dates, export to CSV, or ask your AI to summarise it." },
            ].map((s, i) => (
              <li key={s.t} className="reveal group relative rounded-xl border bg-card p-6 transition-transform hover:-translate-y-0.5" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Step {String(i + 1).padStart(2, "0")} · of 03
                  </p>
                  <span className="font-mono text-5xl font-semibold leading-none tracking-tighter text-muted-foreground/15 transition-colors group-hover:text-success/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="tear my-5" />
                <h3 className="text-lg font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.b}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── MCP / AI ─────────────────────────────────────── */}
        <section id="mcp" className="scroll-mt-20 px-4 sm:px-6">
          <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#0a0a0a] px-5 py-14 text-neutral-100 sm:px-12 sm:py-20 dark:border dark:border-white/10 dark:bg-[#0e0e0e]">
            <div aria-hidden className="lp-grid-dark pointer-events-none absolute inset-0" />
            <div className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">AI · Model Context Protocol</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-[2.6rem] sm:leading-[1.08]">
                  Let your AI keep the log.
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-400">
                  LifeOS ships its own MCP server. Give an assistant like Grok Bot your personal key and it can read your day, fill in hours and manage reminders for you.
                </p>
                <div className="mt-7 flex flex-wrap gap-1.5">
                  {MCP_TOOLS.map((t) => (
                    <span key={t} className="rounded-full border border-white/12 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-neutral-300">
                      {t}
                    </span>
                  ))}
                </div>
                <ul className="mt-7 space-y-2 text-sm text-neutral-400">
                  <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#00d294]" /> Keys are created in Settings and shown once</li>
                  <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#00d294]" /> Revoke any key, any time</li>
                  <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#00d294]" /> Scoped to your own account</li>
                </ul>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <Bot className="size-3.5 text-neutral-400" strokeWidth={1.5} />
                  <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">mcp.json</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#00d294]">
                    <span className="size-1.5 rounded-full bg-[#00d294]" /> Streamable HTTP
                  </span>
                </div>
                <dl className="space-y-2 border-b border-dashed border-white/10 px-5 py-4 font-mono text-[12px]">
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 uppercase tracking-widest text-neutral-500">Url</dt>
                    <dd className="min-w-0 break-all text-neutral-200">{SITE_URL}/api/mcp</dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-16 shrink-0 uppercase tracking-widest text-neutral-500">Auth</dt>
                    <dd className="text-neutral-200">
                      Authorization: Bearer <span className="text-[#00d294]">los_…</span>
                    </dd>
                  </div>
                </dl>
                <pre className="overflow-x-auto px-5 py-5 font-mono text-[11px] leading-[1.75] sm:text-[12.5px]">
                  <code>
                    <span className="text-neutral-500">{"{"}</span>{"\n"}
                    {"  "}<span className="text-neutral-300">&quot;mcpServers&quot;</span><span className="text-neutral-500">: {"{"}</span>{"\n"}
                    {"    "}<span className="text-neutral-300">&quot;lifeos&quot;</span><span className="text-neutral-500">: {"{"}</span>{"\n"}
                    {"      "}<span className="text-neutral-500">&quot;url&quot;:</span> <span className="text-[#00d294]">&quot;{SITE_URL}/api/mcp&quot;</span><span className="text-neutral-500">,</span>{"\n"}
                    {"      "}<span className="text-neutral-500">&quot;headers&quot;: {"{"}</span>{"\n"}
                    {"        "}<span className="text-neutral-500">&quot;Authorization&quot;:</span> <span className="text-[#00d294]">&quot;Bearer los_…&quot;</span>{"\n"}
                    {"      "}<span className="text-neutral-500">{"}"}</span>{"\n"}
                    {"    "}<span className="text-neutral-500">{"}"}</span>{"\n"}
                    {"  "}<span className="text-neutral-500">{"}"}</span>{"\n"}
                    <span className="text-neutral-500">{"}"}</span>
                  </code>
                </pre>
                <div className="border-t border-dashed border-white/10 px-5 py-4 font-mono text-[12px] leading-relaxed">
                  <p className="text-neutral-500">
                    <span className="text-neutral-600">&gt;</span> “Log 14:00 as <span className="text-neutral-300">design review</span> and remind me to send the deck tomorrow.”
                  </p>
                  <p className="mt-1.5 text-[#00d294]">✓ set_slots · create_reminder</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Install on iPhone ────────────────────────────── */}
        <section id="install" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div className="reveal">
              <SectionHead
                label="Install on iPhone"
                title="Feels native. Skips the App Store."
                sub="LifeOS is a progressive web app. Add it to your Home Screen and it opens full-screen with its own icon and launch animation, and loads even with no signal."
              />
              <div className="mt-8 flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-[18px] bg-[#0a0a0a] text-white shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                  <HourRing now={14} className="size-12" />
                </div>
                <div>
                  <p className="font-semibold">LifeOS</p>
                  <p className="mono-label mt-0.5">Home Screen · Offline-ready</p>
                </div>
              </div>
            </div>
            <ol className="grid gap-3">
              {[
                { icon: Smartphone, t: "Open LifeOS in Safari", b: "Visit this page on your iPhone." },
                { icon: Share, t: "Tap Share", b: "The square with the arrow, in Safari's toolbar." },
                { icon: Plus, t: "Add to Home Screen", b: "Then open LifeOS from its new icon." },
              ].map((s, i) => (
                <li key={s.t} className="reveal flex items-center gap-4 rounded-xl border bg-card px-4 py-4 sm:px-5" style={{ transitionDelay: `${i * 70}ms` }}>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <s.icon className="size-[18px]" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{s.t}</p>
                    <p className="text-sm text-muted-foreground">{s.b}</p>
                  </div>
                </li>
              ))}
              <li className="reveal flex items-center gap-2 px-1 pt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <WifiOff className="size-3.5" strokeWidth={1.5} /> Cached on device · syncs when online
              </li>
            </ol>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-24 sm:px-6 sm:pb-32">
          <div className="reveal">
            <SectionHead label={`FAQ · ${String(FAQS.length).padStart(2, "0")}`} title="Questions, answered." center />
          </div>
          <div className="reveal mt-10">
            <Faq />
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="px-4 pb-24 sm:px-6">
          <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center sm:py-24">
            <div aria-hidden className="lp-grid pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative">
              <HourRing now={14} className="mx-auto size-24 text-foreground" />
              <h2 className="mx-auto mt-8 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">
                Your next hour starts now.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">Make it the first line. It&apos;s free, it&apos;s yours, and it takes ten seconds.</p>
              <HeroCtas center className="mt-8" />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">One line. Every hour. A personal time log with reminders and an MCP server.</p>
          </div>
          <div>
            <p className="mono-label">Product</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
              <li><a href="#how" className="text-muted-foreground hover:text-foreground">How it works</a></li>
              <li><a href="#mcp" className="text-muted-foreground hover:text-foreground">AI / MCP</a></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="mono-label">App</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/signup" className="text-muted-foreground hover:text-foreground">Create account</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Log in</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Open app ↗</Link></li>
              <li><a href="#install" className="text-muted-foreground hover:text-foreground">Install on iPhone</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-dashed px-4 py-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} LifeOS</span>
          <span>Free · No ads · Offline-first</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon: Icon,
  label,
  title,
  body,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="reveal group flex flex-col rounded-xl border bg-card p-6 shadow-[0_1px_3px_#0000000d] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_#00000026]">
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-lg border bg-background transition-colors group-hover:border-foreground/30">
          <Icon className="size-[18px]" strokeWidth={1.5} />
        </span>
        <span className="mono-label">{label}</span>
      </div>
      <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {children && (
        <div className="mt-auto pt-5">
          <div className="tear mb-4" />
          {children}
        </div>
      )}
    </div>
  );
}
