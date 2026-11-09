export const FAQS: { q: string; a: string }[] = [
  {
    q: "What exactly do I write?",
    a: "One line for each hour of your day. “Deep work: Q4 plan”, “Gym”, “Lunch with Riya”. It saves as you type, and Return jumps you to the next hour.",
  },
  {
    q: "Is it really free?",
    a: "Yes. LifeOS is a personal tool. No ads, no paid tier, no upsell.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. LifeOS is an offline-first web app. Your day is cached on the device, so it opens instantly with no signal, and unsynced edits are kept and sent to the server once you’re back online.",
  },
  {
    q: "Can I get my data out?",
    a: "Any time. Settings has a one-tap CSV export of your full Time Arena history that opens in Excel, Numbers or Google Sheets.",
  },
  {
    q: "How does the AI connection work?",
    a: "LifeOS runs an MCP server. Create a personal key in Settings, add the endpoint to an MCP-capable assistant such as Grok Bot, and it can read and log your hours and manage your reminders. Keys are shown once and can be revoked at any time.",
  },
  {
    q: "Do I need the App Store?",
    a: "No. Open LifeOS in Safari, tap Share, then Add to Home Screen. It launches full-screen with its own icon and splash, like a native app. It also runs in any modern desktop browser.",
  },
];

export function Faq() {
  return (
    <div className="divide-y overflow-hidden rounded-xl border bg-card">
      {FAQS.map((f, i) => (
        <details key={f.q} className="group" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-[15px] font-medium transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1">{f.q}</span>
            <span
              aria-hidden
              className="relative size-4 shrink-0 text-muted-foreground before:absolute before:left-0 before:top-1/2 before:h-px before:w-4 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-4 after:w-px after:bg-current after:transition-transform group-open:after:scale-y-0"
            />
          </summary>
          <p className="px-5 pb-5 pl-[3.25rem] text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
