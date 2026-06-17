import {
  Armchair,
  Bike,
  Car,
  Cookie,
  CupSoda,
  Droplets,
  MapPin,
  Moon,
  Shirt,
  ShowerHead,
  Toilet,
  UtensilsCrossed,
  Wifi,
  type LucideIcon,
} from "lucide-react";

// Key -> komponen ikon lucide. Dipakai di landing (FasilitasSection) &
// editor admin. Key disimpan di DB (venue.facilities[].icon). Key tak dikenal
// -> fallback MapPin.
export const FACILITY_ICONS: Record<string, LucideIcon> = {
  cafe: UtensilsCrossed,
  hotShower: ShowerHead,
  snacks: Cookie,
  drinks: CupSoda,
  musholla: Moon,
  parkirMobil: Car,
  parkirMotor: Bike,
  ruangGanti: Shirt,
  shower: Droplets,
  toilet: Toilet,
  tribun: Armchair,
  wifi: Wifi,
};

export function facilityIcon(key: string): LucideIcon {
  return FACILITY_ICONS[key] ?? MapPin;
}

// Opsi untuk dropdown pemilih ikon di editor admin.
export const FACILITY_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "cafe", label: "Cafe / Resto" },
  { value: "hotShower", label: "Hot Shower" },
  { value: "snacks", label: "Makanan Ringan" },
  { value: "drinks", label: "Minuman" },
  { value: "musholla", label: "Musholla" },
  { value: "parkirMobil", label: "Parkir Mobil" },
  { value: "parkirMotor", label: "Parkir Motor" },
  { value: "ruangGanti", label: "Ruang Ganti" },
  { value: "shower", label: "Shower" },
  { value: "toilet", label: "Toilet" },
  { value: "tribun", label: "Tribun" },
  { value: "wifi", label: "Wi-fi" },
];
