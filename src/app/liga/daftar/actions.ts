"use server";

import { z } from "zod";
import { normalizeWa } from "@/lib/booking";
import { getCategories } from "@/lib/liga";
import { guardGuest } from "@/lib/rate-limit";
import { insertTeamRegistration } from "@/lib/team-reg";
import { fireNotify, notifyAdminNewBooking, notifyCustomerBooking } from "@/lib/mailer";

type Result = { ok: boolean; error?: string };

const schema = z.object({
  teamName: z.string().trim().min(2, "Nama tim minimal 2 huruf").max(60),
  categoryId: z.string().trim().optional().or(z.literal("")),
  player1Name: z.string().trim().min(2, "Nama pemain 1 minimal 2 huruf").max(60),
  player2Name: z.string().trim().min(2, "Nama pemain 2 minimal 2 huruf").max(60),
  captainWa: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp tidak valid")
    .transform(normalizeWa)
    .refine((d) => d.length >= 10 && d.length <= 15, "Nomor WhatsApp tidak valid"),
  captainEmail: z
    .string()
    .trim()
    .email("Email tidak valid")
    .optional()
    .or(z.literal("")),
  note: z.string().trim().max(280).optional().or(z.literal("")),
});

export async function submitTeamRegistrationAction(raw: unknown): Promise<Result> {
  const guard = await guardGuest("liga-daftar");
  if (!guard.ok) return { ok: false, error: guard.error };

  const p = schema.safeParse(raw);
  if (!p.success) {
    return { ok: false, error: p.error.issues[0]?.message ?? "Data tidak valid" };
  }

  // Validasi kategori (jika dipilih) + snapshot label dari sumber tepercaya.
  let categoryId: string | null = null;
  let categoryLabel: string | null = null;
  if (p.data.categoryId) {
    const cats = await getCategories();
    const cat = cats.find((c) => c.id === p.data.categoryId);
    if (!cat) return { ok: false, error: "Kategori tidak valid" };
    categoryId = cat.id;
    categoryLabel = cat.name;
  }

  const captainEmail = p.data.captainEmail || null;
  await insertTeamRegistration({
    teamName: p.data.teamName,
    categoryId,
    categoryLabel,
    player1Name: p.data.player1Name,
    player2Name: p.data.player2Name,
    captainWa: p.data.captainWa,
    captainEmail,
    note: p.data.note || null,
  });

  const detail = `${p.data.player1Name} & ${p.data.player2Name}${categoryLabel ? ` · ${categoryLabel}` : ""}`;
  fireNotify(() =>
    notifyAdminNewBooking({
      jenis: "Pendaftaran Tim Liga",
      nama: p.data.teamName,
      wa: p.data.captainWa,
      detail,
      invoicePath: "/admin/liga/pendaftaran",
    }),
  );
  fireNotify(() =>
    notifyCustomerBooking(captainEmail, {
      jenis: "Pendaftaran Tim Liga",
      detail: `Tim ${p.data.teamName} · ${detail}`,
    }),
  );

  return { ok: true };
}
