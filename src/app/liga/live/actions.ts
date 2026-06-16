"use server";

import { getLiveMatchesWithTeams } from "@/lib/liga";
import type { MatchView } from "@/components/match-card";

export async function getLiveAction(): Promise<MatchView[]> {
  return getLiveMatchesWithTeams();
}
