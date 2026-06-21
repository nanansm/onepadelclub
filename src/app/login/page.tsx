import { getSettings, brandVars } from "@/lib/settings";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const s = await getSettings();
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-cream/30 px-5"
      style={brandVars(s)}
    >
      <LoginForm name={s.name} logoUrl={s.logoUrl} />
    </main>
  );
}
