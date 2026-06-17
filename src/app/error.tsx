"use client";

import Link from "next/link";

// Error boundary route publik (landing, /sewa, /liga, dst). 1 throw = card
// recoverable, bukan layar putih. Layout root tetap ada (nav/footer page sendiri).
export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <main
      style={{
        minHeight: "70dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a4d33" }}>
          Ada gangguan sebentar
        </h1>
        <p style={{ marginTop: "0.5rem", color: "#5b6b60", fontSize: "0.95rem" }}>
          Halaman gagal dimuat. Coba lagi, atau kembali ke beranda.
        </p>
        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          <button
            onClick={reset}
            style={{
              borderRadius: "0.6rem",
              background: "#1a4d33",
              color: "#f4f7ef",
              padding: "0.6rem 1.1rem",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
          <Link
            href="/"
            style={{
              borderRadius: "0.6rem",
              border: "1px solid #d7e0cb",
              color: "#1a4d33",
              padding: "0.6rem 1.1rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
