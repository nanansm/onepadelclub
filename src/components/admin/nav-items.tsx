import {
  LayoutDashboard,
  CalendarCheck,
  LayoutGrid,
  Users,
  GraduationCap,
  BadgeCheck,
  Trophy,
  ShoppingCart,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  // Item bermodul cuma tampil kalau modulnya aktif (venue toggle).
  module?: "liga" | "pos";
};

// Top-level admin nav. Liga sub-menu (skor/tim/jadwal/season) hidup di hub /admin/liga.
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "POS Kasir", href: "/admin/pos", icon: ShoppingCart, module: "pos" },
  { label: "Booking", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Lapangan", href: "/admin/courts", icon: LayoutGrid },
  { label: "Open Play", href: "/admin/open-play", icon: Users },
  { label: "Coaching", href: "/admin/coaching", icon: GraduationCap },
  { label: "Membership", href: "/admin/membership", icon: BadgeCheck },
  { label: "Liga", href: "/admin/liga", icon: Trophy, module: "liga" },
  { label: "Laporan", href: "/admin/laporan", icon: BarChart3 },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings },
];

// Saring nav sesuai modul aktif. Item tanpa `module` selalu tampil.
export function visibleNav(flags: {
  ligaEnabled: boolean;
  posEnabled: boolean;
}): AdminNavItem[] {
  return ADMIN_NAV.filter((it) => {
    if (it.module === "liga") return flags.ligaEnabled;
    if (it.module === "pos") return flags.posEnabled;
    return true;
  });
}
