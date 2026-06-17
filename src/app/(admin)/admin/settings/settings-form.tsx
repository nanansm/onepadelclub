"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUpload } from "@/components/image-upload";
import type {
  Settings,
  SchemeItem,
  RuleItem,
  FacilityItem,
  GalleryItem,
} from "@/lib/settings";
import { FACILITY_ICON_OPTIONS, facilityIcon } from "@/lib/facility-icons";
import { updateSettingsAction, sendTestEmailAction } from "./actions";

const inputClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const labelClass = "text-sm font-medium";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="mb-3 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Identitas & kontak
  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [tiktok, setTiktok] = useState(settings.tiktok);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [mapsUrl, setMapsUrl] = useState(settings.mapsUrl);

  // Jam
  const [openHour, setOpenHour] = useState(String(settings.openHour));
  const [closeHour, setCloseHour] = useState(String(settings.closeHour));

  // Pembayaran
  const [bankName, setBankName] = useState(settings.bankName);
  const [bankNumber, setBankNumber] = useState(settings.bankNumber);
  const [bankHolder, setBankHolder] = useState(settings.bankHolder);
  const [paymentNotes, setPaymentNotes] = useState(settings.paymentNotes);
  const [qrisUrl, setQrisUrl] = useState(settings.qrisUrl);

  // Konten landing
  const [heroBadge, setHeroBadge] = useState(settings.heroBadge);
  const [heroHeadline, setHeroHeadline] = useState(settings.heroHeadline);
  const [heroSubcopy, setHeroSubcopy] = useState(settings.heroSubcopy);
  const [ligaHeadline, setLigaHeadline] = useState(settings.ligaHeadline);
  const [ligaBody, setLigaBody] = useState(settings.ligaBody);

  // Kartu & aturan
  const [schemes, setSchemes] = useState<SchemeItem[]>(settings.schemes);
  const [rules, setRules] = useState<RuleItem[]>(settings.rules);

  // Fasilitas
  const [facilities, setFacilities] = useState<FacilityItem[]>(
    settings.facilities,
  );

  // Galeri
  const [gallery, setGallery] = useState<GalleryItem[]>(settings.gallery);

  // Branding
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [heroImageUrl, setHeroImageUrl] = useState(settings.heroImageUrl);
  const [ogImageUrl, setOgImageUrl] = useState(settings.ogImageUrl);
  const [brandPrimary, setBrandPrimary] = useState(settings.brandPrimary);
  const [brandAccent, setBrandAccent] = useState(settings.brandAccent);
  const [brandCream, setBrandCream] = useState(settings.brandCream);

  // SEO
  const [metaTitle, setMetaTitle] = useState(settings.metaTitle);
  const [metaDescription, setMetaDescription] = useState(settings.metaDescription);

  // Booking
  const [minDuration, setMinDuration] = useState(String(settings.minDuration));
  const [maxDuration, setMaxDuration] = useState(String(settings.maxDuration));
  const [holdMinutes, setHoldMinutes] = useState(String(settings.holdMinutes));

  // Notifikasi email / SMTP
  const [notifEnabled, setNotifEnabled] = useState(settings.notifEnabled);
  const [notifyEmail, setNotifyEmail] = useState(settings.notifyEmail);
  const [smtpHost, setSmtpHost] = useState(settings.smtpHost);
  const [smtpPort, setSmtpPort] = useState(String(settings.smtpPort));
  const [smtpSecure, setSmtpSecure] = useState(settings.smtpSecure);
  const [smtpUser, setSmtpUser] = useState(settings.smtpUser);
  const [smtpFromName, setSmtpFromName] = useState(settings.smtpFromName);
  const [smtpFromEmail, setSmtpFromEmail] = useState(settings.smtpFromEmail);
  // write-only: jangan pernah prefill nilai password
  const [smtpPassword, setSmtpPassword] = useState("");
  const [testing, setTesting] = useState(false);

  // --- Helper editor baris {title, body} ---
  function updateItem(
    list: { title: string; body: string }[],
    setList: (v: { title: string; body: string }[]) => void,
    i: number,
    patch: Partial<{ title: string; body: string }>,
  ) {
    setList(list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function removeItem(
    list: { title: string; body: string }[],
    setList: (v: { title: string; body: string }[]) => void,
    i: number,
  ) {
    setList(list.filter((_, idx) => idx !== i));
  }
  function addItem(
    list: { title: string; body: string }[],
    setList: (v: { title: string; body: string }[]) => void,
  ) {
    setList([...list, { title: "", body: "" }]);
  }

  function ItemEditor({
    items,
    setItems,
    addLabel,
  }: {
    items: { title: string; body: string }[];
    setItems: (v: { title: string; body: string }[]) => void;
    addLabel: string;
  }) {
    return (
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="space-y-2 rounded-lg border bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                value={it.title}
                onChange={(e) =>
                  updateItem(items, setItems, i, { title: e.target.value })
                }
                placeholder="Judul"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeItem(items, setItems, i)}
                className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
              >
                Hapus
              </button>
            </div>
            <textarea
              value={it.body}
              onChange={(e) =>
                updateItem(items, setItems, i, { body: e.target.value })
              }
              placeholder="Isi"
              rows={2}
              className={inputClass}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => addItem(items, setItems)}
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
        >
          {addLabel}
        </button>
      </div>
    );
  }

  function FacilitiesEditor() {
    return (
      <div className="space-y-2">
        {facilities.map((f, i) => {
          const Icon = facilityIcon(f.icon);
          return (
            <div key={i} className="flex items-center gap-2">
              <Icon className="size-5 shrink-0 text-brand" aria-hidden />
              <select
                value={f.icon}
                onChange={(e) =>
                  setFacilities(
                    facilities.map((it, idx) =>
                      idx === i ? { ...it, icon: e.target.value } : it,
                    ),
                  )
                }
                className={`${inputClass} max-w-[160px]`}
              >
                {FACILITY_ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                value={f.label}
                onChange={(e) =>
                  setFacilities(
                    facilities.map((it, idx) =>
                      idx === i ? { ...it, label: e.target.value } : it,
                    ),
                  )
                }
                placeholder="Nama fasilitas"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  setFacilities(facilities.filter((_, idx) => idx !== i))
                }
                className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
              >
                Hapus
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() =>
            setFacilities([...facilities, { icon: "cafe", label: "" }])
          }
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
        >
          Tambah fasilitas
        </button>
      </div>
    );
  }

  function GalleryEditor() {
    const patch = (i: number, p: Partial<GalleryItem>) =>
      setGallery(gallery.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
    return (
      <div className="space-y-3">
        {gallery.map((g, i) => (
          <div key={i} className="space-y-2 rounded-lg border bg-white p-3">
            <ImageUpload
              name={`gallery-${i}`}
              prefix="gallery"
              defaultUrl={g.src}
              label="Upload foto galeri"
              onUploaded={(url) => patch(i, { src: url })}
            />
            <div className="flex items-center gap-2">
              <input
                value={g.tag}
                onChange={(e) => patch(i, { tag: e.target.value })}
                placeholder="Label (Venue / Turnamen / Komunitas)"
                className={`${inputClass} max-w-[220px]`}
              />
              <button
                type="button"
                onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
              >
                Hapus
              </button>
            </div>
            <textarea
              value={g.caption}
              onChange={(e) => patch(i, { caption: e.target.value })}
              placeholder="Keterangan foto"
              rows={2}
              className={inputClass}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setGallery([...gallery, { src: "", tag: "", caption: "" }])
          }
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-cream/40"
        >
          Tambah foto
        </button>
      </div>
    );
  }

  function save() {
    const obj = {
      name,
      tagline,
      address,
      whatsapp,
      instagram,
      tiktok,
      email,
      phone,
      mapsUrl,
      openHour: Number(openHour),
      closeHour: Number(closeHour),
      bankName,
      bankNumber,
      bankHolder,
      qrisUrl,
      paymentNotes,
      heroBadge,
      heroHeadline,
      heroSubcopy,
      ligaHeadline,
      ligaBody,
      schemes,
      rules,
      facilities,
      gallery,
      logoUrl,
      heroImageUrl,
      brandPrimary,
      brandAccent,
      brandCream,
      metaTitle,
      metaDescription,
      ogImageUrl,
      minDuration: Number(minDuration),
      maxDuration: Number(maxDuration),
      holdMinutes: Number(holdMinutes),
      notifEnabled,
      notifyEmail,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpSecure,
      smtpUser,
      smtpFromName,
      smtpFromEmail,
      // hanya kirim password kalau diketik (kosong = pertahankan yang lama)
      ...(smtpPassword ? { smtpPassword } : {}),
    };
    startTransition(async () => {
      const r = await updateSettingsAction(obj);
      if (r.ok) {
        toast.success("Tersimpan");
        setSmtpPassword(""); // jangan tahan nilai di state setelah simpan
      } else toast.error(r.error ?? "Gagal");
      router.refresh();
    });
  }

  async function sendTest() {
    setTesting(true);
    try {
      const r = await sendTestEmailAction();
      if (r.ok) toast.success("Email tes terkirim");
      else toast.error(r.error ?? "Gagal kirim email tes");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Identitas & Kontak */}
      <Section title="Identitas & Kontak">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama klub">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Tagline">
            <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Alamat">
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={inputClass} />
            </Field>
          </div>
          <Field label="WhatsApp">
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Instagram">
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputClass} />
          </Field>
          <Field label="TikTok">
            <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Telepon">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="URL Google Maps">
              <textarea value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} rows={2} className={inputClass} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Jam Buka */}
      <Section title="Jam Buka">
        <div className="grid grid-cols-2 gap-4 sm:max-w-xs">
          <Field label="Jam buka (0-23)">
            <input type="number" min={0} max={23} value={openHour} onChange={(e) => setOpenHour(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Jam tutup (0-23)">
            <input type="number" min={0} max={23} value={closeHour} onChange={(e) => setCloseHour(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Section>

      {/* Pembayaran */}
      <Section title="Pembayaran">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nama bank">
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Nomor rekening">
            <input value={bankNumber} onChange={(e) => setBankNumber(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Atas nama">
            <input value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Catatan pembayaran">
              <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} rows={2} className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Field label="URL gambar QRIS">
              <input value={qrisUrl} onChange={(e) => setQrisUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </Field>
            <ImageUpload name="qris" prefix="qris" defaultUrl={qrisUrl} label="Upload QRIS" onUploaded={(url) => setQrisUrl(url)} />
          </div>
        </div>
      </Section>

      {/* Konten Landing */}
      <Section title="Konten Landing">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Badge hero">
            <input value={heroBadge} onChange={(e) => setHeroBadge(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Judul hero">
            <input value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Subteks hero">
              <textarea value={heroSubcopy} onChange={(e) => setHeroSubcopy(e.target.value)} rows={3} className={inputClass} />
            </Field>
          </div>
          <Field label="Judul Liga">
            <input value={ligaHeadline} onChange={(e) => setLigaHeadline(e.target.value)} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Deskripsi Liga">
              <textarea value={ligaBody} onChange={(e) => setLigaBody(e.target.value)} rows={3} className={inputClass} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Kartu "Cara Main" */}
      <Section title='Kartu "Cara Main"'>
        <ItemEditor items={schemes} setItems={setSchemes} addLabel="Tambah kartu" />
      </Section>

      {/* Aturan Liga */}
      <Section title="Aturan Liga">
        <ItemEditor items={rules} setItems={setRules} addLabel="Tambah aturan" />
      </Section>

      <Section title="Fasilitas">
        <FacilitiesEditor />
      </Section>

      <Section title="Galeri Foto">
        <GalleryEditor />
      </Section>

      {/* Branding */}
      <Section title="Branding">
        <div className="space-y-4">
          <div className="space-y-2">
            <Field label="URL logo">
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </Field>
            <ImageUpload name="logo" prefix="logo" defaultUrl={logoUrl} label="Upload logo" onUploaded={(url) => setLogoUrl(url)} />
          </div>
          <div className="space-y-2">
            <Field label="URL gambar hero">
              <input value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </Field>
            <ImageUpload name="hero" prefix="hero" defaultUrl={heroImageUrl} label="Upload gambar hero" onUploaded={(url) => setHeroImageUrl(url)} />
          </div>
          <div className="space-y-2">
            <Field label="URL gambar OG (share)">
              <input value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </Field>
            <ImageUpload name="og" prefix="og" defaultUrl={ogImageUrl} label="Upload gambar OG" onUploaded={(url) => setOgImageUrl(url)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Warna utama">
              <div className="flex items-center gap-2">
                <input type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} className="h-9 w-12 shrink-0 rounded-lg border" />
                <input value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} className={inputClass} />
              </div>
            </Field>
            <Field label="Warna aksen">
              <div className="flex items-center gap-2">
                <input type="color" value={brandAccent} onChange={(e) => setBrandAccent(e.target.value)} className="h-9 w-12 shrink-0 rounded-lg border" />
                <input value={brandAccent} onChange={(e) => setBrandAccent(e.target.value)} className={inputClass} />
              </div>
            </Field>
            <Field label="Warna cream">
              <div className="flex items-center gap-2">
                <input type="color" value={brandCream} onChange={(e) => setBrandCream(e.target.value)} className="h-9 w-12 shrink-0 rounded-lg border" />
                <input value={brandCream} onChange={(e) => setBrandCream(e.target.value)} className={inputClass} />
              </div>
            </Field>
          </div>
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Meta title">
            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Meta description">
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className={inputClass} />
          </Field>
        </div>
      </Section>

      {/* Booking */}
      <Section title="Booking">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:max-w-md">
          <Field label="Durasi min (jam)">
            <input type="number" min={1} max={12} value={minDuration} onChange={(e) => setMinDuration(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Durasi maks (jam)">
            <input type="number" min={1} max={12} value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Hold slot (menit)">
            <input type="number" min={5} max={240} value={holdMinutes} onChange={(e) => setHoldMinutes(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-muted">
          Slot booking online di-hold selama ini menunggu transfer. Lewat batas → otomatis batal, slot kebuka lagi.
        </p>
      </Section>

      {/* Notifikasi Email */}
      <Section title="Notifikasi Email">
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifEnabled}
              onChange={(e) => setNotifEnabled(e.target.checked)}
              className="size-4 rounded border accent-brand"
            />
            <span className={labelClass}>Aktifkan notifikasi email</span>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Email tujuan alert admin">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="admin@klub.com"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="SMTP host">
              <input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className={inputClass} />
            </Field>
            <Field label="SMTP port">
              <input type="number" min={1} max={65535} value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  className="size-4 rounded border accent-brand"
                />
                <span className={labelClass}>Koneksi aman (SSL/TLS — port 465)</span>
              </label>
            </div>
            <Field label="SMTP user">
              <input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="kamu@gmail.com" className={inputClass} />
            </Field>
            <Field label="Password SMTP">
              <input
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder={settings.smtpPasswordSet ? "•••••• (tersimpan, kosongkan jika tak diubah)" : "App password"}
                autoComplete="new-password"
                className={inputClass}
              />
            </Field>
            <Field label="Nama pengirim">
              <input value={smtpFromName} onChange={(e) => setSmtpFromName(e.target.value)} placeholder="One Padel Club" className={inputClass} />
            </Field>
            <Field label="Email pengirim">
              <input type="email" value={smtpFromEmail} onChange={(e) => setSmtpFromEmail(e.target.value)} placeholder="kamu@gmail.com" className={inputClass} />
            </Field>
          </div>

          <p className="text-xs text-muted">
            Password Gmail = App Password (bukan password akun).
          </p>

          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <button
              type="button"
              onClick={sendTest}
              disabled={testing}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-cream/40 disabled:opacity-50"
            >
              {testing ? "Mengirim..." : "Kirim email tes"}
            </button>
            <span className="text-xs text-muted">
              Simpan dulu sebelum tes — email tes pakai konfigurasi yang tersimpan.
            </span>
          </div>
        </div>
      </Section>

      {/* Simpan */}
      <div className="sticky bottom-0 -mx-5 border-t bg-card/95 px-5 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-brand-fg disabled:opacity-50 sm:w-auto"
        >
          {pending ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}
