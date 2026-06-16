import { describe, expect, it } from "vitest";
import { normalizeWa } from "./booking";
import { overlaps } from "./availability";
import { ymdOffset } from "./tz";

describe("normalizeWa", () => {
  it("08xx -> 628xx", () => expect(normalizeWa("081234567890")).toBe("6281234567890"));
  it("+62 -> 62", () => expect(normalizeWa("+6281234567890")).toBe("6281234567890"));
  it("8xx -> 628xx", () => expect(normalizeWa("81234567890")).toBe("6281234567890"));
  it("buang spasi/strip", () => expect(normalizeWa("0812-3456 7890")).toBe("6281234567890"));
});

describe("overlaps (interval jam)", () => {
  it("10-12 bentrok dengan 11-12", () => expect(overlaps(10, 2, 11, 1)).toBe(true));
  it("10-12 tak bentrok dengan 12-13 (batas kanan eksklusif)", () =>
    expect(overlaps(10, 2, 12, 1)).toBe(false));
  it("10-11 tak bentrok dengan 9-10", () => expect(overlaps(10, 1, 9, 1)).toBe(false));
  it("sama persis = bentrok", () => expect(overlaps(10, 1, 10, 1)).toBe(true));
});

describe("ymdOffset", () => {
  it("tambah hari", () => expect(ymdOffset("2025-06-16", 1)).toBe("2025-06-17"));
  it("lintas bulan", () => expect(ymdOffset("2025-06-30", 1)).toBe("2025-07-01"));
  it("lintas tahun", () => expect(ymdOffset("2025-12-31", 1)).toBe("2026-01-01"));
  it("mundur", () => expect(ymdOffset("2025-06-16", -1)).toBe("2025-06-15"));
});
