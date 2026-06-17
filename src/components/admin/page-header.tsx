import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Header konsisten tiap halaman admin.
 * `title` = teks utama, `accent` = potongan miring serif (opsional), `sub` = subjudul.
 * `action` = slot tombol kanan (mis. "Tambah"). `back` = link balik (mis. ke hub Liga).
 */
export function AdminPageHeader({
  title,
  accent,
  sub,
  action,
  back,
}: {
  title: string;
  accent?: string;
  sub?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 border-b pb-5">
      {back ? (
        <Link
          href={back.href}
          className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-brand"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
            {accent ? (
              <>
                {" "}
                <span
                  className="text-accent"
                  style={{
                    fontFamily: "var(--font-instrument), serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  {accent}
                </span>
              </>
            ) : null}
          </h1>
          {sub ? <p className="mt-1.5 text-sm text-muted">{sub}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
