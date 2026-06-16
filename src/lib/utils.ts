import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format Rupiah tanpa desimal. 100000 -> "Rp100.000".
export function rupiah(n: number): string {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

// Avatar placeholder (ui-avatars) dari nama. Dev sebelum foto asli tersedia.
export function avatarUrl(name: string, bg = "1a4d33"): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=256`;
}
