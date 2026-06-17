import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "accent" | "alert";
}) {
  const tones = {
    default: "text-brand bg-brand/10",
    accent: "text-accent bg-accent/10",
    alert: "text-amber-700 bg-amber-100",
  } as const;

  const body = (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border bg-card p-4 transition sm:p-5",
        href && "hover:border-brand/50 hover:shadow-sm",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          tones[tone],
        )}
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none tracking-tight">
          {value}
        </div>
        <div className="mt-1.5 truncate text-sm font-medium text-muted">
          {label}
        </div>
        {hint ? (
          <div className="mt-0.5 truncate text-xs text-muted/80">{hint}</div>
        ) : null}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}
