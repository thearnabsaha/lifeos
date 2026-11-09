import { cn } from "@/lib/utils";

/** Page heading: mono label, h1, muted subtitle, optional action on the right. */
export function PageHeader({
  label,
  title,
  subtitle,
  action,
  className,
}: {
  label?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-3 lr-rise", className)}>
      <div className="min-w-0">
        {label && <p className="mono-label mb-1">{label}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Thermal-receipt card with scalloped top/bottom edges. */
export function ReceiptCard({ className, children, print }: { className?: string; children: React.ReactNode; print?: boolean }) {
  return (
    <div className={cn("receipt rounded-xl border px-5 py-6 drop-shadow-[0_6px_14px_rgba(0,0,0,0.06)] dark:drop-shadow-none", print && "lr-print", className)}>
      {children}
    </div>
  );
}

/** Dashed tear line. `notches` adds side punch-holes (bleeds to card edge; pass -mx to match card padding). */
export function Tear({ className }: { className?: string }) {
  return <div aria-hidden className={cn("tear my-4", className)} />;
}

/** Itemised receipt row: label left, value right, dotted leader. */
export function ReceiptRow({ label, value, className }: { label: React.ReactNode; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-2 py-1 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span aria-hidden className="flex-1 translate-y-[-3px] border-b border-dotted border-border" />
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

/** 2-4 cells with a mono label over a semibold value. */
export function StatStrip({
  items,
  className,
}: {
  items: { label: string; value: React.ReactNode; suffix?: string; tone?: "default" | "success" }[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-y-4", items.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3", className)}>
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <p className="mono-label">{i.label}</p>
          <p className={cn("mt-1 text-2xl font-semibold tabular-nums", i.tone === "success" && "text-success")}>
            {i.value}
            {i.suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{i.suffix}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Small mono uppercase section heading with an optional count. */
export function SectionLabel({ children, count, className }: { children: React.ReactNode; count?: number; className?: string }) {
  return (
    <p className={cn("mono-label mb-2 flex items-center gap-2 px-1", className)}>
      <span>{children}</span>
      {count !== undefined && <span className="tabular-nums text-foreground/70">· {String(count).padStart(2, "0")}</span>}
    </p>
  );
}

export function EmptyState({ label = "0.00 · 0 items", line, children }: { label?: string; line: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed px-6 py-10 text-center lr-rise">
      <p className="mono-label mb-2">{label}</p>
      <p className="text-sm text-muted-foreground">{line}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/** Bordered pill; filled black when active. */
export function Chip({
  active,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors active:translate-y-px",
        active ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-input/30",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Static mono chip/badge for row metadata. */
export function Tag({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-5 items-center gap-1 rounded-full border px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </span>
  );
}

export function Barcode({ className }: { className?: string }) {
  return <div aria-hidden className={cn("barcode", className)} />;
}
