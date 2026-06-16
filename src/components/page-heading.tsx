export function PageHeading({
  plain,
  accent,
  sub,
}: {
  plain: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {plain}{" "}
        <span
          className="text-accent"
          style={{
            fontFamily: "var(--font-instrument), serif",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          {accent}
        </span>
      </h1>
      {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
    </div>
  );
}
