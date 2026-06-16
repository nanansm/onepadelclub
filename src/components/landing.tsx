import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Court, Venue } from "@/db/schema";
import { rupiah } from "@/lib/utils";

function SectionTag({ children }: { children: ReactNode }) {
  return (
    <span className="opc-tag">
      <span className="opc-tag-dot" />
      {children}
    </span>
  );
}

function Logo() {
  return (
    <Link href="/" className="opc-logo">
      <Image
        src="/brand/logo.jpg"
        alt="One Padel Club"
        width={34}
        height={34}
        unoptimized
      />
      One Padel Club
    </Link>
  );
}

export function LandingNav() {
  return (
    <header className="opc-nav">
      <div className="opc-container opc-nav-inner">
        <Logo />
        <nav className="opc-nav-links">
          <a href="#skema">Cara Main</a>
          <a href="#lapangan">Lapangan</a>
          <a href="#lokasi">Lokasi</a>
          <Link href="/liga">Liga</Link>
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
}: {
  courtCount: number;
  priceFrom: number;
}) {
  return (
    <section className="opc-hero">
      <div className="opc-container opc-hero-inner">
        <div className="opc-hero-copy">
          <span className="opc-badge">
            <span className="opc-badge-dot" />
            Segera Buka · Garut
          </span>
          <h1 className="opc-h1">
            Lapangan padel indoor di <em>Kota Garut.</em>
          </h1>
          <p className="opc-tagline">One Court, One Community, One Game</p>
          <p className="opc-body" style={{ maxWidth: 520 }}>
            Empat lapangan indoor dengan suasana aesthetic — tempat main
            sekaligus nongkrong. Booking lapangan, open play, coaching, dan
            membership dari satu tempat.
          </p>
          <div className="opc-hero-actions">
            <Link className="opc-btn opc-btn-primary" href="/sewa">
              Booking Lapangan
            </Link>
            <Link className="opc-btn opc-btn-ghost" href="/liga">
              Lihat Liga
            </Link>
          </div>
          <div className="opc-hero-stats">
            <div className="opc-stat">
              <div className="opc-stat-num">{courtCount}</div>
              <div className="opc-stat-label">lapangan indoor</div>
            </div>
            <div className="opc-stat-divider" />
            <div className="opc-stat">
              <div className="opc-stat-num">07–23</div>
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
          <span className="opc-poster-badge">Coming Soon</span>
          <span className="opc-poster-ball" style={{ top: "28%", right: "20%" }} />
          <span className="opc-poster-ball" style={{ bottom: "24%", left: "18%" }} />
          <div className="opc-poster-center">
            <Image
              src="/brand/logo-white.png"
              alt="One Padel Club"
              width={132}
              height={132}
              unoptimized
            />
            <span className="opc-poster-tagline">
              One Court, One Community, One Game
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- cara main ---------- */

const schemes = [
  {
    num: "01",
    title: "Sewa Lapangan",
    body: "Pilih tanggal dan jam kosong, bayar, langsung main. Tanpa akun.",
    href: "/sewa",
    cta: "Booking sekarang",
  },
  {
    num: "02",
    title: "Open Play / Mabar",
    body: "Gabung sesi main bareng sesuai level. Daftar per kursi, kuota terbatas.",
    href: "/open-play",
    cta: "Lihat jadwal",
  },
  {
    num: "03",
    title: "Coaching / Klinik",
    body: "Latihan bareng pelatih berpengalaman. Pilih pelatih dan jam yang cocok.",
    href: "/coaching",
    cta: "Cari pelatih",
  },
  {
    num: "04",
    title: "Membership",
    body: "Paket member dengan harga khusus dan benefit rutin main tiap bulan.",
    href: "/membership",
    cta: "Lihat paket",
  },
];

export function SchemesSection() {
  return (
    <section className="opc-section" id="skema">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Cara main</SectionTag>
          <h2 className="opc-h2">
            Empat cara main di <em>One Padel Club.</em>
          </h2>
        </div>
        <div className="opc-cards">
          {schemes.map((s) => (
            <Link className="opc-card" key={s.num} href={s.href}>
              <span className="opc-card-num">{s.num}</span>
              <span className="opc-card-title">{s.title}</span>
              <p className="opc-card-body">{s.body}</p>
              <span className="opc-card-link">{s.cta} &rarr;</span>
            </Link>
          ))}
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

/* ---------- lapangan & harga ---------- */

export function CourtsSection({ courts }: { courts: Court[] }) {
  return (
    <section className="opc-section" id="lapangan">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Lapangan</SectionTag>
          <h2 className="opc-h2">
            Lapangan padel <em>berkualitas.</em>
          </h2>
        </div>
        <div className="opc-courts">
          {courts.map((c) => (
            <div className="opc-court" key={c.id}>
              <div className="opc-court-name">{c.name}</div>
              <div className="opc-court-type">
                {c.type === "INDOOR" ? "Indoor" : "Outdoor"}
              </div>
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

/* ---------- liga ---------- */

export function LigaSection() {
  return (
    <section className="opc-section">
      <div className="opc-container">
        <div className="opc-feature">
          <SectionTag>Liga Padel Kota Intan</SectionTag>
          <h2 className="opc-h2 opc-h2-big">
            Kompetisi. Komunitas. <em>Kemenangan.</em>
          </h2>
          <p className="opc-body">
            Liga berjenjang dengan klasemen real-time, jadwal, live score, dan
            profil tim. Ikuti perjalanan tim favoritmu.
          </p>
          <Link className="opc-btn opc-btn-primary" href="/liga">
            Lihat Klasemen
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- lokasi ---------- */

export function LokasiSection({ venue }: { venue: Venue }) {
  const igUrl = venue.instagram ? `https://instagram.com/${venue.instagram}` : null;
  return (
    <section className="opc-section opc-section-alt" id="lokasi">
      <div className="opc-container">
        <div className="opc-center-head">
          <SectionTag>Lokasi</SectionTag>
          <h2 className="opc-h2">
            Main di <em>One Padel Club.</em>
          </h2>
        </div>
        <div className="opc-lokasi">
          <div className="opc-info-card">
            <div className="opc-info-block">
              <h3>Alamat</h3>
              <p>{venue.address}</p>
            </div>
            <div className="opc-info-block">
              <h3>Jam Operasional</h3>
              <p>Setiap hari, 07.00 - 23.00 WIB</p>
            </div>
            {igUrl ? (
              <a
                className="opc-info-link"
                href={igUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ikuti @{venue.instagram} di Instagram &rarr;
              </a>
            ) : null}
          </div>
          {venue.mapsUrl ? (
            <div className="opc-map">
              <iframe
                title="Lokasi One Padel Club"
                src={venue.mapsUrl}
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

export function LandingFooter({ venue }: { venue: Venue }) {
  const igUrl = venue.instagram ? `https://instagram.com/${venue.instagram}` : null;
  return (
    <footer className="opc-footer">
      <div className="opc-container opc-footer-inner">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Logo />
          <span
            style={{
              fontFamily: "var(--font-instrument), Georgia, serif",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--muted)",
            }}
          >
            One Court, One Community, One Game
          </span>
        </div>
        <nav className="opc-footer-links">
          <a href="#skema">Cara Main</a>
          <a href="#lapangan">Lapangan</a>
          <a href="#lokasi">Lokasi</a>
          <Link href="/liga">Liga</Link>
          {igUrl ? (
            <a href={igUrl} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          ) : null}
        </nav>
        <div className="opc-footer-meta">
          <div>{venue.address}</div>
          <div>Buka 07.00 - 23.00 WIB</div>
          <div>&copy; {new Date().getFullYear()} One Padel Club</div>
        </div>
      </div>
    </footer>
  );
}
