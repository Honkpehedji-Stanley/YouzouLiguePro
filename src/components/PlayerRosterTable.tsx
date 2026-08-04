"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { initials } from "@/lib/playerDisplay";

export type RosterRow = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  teamName: string | null;
  teamSlug: string | null;
  teamColor: string | null;
  jerseyNumber: number | null;
  position: string | null;
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
  nationality: string | null;
};

export function PlayerRosterTable({ rows }: { rows: RosterRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      `${row.firstName} ${row.lastName}`.toLowerCase().includes(q) ||
      (row.teamName ?? "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-black/60">
          {filtered.length} joueur{filtered.length > 1 ? "s" : ""}
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un joueur ou une équipe"
          className="w-64 rounded-md border border-black/20 px-3 py-1.5 text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wide text-black/50">
              <th className="py-2 pr-3">Joueur</th>
              <th className="py-2 pr-3">Équipe</th>
              <th className="py-2 pr-3 text-right">N°</th>
              <th className="py-2 pr-3">Poste</th>
              <th className="py-2 pr-3 text-right">Taille</th>
              <th className="py-2 pr-3 text-right">Poids</th>
              <th className="py-2 pr-3 text-right">Âge</th>
              <th className="py-2 pr-3">Nationalité</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                <td className="py-2 pr-3">
                  <Link
                    href={`/joueurs/${row.slug}`}
                    className="flex items-center gap-2 font-semibold hover:text-brand hover:underline"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-bold text-black/60">
                      {initials(row.firstName, row.lastName)}
                    </span>
                    {row.firstName} {row.lastName}
                  </Link>
                </td>
                <td className="py-2 pr-3">
                  {row.teamSlug ? (
                    <Link
                      href={`/equipes/${row.teamSlug}`}
                      className="hover:text-brand hover:underline"
                      style={row.teamColor ? { color: row.teamColor } : undefined}
                    >
                      {row.teamName}
                    </Link>
                  ) : (
                    <span className="text-black/50">Agent libre</span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right">{row.jerseyNumber ?? "—"}</td>
                <td className="py-2 pr-3">{row.position ?? "—"}</td>
                <td className="py-2 pr-3 text-right">
                  {row.heightCm ? `${row.heightCm} cm` : "—"}
                </td>
                <td className="py-2 pr-3 text-right">
                  {row.weightKg ? `${row.weightKg} kg` : "—"}
                </td>
                <td className="py-2 pr-3 text-right">{row.age ?? "—"}</td>
                <td className="py-2 pr-3">{row.nationality ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-black/50">
                  Aucun joueur ne correspond à cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
