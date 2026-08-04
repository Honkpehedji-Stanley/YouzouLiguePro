"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { computeSeasonSplits, type GameStatRow } from "@/lib/statSplits";

export type RecentGameRow = {
  gameId: string;
  dateLabel: string;
  opponentName: string;
  opponentSlug: string;
  isHome: boolean;
  result: "V" | "D" | null;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
};

const TABS = ["profil", "stats", "bio", "videos"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  profil: "Profil",
  stats: "Stats",
  bio: "Bio",
  videos: "Vidéos",
};

function VideoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-md bg-black/5 text-black/30">
      <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      <span className="text-xs">{label}</span>
    </div>
  );
}

const STAT_COLUMNS: { key: keyof ReturnType<typeof computeSeasonSplits>[number]; label: string }[] = [
  { key: "gp", label: "MJ" },
  { key: "min", label: "MIN" },
  { key: "pts", label: "PTS" },
  { key: "fgm", label: "TAM" },
  { key: "fga", label: "TAT" },
  { key: "fgPct", label: "TA%" },
  { key: "tpm", label: "3PM" },
  { key: "tpa", label: "3PA" },
  { key: "tpPct", label: "3P%" },
  { key: "ftm", label: "LFM" },
  { key: "fta", label: "LFT" },
  { key: "ftPct", label: "LF%" },
  { key: "oreb", label: "REBO" },
  { key: "dreb", label: "REBD" },
  { key: "reb", label: "REB" },
  { key: "ast", label: "PD" },
  { key: "tov", label: "BP" },
  { key: "stl", label: "INT" },
  { key: "blk", label: "CT" },
  { key: "pf", label: "F" },
  { key: "fp", label: "FP" },
  { key: "dd2", label: "DD2" },
  { key: "td3", label: "TD3" },
];

export function PlayerTabs({
  bio,
  recentGames,
  splitsRows,
  fallbackSeasons,
}: {
  bio: string | null;
  recentGames: RecentGameRow[];
  splitsRows: GameStatRow[];
  fallbackSeasons: { seasonId: string; seasonLabel: string; teamName: string }[];
}) {
  const [tab, setTab] = useState<Tab>("profil");
  const [phase, setPhase] = useState<string>("all");

  const phases = useMemo(() => {
    const set = new Set(splitsRows.map((r) => r.phase).filter((p): p is string => !!p));
    return Array.from(set).sort();
  }, [splitsRows]);

  const filteredRows = useMemo(() => {
    if (phase === "all") return splitsRows;
    return splitsRows.filter((r) => r.phase === phase);
  }, [splitsRows, phase]);

  const splits = useMemo(
    () => computeSeasonSplits(filteredRows, fallbackSeasons),
    [filteredRows, fallbackSeasons]
  );

  return (
    <div>
      <div className="mb-6 flex gap-6 border-b border-black/10 text-sm font-semibold">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-2 ${
              tab === t ? "border-brand text-brand" : "border-transparent text-black/50 hover:text-black"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === "profil" && (
        <div className="flex flex-col gap-10">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Dernières vidéos</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <VideoPlaceholder key={n} label="Vidéo à venir" />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">5 derniers matchs</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase text-black/50">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Adversaire</th>
                    <th className="py-2 pr-3">Résultat</th>
                    <th className="py-2 pr-3 text-right">MIN</th>
                    <th className="py-2 pr-3 text-right">PTS</th>
                    <th className="py-2 pr-3 text-right">REB</th>
                    <th className="py-2 pr-3 text-right">PD</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGames.map((g) => (
                    <tr key={g.gameId} className="border-b border-black/5">
                      <td className="py-2 pr-3">{g.dateLabel}</td>
                      <td className="py-2 pr-3">
                        <Link href={`/equipes/${g.opponentSlug}`} className="hover:text-brand hover:underline">
                          {g.isHome ? "vs" : "@"} {g.opponentName}
                        </Link>
                      </td>
                      <td className="py-2 pr-3">{g.result ?? "—"}</td>
                      <td className="py-2 pr-3 text-right">{g.minutes}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{g.points}</td>
                      <td className="py-2 pr-3 text-right">{g.rebounds}</td>
                      <td className="py-2 pr-3 text-right">{g.assists}</td>
                    </tr>
                  ))}
                  {recentGames.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-black/50">
                        Aucun match enregistré pour l’instant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Actualités</h2>
            <p className="text-black/60">Aucune actualité pour l’instant.</p>
          </section>
        </div>
      )}

      {tab === "stats" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Traditional Splits</h2>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="rounded-md border border-black/20 px-2 py-1 text-sm"
            >
              <option value="all">Toutes les phases</option>
              {phases.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              {phases.length === 0 && (
                <>
                  <option value="Phase 1">Phase 1</option>
                  <option value="Phase 2">Phase 2</option>
                  <option value="Phase 3">Phase 3</option>
                  <option value="Final 4">Final 4</option>
                </>
              )}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-xs">
              <thead>
                <tr className="border-b border-black/10 text-left font-semibold uppercase text-black/50">
                  <th className="py-2 pr-3">Saison</th>
                  <th className="py-2 pr-3">Équipe</th>
                  {STAT_COLUMNS.map((col) => (
                    <th key={col.key} className="py-2 pr-3 text-right">
                      {col.label}
                    </th>
                  ))}
                  <th className="py-2 pr-3 text-right">+/-</th>
                </tr>
              </thead>
              <tbody>
                {splits.map((row) => (
                  <tr key={row.seasonId} className="border-b border-black/5">
                    <td className="py-2 pr-3 font-semibold">{row.seasonLabel}</td>
                    <td className="py-2 pr-3">{row.teamName}</td>
                    {STAT_COLUMNS.map((col) => {
                      const value = col.key === "gp" ? row.gp : row.gp === 0 ? null : row[col.key];
                      return (
                        <td key={col.key} className="py-2 pr-3 text-right">
                          {value === null || value === undefined ? "—" : value}
                        </td>
                      );
                    })}
                    <td className="py-2 pr-3 text-right">—</td>
                  </tr>
                ))}
                {splits.length === 0 && (
                  <tr>
                    <td colSpan={STAT_COLUMNS.length + 3} className="py-4 text-black/50">
                      Aucune statistique enregistrée pour l’instant.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "bio" && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Biographie</h2>
          <p className="max-w-2xl text-black/80">{bio || "Aucune biographie pour l’instant."}</p>
        </div>
      )}

      {tab === "videos" && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Vidéos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <VideoPlaceholder key={n} label="Vidéo à venir" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
