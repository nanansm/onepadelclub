// Seed data demo Padel Club. Idempotent per-tabel (aman dijalankan berkali-kali).
import { db } from "./index";
import {
  coach,
  court,
  membershipPlan,
  openPlaySession,
  venue,
} from "./schema";
import { avatarUrl } from "../lib/utils";

function tomorrow(): string {
  const now = new Date();
  const dt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

async function seedVenue() {
  if ((await db.select().from(venue).limit(1)).length > 0) return;
  const [v] = await db
    .insert(venue)
    .values({
      name: "Padel Club",
      slug: "padel-club",
      address: "",
      whatsapp: "6281200000000",
      instagram: "",
      mapsUrl: "",
      openHour: 7,
      closeHour: 23,
      bankName: "BCA",
      bankNumber: "1234567890",
      bankHolder: "Padel Club",
      paymentNotes:
        "Transfer ke rekening di atas, lalu kirim bukti ke WhatsApp admin. Booking dikonfirmasi setelah pembayaran diverifikasi.",
    })
    .returning();
  const grass = "Premium Synthetic Grass";
  await db.insert(court).values([
    { venueId: v.id, name: "Court 1 Hijau", type: "INDOOR", surface: grass, pricePerHour: 175000, sortOrder: 1 },
    { venueId: v.id, name: "Court 2 Teracotta", type: "INDOOR", surface: grass, pricePerHour: 175000, sortOrder: 2 },
    { venueId: v.id, name: "Court 3 Hijau", type: "INDOOR", surface: grass, pricePerHour: 200000, sortOrder: 3 },
    { venueId: v.id, name: "Court 4 Teracotta", type: "INDOOR", surface: grass, pricePerHour: 275000, sortOrder: 4 },
  ]);
  console.log("[seed] venue + 4 lapangan dibuat.");
}

async function seedCoaches() {
  if ((await db.select().from(coach).limit(1)).length > 0) return;
  await db.insert(coach).values([
    {
      name: "Coach Bagas",
      photoUrl: avatarUrl("Coach Bagas"),
      bio: "Pelatih bersertifikat, fokus teknik dasar dan footwork untuk pemula hingga menengah.",
      ratePerHour: 150000,
      sortOrder: 1,
    },
    {
      name: "Coach Sinta",
      photoUrl: avatarUrl("Coach Sinta"),
      bio: "Spesialis strategi bermain ganda dan positioning. Cocok untuk yang ingin naik level.",
      ratePerHour: 175000,
      sortOrder: 2,
    },
    {
      name: "Coach Rian",
      photoUrl: avatarUrl("Coach Rian"),
      bio: "Mantan pemain kompetitif. Latihan intensif untuk smash, bandeja, dan vibora.",
      ratePerHour: 200000,
      sortOrder: 3,
    },
  ]);
  console.log("[seed] 3 pelatih dibuat.");
}

async function seedPlans() {
  if ((await db.select().from(membershipPlan).limit(1)).length > 0) return;
  await db.insert(membershipPlan).values([
    {
      name: "Starter",
      price: 350000,
      durationDays: 30,
      benefits:
        "Diskon 10% sewa lapangan\nPrioritas booking H-7\nGratis 1 sesi open play",
      sortOrder: 1,
    },
    {
      name: "Pro",
      price: 750000,
      durationDays: 30,
      benefits:
        "Diskon 20% sewa lapangan\nPrioritas booking H-14\nGratis 3 sesi open play\nDiskon 10% coaching",
      sortOrder: 2,
    },
    {
      name: "Elite",
      price: 1500000,
      durationDays: 30,
      benefits:
        "Diskon 35% sewa lapangan\nPrioritas booking penuh\nOpen play tanpa batas\nDiskon 20% coaching\nMerchandise eksklusif",
      sortOrder: 3,
    },
  ]);
  console.log("[seed] 3 paket membership dibuat.");
}

async function seedOpenPlay() {
  if ((await db.select().from(openPlaySession).limit(1)).length > 0) return;
  const v = (await db.select().from(venue).limit(1))[0];
  const c = (await db.select().from(court).limit(1))[0];
  if (!v || !c) return;
  await db.insert(openPlaySession).values([
    {
      venueId: v.id,
      courtId: c.id,
      title: "Open Play Malam",
      level: "Intermediate",
      date: tomorrow(),
      startHour: 19,
      duration: 2,
      maxPlayers: 8,
      pricePerPlayer: 50000,
    },
    {
      venueId: v.id,
      courtId: c.id,
      title: "Mabar Santai",
      level: "Beginner",
      date: tomorrow(),
      startHour: 16,
      duration: 2,
      maxPlayers: 8,
      pricePerPlayer: 45000,
    },
  ]);
  console.log("[seed] 2 sesi open play dibuat.");
}

async function main() {
  await seedVenue();
  await seedCoaches();
  await seedPlans();
  await seedOpenPlay();
  console.log("[seed] selesai.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] gagal:", err);
    process.exit(1);
  });
