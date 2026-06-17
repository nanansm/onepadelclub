// Loading state route publik. Skeleton ringan biar tak blank saat fetch.
export default function PublicLoading() {
  return (
    <main
      style={{
        minHeight: "70dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <div
        aria-label="Memuat"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid #d7e0cb",
          borderTopColor: "#1a4d33",
          animation: "opc-spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes opc-spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
