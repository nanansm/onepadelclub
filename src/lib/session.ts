import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Wajib login. Kalau tidak -> /login. Dipakai di layout route group (admin).
export async function requireSession() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session;
}

// Wajib admin/super_admin.
export async function requireAdmin() {
  const session = await requireSession();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "super_admin") redirect("/login");
  return session;
}
