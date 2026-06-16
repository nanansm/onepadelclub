"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Terjadi kesalahan
          </h2>
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
              borderRadius: "0.5rem",
              background: "#1a4d33",
              color: "#f4f7ef",
              padding: "0.5rem 1rem",
              border: "none",
            }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
