"use client";

import { useState } from "react";
import { toast } from "sonner";

// Upload gambar ke /api/upload (R2 / mock). Set URL hasil ke hidden input `name`
// supaya ikut terkirim di form action.
export function ImageUpload({
  name,
  prefix,
  defaultUrl,
  label = "Upload foto",
  onUploaded,
}: {
  name: string;
  prefix: string;
  defaultUrl?: string | null;
  label?: string;
  onUploaded?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("prefix", prefix);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) {
        toast.error(j.error ?? "Upload gagal");
        return;
      }
      setUrl(j.url);
      onUploaded?.(j.url);
      toast.success("Foto diupload");
    } catch {
      toast.error("Upload gagal");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={url} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-12 w-12 rounded-full border object-cover" />
      ) : (
        <div className="h-12 w-12 rounded-full border bg-cream" />
      )}
      <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40">
        {busy ? "Mengupload..." : label}
        <input
          type="file"
          accept="image/*"
          onChange={onPick}
          disabled={busy}
          className="hidden"
        />
      </label>
    </div>
  );
}
