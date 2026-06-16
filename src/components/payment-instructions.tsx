import type { Venue } from "@/db/schema";

export function PaymentInstructions({
  venue,
  waText,
}: {
  venue: Venue;
  waText: string;
}) {
  const waLink = venue.whatsapp
    ? `https://wa.me/${venue.whatsapp}?text=${encodeURIComponent(waText)}`
    : null;
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h2 className="font-semibold">Instruksi Pembayaran</h2>
      {venue.bankNumber ? (
        <div className="mt-3 rounded-xl bg-cream/40 p-4 text-sm">
          <p className="text-muted">Transfer Bank</p>
          <p className="mt-1 text-lg font-bold">
            {venue.bankName} {venue.bankNumber}
          </p>
          <p className="text-muted">a.n. {venue.bankHolder}</p>
        </div>
      ) : null}
      {venue.paymentNotes ? (
        <p className="mt-3 text-sm text-muted">{venue.paymentNotes}</p>
      ) : null}
      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block w-full rounded-full bg-accent px-4 py-3.5 text-center font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Konfirmasi via WhatsApp
        </a>
      ) : null}
    </div>
  );
}
