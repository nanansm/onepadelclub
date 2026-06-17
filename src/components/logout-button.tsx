"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function LogoutButton({
  variant = "default",
}: {
  variant?: "default" | "onDark";
}) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/login");
        router.refresh();
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition",
        variant === "onDark"
          ? "w-full text-brand-fg/70 hover:bg-brand-fg/10 hover:text-brand-fg"
          : "border hover:bg-cream/40",
      )}
    >
      <LogOut className="size-4" strokeWidth={2} />
      Keluar
    </button>
  );
}
