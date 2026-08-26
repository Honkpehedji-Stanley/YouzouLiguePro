"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type GameRow = {
  id: string;
  scheduledAt: string; // ISO
  venue: string | null;
  phase: string | null;
  status: "SCHEDULED" | "LIVE" | "FINAL" | "POSTPONED" | "CANCELLED";
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { slug: string; name: string };
  awayTeam: { slug: string; name: string };
};

type TeamOption = { slug: string; name: string };

const STATUS_LABELS: Record<GameRow["status"], string> = {
  SCHEDULED: "À venir",
  LIVE: "En cours",
  FINAL: "Terminé",
  POSTPONED: "Reporté",
  CANCELLED: "Annulé",
};

const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const selectClass =
  "rounded-md border border-black/20 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none";

function formatDayHeading(date: Date) {
  const formatted = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(
    date
  );
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(date);
}

export function ScheduleExplorer({ games, teams }: { games: GameRow[]; teams: TeamOption[] }) {
  const [monthFilter, setMonthFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hidePast, setHidePast] = useState(false);

  const phases = useMemo(() => {
    const set = new Set<string>();
    for (const g of games) if (g.phase) set.add(g.phase);
    return Array.from(set);
  }, [games]);

  const monthsPresent = useMemo(() => {
    const set = new Set<number>();
    for (const g of games) set.add(new Date(g.scheduledAt).getMonth());
    return Array.from(set).sort((a, b) => a - b);
  }, [games]);

  const now = Date.now();

  const filtered = useMemo(() => {
    return games.filter((g) => {
      const date = new Date(g.scheduledAt);
      if (monthFilter !== "" && date.getMonth() !== Number(monthFilter)) return false;
      if (teamFilter && g.homeTeam.slug !== teamFilter && g.awayTeam.slug !== teamFilter) return false;
      if (phaseFilter && g.phase !== phaseFilter) return false;
      if (statusFilter && g.status !== statusFilter) return false;
      if (hidePast && date.getTime() < now && g.status !== "LIVE") return false;
      return true;
    });
  }, [games, monthFilter, teamFilter, phaseFilter, statusFilter, hidePast, now]);

  const groups = useMemo(() => {
    const map = new Map<string, GameRow[]>();
    for (const g of filtered) {
      const key = new Date(g.scheduledAt).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    }
    return Array.from(map.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
  }, [filtered]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className={selectClass}>
          <option value="">Tous les mois</option>
          {monthsPresent.map((m) => (
            <option key={m} value={m}>
              {MONTH_LABELS[m]}
            </option>
          ))}
        </select>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className={selectClass}>
          <option value="">Toutes les équipes</option>
          {teams.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className={selectClass}>
          <option value="">Toutes les phases</option>
          {phases.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="ml-2 flex items-center gap-1.5 text-sm text-black/70">
          <input type="checkbox" checked={hidePast} onChange={(e) => setHidePast(e.target.checked)} />
          Masquer les dates passées
        </label>
      </div>

      {groups.length === 0 && (
        <p className="py-6 text-center text-black/50">Aucun match ne correspond à ces critères.</p>
      )}

      <div className="flex flex-col gap-8">
        {groups.map(([dayKey, dayGames]) => (
          <section key={dayKey}>
            <div className="mb-3 flex items-baseline justify-between border-b border-black/10 pb-1">
              <h3 className="font-bold">{formatDayHeading(new Date(dayKey))}</h3>
              <span className="text-sm text-black/50">
                {dayGames.length} match{dayGames.length > 1 ? "s" : ""}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {dayGames.map((game) => (
                <li key={game.id}>
                  <Link
                    href={`/matchs/${game.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-black/10 px-4 py-3 hover:border-brand"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-sm text-black/50">
                        {formatTime(new Date(game.scheduledAt))}
                      </span>
                      <span className="font-medium">
                        {game.homeTeam.name} vs {game.awayTeam.name}
                      </span>
                      {game.phase && (
                        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/60">
                          {game.phase}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      {game.venue && <span className="text-black/50">{game.venue}</span>}
                      {game.status === "FINAL" ? (
                        <span className="font-semibold">
                          {game.homeScore} - {game.awayScore}
                        </span>
                      ) : (
                        <span className="text-black/60">{STATUS_LABELS[game.status]}</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
