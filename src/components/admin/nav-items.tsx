import {
  LayoutDashboard,
  CalendarCheck,
  LayoutGrid,
  Users,
  GraduationCap,
  BadgeCheck,
  Trophy,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// Top-level admin nav. Liga sub-menu (skor/tim/jadwal/season) hidup di hub /admin/liga.
export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Booking", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Lapangan", href: "/admin/courts", icon: LayoutGrid },
  { label: "Open Play", href: "/admin/open-play", icon: Users },
  { label: "Coaching", href: "/admin/coaching", icon: GraduationCap },
  { label: "Membership", href: "/admin/membership", icon: BadgeCheck },
  { label: "Liga Kota Intan", href: "/admin/liga", icon: Trophy },
  { label: "Pengaturan", href: "/admin/settings", icon: Settings },
];
