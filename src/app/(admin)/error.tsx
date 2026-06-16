"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold">Terjadi kesalahan</h2>
      <p className="mt-1 text-sm text-muted">
        {error.message || "Halaman gagal dimuat."}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg"
      >
        Coba lagi
      </button>
    </div>
  );
}
