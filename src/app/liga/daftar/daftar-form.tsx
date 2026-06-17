"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitTeamRegistrationAction } from "./actions";

type CategoryOption = { id: string; name: string };

const inputClass =
  "w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function DaftarForm({ categories }: { categories: CategoryOption[] }) {
  const [teamName, setTeamName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [captainWa, setCaptainWa] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitTeamRegistrationAction({
      teamName,
      categoryId,
      player1Name,
      player2Name,
      captainWa,
      captainEmail,
      note,
    });
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Gagal mengirim pendaftaran");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-brand" strokeWidth={1.5} />
        <h2 className="mt-3 text-lg font-semibold">Pendaftaran terkirim!</h2>
        <p className="mt-1.5 text-sm text-muted">
          Admin akan hubungi via WhatsApp untuk konfirmasi & deposit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border bg-card p-5">
      <div>
        <label htmlFor="teamName" className="mb-1 block text-sm font-medium">
          Nama Tim
        </label>
        <input
          id="teamName"
          required
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className={inputClass}
          placeholder="Mis. Smash Bros"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
          Kategori <span className="text-muted">(opsional)</span>
        </label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputClass}
        >
          <option value="">Belum tentu / biar admin tentukan</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="player1Name" className="mb-1 block text-sm font-medium">
            Nama Pemain 1
          </label>
          <input
            id="player1Name"
            required
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            className={inputClass}
            placeholder="Nama lengkap"
          />
        </div>
        <div>
          <label htmlFor="player2Name" className="mb-1 block text-sm font-medium">
            Nama Pemain 2
          </label>
          <input
            id="player2Name"
            required
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            className={inputClass}
            placeholder="Nama lengkap"
          />
        </div>
      </div>

      <div>
        <label htmlFor="captainWa" className="mb-1 block text-sm font-medium">
          No WhatsApp Kapten
        </label>
        <input
          id="captainWa"
          required
          inputMode="numeric"
          value={captainWa}
          onChange={(e) => setCaptainWa(e.target.value)}
          className={inputClass}
          placeholder="08xxxxxxxxxx"
        />
      </div>

      <div>
        <label htmlFor="captainEmail" className="mb-1 block text-sm font-medium">
          Email Kapten <span className="text-muted">(opsional)</span>
        </label>
        <input
          id="captainEmail"
          type="email"
          value={captainEmail}
          onChange={(e) => setCaptainEmail(e.target.value)}
          className={inputClass}
          placeholder="email@contoh.com"
        />
        <p className="mt-1 text-xs text-muted">buat terima konfirmasi</p>
      </div>

      <div>
        <label htmlFor="note" className="mb-1 block text-sm font-medium">
          Catatan <span className="text-muted">(opsional)</span>
        </label>
        <input
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputClass}
          placeholder="Mis. preferensi jadwal main"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent px-4 py-3.5 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
      </button>
      <p className="text-center text-xs text-muted">
        Deposit Rp100.000 diatur via WhatsApp setelah pendaftaran disetujui admin.
      </p>
    </form>
  );
}
