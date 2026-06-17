"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, rupiah } from "@/lib/utils";
import { joinMembershipAction } from "./actions";

type Plan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  benefits: string[];
};

export function PlanList({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(planId: string) {
    setSubmitting(true);
    const res = await joinMembershipAction({
      planId,
      customerName: name,
      customerWa: wa,
      customerEmail: email,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    router.push(`/membership/${res.code}`);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {plans.map((p, i) => {
        const featured = i === 1;
        return (
          <div
            key={p.id}
            className={cn(
              "flex flex-col rounded-2xl border bg-card p-6",
              featured && "border-brand ring-2 ring-brand/15",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{p.name}</h3>
              {featured ? (
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Populer
                </span>
              ) : null}
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-brand">{rupiah(p.price)}</span>
              <span className="text-sm text-muted"> / {p.durationDays} hari</span>
            </div>
            <ul className="mt-4 flex-1 space-y-2">
              {p.benefits.map((b, j) => (
                <li key={j} className="flex gap-2 text-sm text-muted">
                  <span className="text-accent">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {openId === p.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(p.id);
                }}
                className="mt-5 space-y-3 border-t pt-4"
              >
                <input
                  required
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <input
                  required
                  inputMode="numeric"
                  placeholder="08xxxxxxxxxx"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <div>
                  <input
                    type="email"
                    required
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <p className="mt-1 text-xs text-muted">
                    Email · konfirmasi dikirim ke sini
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-accent px-4 py-3 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? "Memproses..." : "Daftar"}
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setOpenId(p.id);
                  setName("");
                  setWa("");
                  setEmail("");
                }}
                className={cn(
                  "mt-5 w-full rounded-full px-4 py-3 font-semibold transition hover:opacity-90",
                  featured
                    ? "bg-accent text-white shadow-sm"
                    : "bg-brand text-brand-fg",
                )}
              >
                Pilih {p.name}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
