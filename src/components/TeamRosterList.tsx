"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";

export type TeamRosterEntry = {
  id: string;
  jerseyNumber: number | null;
  isCaptain: boolean;
  player: {
    slug: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
    position: string | null;
    secondaryPosition: string | null;
  };
};

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;

export function TeamRosterList({ roster }: { roster: TeamRosterEntry[] }) {
  const [positionFilter, setPositionFilter] = useState("");

  const filtered = useMemo(() => {
    if (!positionFilter) return roster;
    return roster.filter(
      (entry) =>
        entry.player.position === positionFilter || entry.player.secondaryPosition === positionFilter
    );
  }, [roster, positionFilter]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="rounded-md border border-black/20 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">Tous les postes</option>
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
        <span className="text-sm text-black/50">
          {filtered.length} joueur{filtered.length > 1 ? "s" : ""}
        </span>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {filtered.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/joueurs/${entry.player.slug}`}
              className="flex items-center justify-between gap-2 rounded-md border border-black/10 px-3 py-2 hover:border-brand"
            >
              <span className="flex items-center gap-2">
                <PlayerAvatar
                  photoUrl={entry.player.photoUrl}
                  name={`${entry.player.firstName} ${entry.player.lastName}`}
                  size={32}
                />
                {entry.player.firstName} {entry.player.lastName}
                {entry.isCaptain && <span className="text-xs font-semibold text-brand">(C)</span>}
              </span>
              <span className="text-sm text-black/60">
                {entry.jerseyNumber != null && `#${entry.jerseyNumber}`} {entry.player.position}
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <p className="text-black/60">Aucun joueur ne correspond à ce filtre.</p>
        )}
      </ul>
    </div>
  );
}
