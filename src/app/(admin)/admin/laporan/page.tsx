import { AdminPageHeader } from "@/components/admin/page-header";
import { getRevenueReport, getClosedShifts } from "@/lib/report";
import { getSettings } from "@/lib/settings";
import { getVenue } from "@/lib/venue";
import { todayJakarta } from "@/lib/tz";
import { rupiah } from "@/lib/utils";
import { ReportControls } from "./report-controls";

export const dynamic = "force-dynamic";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const today = todayJakarta();
  const monthStart = `${today.slice(0, 7)}-01`;
  const from = sp.from && YMD.test(sp.from) ? sp.from : monthStart;
  const to = sp.to && YMD.test(sp.to) ? sp.to : today;

  const [report, settings, venue] = await Promise.all([
    getRevenueReport(from, to),
    getSettings(),
    getVenue(),
  ]);
  const shifts =
    settings.posEnabled && venue
      ? await getClosedShifts(venue.id, from, to)
      : [];

  return (
    <div>
      <AdminPageHeader
        title="Laporan"
        accent="Keuangan"
        sub="Pemasukan dari semua sumber (booking + POS) dalam rentang tanggal."
      />

      <div className="mt-6">
        <ReportControls
          from={from}
          to={to}
          today={today}
          monthStart={monthStart}
          csv={{ rows: report.rows, total: report.total }}
        />
      </div>

      {/* Ringkasan */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card label="Total Pemasukan" value={rupiah(report.total)} primary />
        <Card
          label="Pemasukan POS"
          value={rupiah(
            report.rows.find((r) => r.key === "pos")?.revenue ?? 0,
          )}
        />
        {settings.posEnabled ? (
          <Card
            label="Laba Kotor POS"
            value={rupiah(report.posGrossProfit)}
          />
        ) : (
          <Card
            label="Pemasukan Booking"
            value={rupiah(
              report.total -
                (report.rows.find((r) => r.key === "pos")?.revenue ?? 0),
            )}
          />
        )}
      </div>

      {/* Rincian per sumber */}
      <div className="mt-6 overflow-hidden rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-cream/30 text-left text-muted">
              <th className="px-4 py-3 font-medium">Sumber</th>
              <th className="px-4 py-3 text-right font-medium">Transaksi</th>
              <th className="px-4 py-3 text-right font-medium">Pemasukan</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((r) => (
              <tr key={r.key} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{r.label}</td>
                <td className="px-4 py-3 text-right text-muted">{r.count}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {rupiah(r.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-cream/20 font-bold">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right">
                {report.rows.reduce((s, r) => s + r.count, 0)}
              </td>
              <td className="px-4 py-3 text-right text-brand">
                {rupiah(report.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Z-report shift kasir */}
      {settings.posEnabled ? (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Rekap Shift Kasir
          </h2>
          {shifts.length === 0 ? (
            <p className="rounded-2xl border bg-card p-6 text-center text-sm text-muted">
              Belum ada shift yang ditutup dalam rentang ini.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-cream/30 text-left text-muted">
                    <th className="px-4 py-3 font-medium">Tutup</th>
                    <th className="px-4 py-3 text-right font-medium">Modal</th>
                    <th className="px-4 py-3 text-right font-medium">Ekspektasi</th>
                    <th className="px-4 py-3 text-right font-medium">Fisik</th>
                    <th className="px-4 py-3 text-right font-medium">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-4 py-3 text-muted">
                        {new Date(s.closedAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Jakarta",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rupiah(s.openingCash)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rupiah(s.expectedCash)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rupiah(s.closingCash)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          s.diff === 0
                            ? "text-muted"
                            : s.diff > 0
                              ? "text-green-600"
                              : "text-red-600"
                        }`}
                      >
                        {s.diff > 0 ? "+" : ""}
                        {rupiah(s.diff)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      <p className="mt-4 text-xs text-muted">
        Booking dihitung berdasarkan tanggal main; POS berdasarkan tanggal
        transaksi. Laba kotor POS = harga jual − modal yang dibekukan saat
        transaksi.
      </p>
    </div>
  );
}

function Card({
  label,
  value,
  primary,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        primary ? "bg-brand text-brand-fg" : "bg-card"
      }`}
    >
      <p className={`text-xs ${primary ? "text-brand-fg/70" : "text-muted"}`}>
        {label}
      </p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
