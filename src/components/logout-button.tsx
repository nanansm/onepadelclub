"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:bg-cream/40"
    >
      Keluar
    </button>
  );
}
