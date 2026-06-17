import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div>
      <AdminPageHeader
        title="Pengaturan"
        sub="Edit identitas, kontak, pembayaran, konten landing, branding, SEO."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
