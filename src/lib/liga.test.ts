import { describe, expect, it } from "vitest";
import { roundRobin, sortStandings } from "./liga";

describe("roundRobin", () => {
  it("8 tim -> 7 ronde x 4 match = 28, tiap pasangan unik sekali", () => {
    const ids = Array.from({ length: 8 }, (_, i) => `t${i}`);
    const rounds = roundRobin(ids);
    expect(rounds).toHaveLength(7);
    rounds.forEach((r) => expect(r).toHaveLength(4));

    const seen = new Set<string>();
    let total = 0;
    for (const round of rounds) {
      for (const [a, b] of round) {
        expect(a).not.toBe(b); // tak main lawan diri sendiri
        const key = [a, b].sort().join("|");
        expect(seen.has(key)).toBe(false); // tiap pasangan cuma sekali
        seen.add(key);
        total++;
      }
    }
    expect(total).toBe(28); // C(8,2)
  });

  it("tiap tim main 7 kali (lawan semua tim lain)", () => {
    const ids = ["a", "b", "c", "d"];
    const count = new Map(ids.map((i) => [i, 0]));
    for (const round of roundRobin(ids))
      for (const [a, b] of round) {
        count.set(a, count.get(a)! + 1);
        count.set(b, count.get(b)! + 1);
      }
    for (const i of ids) expect(count.get(i)).toBe(3);
  });
});

describe("sortStandings", () => {
  const base = { poin: 0, selisih: 0, gameMenang: 0, wo: 0 };
  it("urut: poin > selisih > game menang > WO sedikit", () => {
    const rows = [
      { ...base, poin: 6, selisih: 1, gameMenang: 5, wo: 0 }, // C
      { ...base, poin: 9, selisih: 2, gameMenang: 4, wo: 0 }, // A
      { ...base, poin: 6, selisih: 2, gameMenang: 5, wo: 1 }, // B (selisih lebih tinggi dari C)
    ];
    const sorted = [...rows].sort(sortStandings);
    expect(sorted.map((r) => r.poin)).toEqual([9, 6, 6]);
    // antar poin 6: selisih 2 (B) di atas selisih 1 (C)
    expect(sorted[1].selisih).toBe(2);
    expect(sorted[2].selisih).toBe(1);
  });

  it("tiebreak WO paling sedikit saat poin/selisih/GM sama", () => {
    const a = { ...base, poin: 3, selisih: 0, gameMenang: 2, wo: 2 };
    const b = { ...base, poin: 3, selisih: 0, gameMenang: 2, wo: 0 };
    expect([a, b].sort(sortStandings)[0]).toBe(b); // wo lebih sedikit di atas
  });
});
