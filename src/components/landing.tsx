import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Court } from "@/db/schema";
import { rupiah } from "@/lib/utils";
import {
  type Settings,
  hoursLabel,
  hoursShort,
  instagramUrl,
  tiktokUrl,
} from "@/lib/settings";
import { facilityIcon } from "@/lib/facility-icons";

function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="opc-tag">
      <span className="opc-tag-dot" />
      {children}
    </span>
  );
}

function Logo({ logoUrl, name }: { logoUrl?: string; name: string }) {
  return (
    <Link href="/" className="opc-logo">
      <Image
        src={logoUrl || "/brand/logo-mark.webp"}
        alt={name}
        width={62}
        height={34}
        unoptimized
      />
      {name}
    </Link>
  );
}

export function LandingNav({ settings }: { settings: Settings }) {
  return (
    <header className="opc-nav">
      <div className="opc-container opc-nav-inner">
        <Logo logoUrl={settings.logoUrl} name={settings.name} />
        <nav className="opc-nav-links">
          <a href="#skema">Cara Main</a>
          <a href="#lapangan">Lapangan</a>
          <a href="#fasilitas">Fasilitas</a>
          <a href="#lokasi">Lokasi</a>
          {settings.ligaEnabled ? <Link href="/liga">Liga</Link> : null}
        </nav>
        <div className="opc-nav-actions">
          <Link className="opc-btn opc-btn-primary opc-btn-sm" href="/sewa">
            Booking
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Hero({
  courtCount,
  priceFrom,
  settings,
}: {
  courtCount: number;
  priceFrom: number;
  settings: Settings;
}) {
  return (
    <section className="opc-hero">
      <div className="opc-container opc-hero-inner">
        <div className="opc-hero-copy">
          <span className="opc-badge">
            <span className="opc-badge-dot" />
            {settings.heroBadge}
          </span>
          <h1 className="opc-h1">{settings.heroHeadline}</h1>
          <p className="opc-tagline">{settings.tagline}</p>
          <p className="opc-body" style={{ maxWidth: 520 }}>
            {settings.heroSubcopy}
          </p>
          <div className="opc-hero-actions">
            <Link className="opc-btn opc-btn-primary" href="/sewa">
              Booking Lapangan
            </Link>
            {settings.ligaEnabled ? (
              <Link className="opc-btn opc-btn-ghost" href="/liga">
                Lihat Liga
              </Link>
            ) : null}
          </div>
          <div className="opc-hero-stats">
            <div className="opc-stat">
              <div className="opc-stat-num">{courtCount}</div>
              <div className="opc-stat-label">lapangan indoor</div>
            </div>
            <div className="opc-stat-divider" />
            <div className="opc-stat">
              <div className="opc-stat-num">{hoursShort(settings)}</div>
              <div className="opc-stat-label">buka tiap hari</div>
            </div>
            <div className="opc-stat-divider" />
            <div className="opc-stat">
              <div className="opc-stat-num">{rupiah(priceFrom)}</div>
              <div className="opc-stat-label">mulai / jam</div>
            </div>
          </div>
        </div>

        <div className="opc-poster">
          <Image
            src={settings.heroImageUrl || "/newimg1.webp"}
            alt={`Main padel di ${settings.name}`}
            fill
            priority
            sizes="(max-width: 880px) 90vw, 460px"
            className="opc-poster-img"
          />
          <div className="opc-poster-overlay">
            <span className="opc-poster-tagline">{settings.tagline}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- cara main ---------- */

const SCHEME_HREFS = ["/sewa", "/open-play", "/coaching", "/membership"];
const SCHEME_CTAS = [
  "Booking sekarang",
  "Lihat jadwal",
  "Cari pelatih",
  "Lihat paket",
];

export function SchemesSection({ settings }: { settings: Settings }) {
  return (
    <section className="opc-section" id="skema">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Cara main</SectionTag>
          <h2 className="opc-h2">
            Empat cara main di <em>{settings.name}.</em>
          </h2>
        </div>
        <div className="opc-cards">
          {settings.schemes.map((s, i) => {
            const num = String(i + 1).padStart(2, "0");
            const href = SCHEME_HREFS[i] ?? "/sewa";
            const cta = SCHEME_CTAS[i] ?? "Selengkapnya";
            return (
              <Link className="opc-card" key={num} href={href}>
                <span className="opc-card-num">{num}</span>
                <span className="opc-card-title">{s.title}</span>
                <p className="opc-card-body">{s.body}</p>
                <span className="opc-card-link">{cta} &rarr;</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- cara booking ---------- */

const steps = [
  {
    num: "1",
    title: "Pilih lapangan & jam",
    body: "Buka halaman booking, pilih tanggal dan slot kosong yang tampil real-time. Tanpa akun.",
  },
  {
    num: "2",
    title: "Isi data & bayar",
    body: "Masukkan nama dan nomor WhatsApp, lalu transfer bank atau QRIS sesuai instruksi.",
  },
  {
    num: "3",
    title: "Tinggal main",
    body: "Admin konfirmasi pembayaran, slot terkunci atas nama kamu. Datang dan main.",
  },
];

export function StepsSection() {
  return (
    <section className="opc-section opc-section-alt" id="cara-booking">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Cara booking</SectionTag>
          <h2 className="opc-h2">
            Booking dalam <em>tiga langkah.</em>
          </h2>
        </div>
        <div className="opc-steps">
          {steps.map((s, i) => (
            <div className="opc-step" key={s.num}>
              <div className="opc-step-num">{s.num}</div>
              <div className="opc-step-title">{s.title}</div>
              <p className="opc-step-body">{s.body}</p>
              {i < steps.length - 1 ? <span className="opc-step-line" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- komunitas / galeri ---------- */

export function CommunitySection({ settings }: { settings: Settings }) {
  const gallery = settings.gallery;
  if (!gallery.length) return null;
  return (
    <section className="opc-section" id="komunitas">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Suasana & Komunitas</SectionTag>
          <h2 className="opc-h2">
            Bukan cuma lapangan — <em>ini rumah komunitas.</em>
          </h2>
          <p className="opc-body" style={{ maxWidth: 560 }}>
            Tempat pemain padel ketemu, main bareng, dan berkembang.
            Datang sendiri pun bisa pulang bawa teman baru.
          </p>
        </div>
        <div className="opc-gallery">
          {gallery.map((g, i) => (
            <figure className="opc-gallery-item" key={`${g.src}-${i}`}>
              <Image
                src={g.src}
                alt={g.caption || g.tag || settings.name}
                fill
                sizes="(max-width: 880px) 90vw, 360px"
                className="opc-gallery-img"
              />
              <figcaption className="opc-gallery-cap">
                {g.tag ? <span className="opc-gallery-tag">{g.tag}</span> : null}
                <span>{g.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- lapangan & harga ---------- */

export function CourtsSection({ courts }: { courts: Court[] }) {
  return (
    <section className="opc-section" id="lapangan">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Lapangan</SectionTag>
          <h2 className="opc-h2">
            Pilih lapangan, lalu <em>main.</em>
          </h2>
        </div>
        <div className="opc-courts">
          {courts.map((c) => (
            <div className="opc-court" key={c.id}>
              <div className="opc-court-name">{c.name}</div>
              <div className="opc-court-type">
                Padel · {c.type === "INDOOR" ? "Indoor" : "Outdoor"}
              </div>
              {c.surface ? (
                <div className="opc-court-surface">{c.surface}</div>
              ) : null}
              <div className="opc-court-price">{rupiah(c.pricePerHour)}</div>
              <div className="opc-court-unit">per jam</div>
            </div>
          ))}
        </div>
        <div className="opc-courts-cta">
          <Link className="opc-btn opc-btn-primary" href="/sewa">
            Cek Ketersediaan
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- fasilitas ---------- */

export function FacilitiesSection({ settings }: { settings: Settings }) {
  if (!settings.facilities.length) return null;
  return (
    <section className="opc-section opc-section-alt" id="fasilitas">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Fasilitas</SectionTag>
          <h2 className="opc-h2">
            Datang main, <em>sisanya sudah siap.</em>
          </h2>
        </div>
        <ul className="opc-facilities">
          {settings.facilities.map((f, i) => {
            const Icon = facilityIcon(f.icon);
            return (
              <li className="opc-facility" key={`${f.icon}-${i}`}>
                <Icon className="opc-facility-icon" aria-hidden strokeWidth={1.6} />
                <span>{f.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- liga ---------- */

export function LigaSection({ settings }: { settings: Settings }) {
  return (
    <section className="opc-section">
      <div className="opc-container">
        <div className="opc-feature">
          <SectionTag>Liga Padel</SectionTag>
          <h2 className="opc-h2 opc-h2-big">{settings.ligaHeadline}</h2>
          <p className="opc-body">{settings.ligaBody}</p>
          <Link className="opc-btn opc-btn-primary" href="/liga">
            Lihat Klasemen
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- lokasi ---------- */

export function LokasiSection({ settings }: { settings: Settings }) {
  const igUrl = instagramUrl(settings);
  const ttUrl = tiktokUrl(settings);
  return (
    <section className="opc-section opc-section-alt" id="lokasi">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Lokasi</SectionTag>
          <h2 className="opc-h2">
            Main di <em>{settings.name}.</em>
          </h2>
        </div>
        <div className="opc-lokasi">
          <div className="opc-info-card">
            <div className="opc-info-block">
              <h3>Alamat</h3>
              <p>{settings.address}</p>
            </div>
            <div className="opc-info-block">
              <h3>Jam Operasional</h3>
              <p>{hoursLabel(settings)}</p>
            </div>
            {settings.phone || settings.email ? (
              <div className="opc-info-block">
                <h3>Kontak</h3>
                {settings.phone ? <p>{settings.phone}</p> : null}
                {settings.email ? <p>{settings.email}</p> : null}
              </div>
            ) : null}
            {igUrl ? (
              <a
                className="opc-info-link"
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ikuti @{settings.instagram.replace(/^@/, "")} di Instagram &rarr;
              </a>
            ) : null}
            {ttUrl ? (
              <a
                className="opc-info-link"
                href={ttUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ikuti @{settings.tiktok.replace(/^@/, "")} di TikTok &rarr;
              </a>
            ) : null}
          </div>
          {settings.mapsUrl ? (
            <div className="opc-map">
              <iframe
                title={`Lokasi ${settings.name}`}
                src={settings.mapsUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

export function LandingFooter({ settings }: { settings: Settings }) {
  const igUrl = instagramUrl(settings);
  return (
    <footer className="opc-footer">
      <div className="opc-container opc-footer-inner">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Logo logoUrl={settings.logoUrl} name={settings.name} />
          <span
            style={{
              fontFamily: "var(--font-instrument), Georgia, serif",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--muted)",
            }}
          >
            {settings.tagline}
          </span>
        </div>
        <nav className="opc-footer-links">
          <a href="#skema">Cara Main</a>
          <a href="#lapangan">Lapangan</a>
          <a href="#fasilitas">Fasilitas</a>
          <a href="#lokasi">Lokasi</a>
          {settings.ligaEnabled ? <Link href="/liga">Liga</Link> : null}
          <Link href="/cek">Cek Booking</Link>
          {settings.ligaEnabled ? (
            <Link href="/liga/daftar">Daftar Liga</Link>
          ) : null}
          {igUrl ? (
            <a href={igUrl} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          ) : null}
        </nav>
        <div className="opc-footer-meta">
          <div>{settings.address}</div>
          <div>{hoursLabel(settings)}</div>
          <div>&copy; {new Date().getFullYear()} {settings.name}</div>
        </div>
      </div>
    </footer>
  );
}
