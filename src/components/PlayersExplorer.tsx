"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/PlayerAvatar";

export type PlayerRow = {
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
  secondaryPosition: string | null;
  heightCm: number | null;
  weightKg: number | null;
  age: number | null;
  nationality: string | null;
  isCurrent: boolean;
  lastTeamName: string | null;
  lastSeasonLabel: string | null;
};

export type TeamOption = { slug: string; name: string };

const POSITIONS = ["PG", "SG", "SF", "PF", "C"] as const;
const PAGE_SIZE = 25;

const TABS = [
  { key: "actuels", label: "Joueurs actuels" },
  { key: "transactions", label: "Transactions" },
  { key: "agents-libres", label: "Agents libres" },
  { key: "awards", label: "Récompenses" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const selectClass =
  "rounded-md border border-black/20 bg-white px-3 py-1.5 text-sm focus:border-brand focus:outline-none";

function filterRows(
  list: PlayerRow[],
  {
    query,
    teamFilter,
    positionFilter,
    nationalityFilter,
    checkTeam,
  }: { query: string; teamFilter: string; positionFilter: string; nationalityFilter: string; checkTeam: boolean }
) {
  const q = query.trim().toLowerCase();
  return list.filter((row) => {
    if (q) {
      const haystack = `${row.firstName} ${row.lastName} ${row.teamName ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (checkTeam && teamFilter && row.teamSlug !== teamFilter) return false;
    if (positionFilter && row.position !== positionFilter && row.secondaryPosition !== positionFilter) {
      return false;
    }
    if (nationalityFilter && row.nationality !== nationalityFilter) return false;
    return true;
  });
}

function usePagination<T>(rows: T[]) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  return { page: safePage, setPage, pageCount, pageRows };
}

function Pagination({
  page,
  pageCount,
  total,
  onChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-black/60">
      <p>
        {total} ligne{total > 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-black/20 px-2.5 py-1 disabled:opacity-30"
        >
          ←
        </button>
        <span>
          Page {page} sur {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          className="rounded-md border border-black/20 px-2.5 py-1 disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
}

function PlayersTable({
  rows,
  mode,
}: {
  rows: PlayerRow[];
  mode: "current" | "free-agent";
}) {
  const { page, setPage, pageCount, pageRows } = usePagination(rows);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wide text-black/50">
              <th className="py-2 pr-3">Joueur</th>
              <th className="py-2 pr-3">{mode === "current" ? "Équipe" : "Dernière équipe"}</th>
              {mode === "current" && <th className="py-2 pr-3 text-right">N°</th>}
              <th className="py-2 pr-3">Poste</th>
              <th className="py-2 pr-3 text-right">Taille</th>
              <th className="py-2 pr-3 text-right">Poids</th>
              <th className="py-2 pr-3 text-right">Âge</th>
              <th className="py-2 pr-3">Nationalité</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                <td className="py-2 pr-3">
                  <Link
                    href={`/joueurs/${row.slug}`}
                    className="flex items-center gap-2 font-semibold hover:text-brand hover:underline"
                  >
                    <PlayerAvatar photoUrl={row.photoUrl} name={`${row.firstName} ${row.lastName}`} size={32} />
                    {row.firstName} {row.lastName}
                  </Link>
                </td>
                <td className="py-2 pr-3">
                  {mode === "current" ? (
                    row.teamSlug ? (
                      <Link
                        href={`/equipes/${row.teamSlug}`}
                        className="hover:text-brand hover:underline"
                        style={row.teamColor ? { color: row.teamColor } : undefined}
                      >
                        {row.teamName}
                      </Link>
                    ) : (
                      <span className="text-black/50">Agent libre</span>
                    )
                  ) : row.lastTeamName ? (
                    <span>
                      {row.lastTeamName}
                      {row.lastSeasonLabel && (
                        <span className="text-black/50"> ({row.lastSeasonLabel})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-black/50">Aucune équipe précédente</span>
                  )}
                </td>
                {mode === "current" && (
                  <td className="py-2 pr-3 text-right">{row.jerseyNumber ?? "—"}</td>
                )}
                <td className="py-2 pr-3">
                  {row.position
                    ? `${row.position}${row.secondaryPosition ? `/${row.secondaryPosition}` : ""}`
                    : "—"}
                </td>
                <td className="py-2 pr-3 text-right">{row.heightCm ? `${row.heightCm} cm` : "—"}</td>
                <td className="py-2 pr-3 text-right">{row.weightKg ? `${row.weightKg} kg` : "—"}</td>
                <td className="py-2 pr-3 text-right">{row.age ?? "—"}</td>
                <td className="py-2 pr-3">{row.nationality ?? "—"}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={mode === "current" ? 8 : 7} className="py-6 text-center text-black/50">
                  Aucun joueur ne correspond à ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} total={rows.length} onChange={setPage} />
    </div>
  );
}

const AWARD_CATEGORIES = [
  "MVP de la saison",
  "Meilleur défenseur",
  "Recrue de l'année",
  "Meilleur sixième homme",
  "Plus belle progression",
  "Joueur du mois",
];

function AwardsPlaceholder() {
  return (
    <div>
      <p className="mb-6 text-sm text-black/60">
        Les récompenses de la ligue seront décernées à l&apos;issue de la saison. Voici les catégories prévues :
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {AWARD_CATEGORIES.map((title) => (
          <li key={title} className="rounded-lg border border-black/10 p-4">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-black/50">Pas encore attribué</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TransactionsPlaceholder() {
  return (
    <div className="rounded-lg border border-dashed border-black/20 p-8 text-center text-black/60">
      <p className="font-medium">Aucune transaction enregistrée pour l&apos;instant.</p>
      <p className="mt-1 text-sm">
        Les transferts, échanges et signatures de la ligue apparaîtront ici dès qu&apos;ils seront actés.
      </p>
    </div>
  );
}

export function PlayersExplorer({
  rows,
  teams,
  seasonLabel,
}: {
  rows: PlayerRow[];
  teams: TeamOption[];
  seasonLabel: string | null;
}) {
  const [tab, setTab] = useState<TabKey>("actuels");
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [showHistoric, setShowHistoric] = useState(false);

  const nationalities = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) if (row.nationality) set.add(row.nationality);
    return Array.from(set).sort();
  }, [rows]);

  const currentRows = useMemo(() => (showHistoric ? rows : rows.filter((r) => r.isCurrent)), [rows, showHistoric]);
  const freeAgentRows = useMemo(() => rows.filter((r) => !r.isCurrent), [rows]);

  const filteredCurrent = useMemo(
    () =>
      filterRows(currentRows, {
        query,
        teamFilter,
        positionFilter,
        nationalityFilter,
        checkTeam: true,
      }),
    [currentRows, query, teamFilter, positionFilter, nationalityFilter]
  );
  const filteredFreeAgents = useMemo(
    () =>
      filterRows(freeAgentRows, {
        query,
        teamFilter: "",
        positionFilter,
        nationalityFilter,
        checkTeam: false,
      }),
    [freeAgentRows, query, positionFilter, nationalityFilter]
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-black/10 text-sm font-semibold">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 pb-3 pt-1 transition ${
              tab === t.key ? "border-brand text-brand" : "border-transparent text-black/50 hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === "actuels" || tab === "agents-libres") && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className={selectClass} disabled={tab === "agents-libres"}>
            <option value="">Toutes les équipes</option>
            {teams.map((team) => (
              <option key={team.slug} value={team.slug}>
                {team.name}
              </option>
            ))}
          </select>
          <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className={selectClass}>
            <option value="">Tous les postes</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
          <select value={nationalityFilter} onChange={(e) => setNationalityFilter(e.target.value)} className={selectClass}>
            <option value="">Toutes les nationalités</option>
            {nationalities.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <select className={selectClass} disabled defaultValue="">
            <option value="">Toutes les universités</option>
          </select>
          {tab === "actuels" && (
            <label className="ml-2 flex items-center gap-1.5 text-sm text-black/70">
              <input
                type="checkbox"
                checked={showHistoric}
                onChange={(e) => setShowHistoric(e.target.checked)}
              />
              Afficher l&apos;historique
            </label>
          )}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un joueur ou une équipe"
            className="ml-auto w-64 rounded-md border border-black/20 px-3 py-1.5 text-sm"
          />
        </div>
      )}

      {tab === "actuels" && (
        <>
          {seasonLabel && <p className="mb-2 text-sm text-black/50">{seasonLabel}</p>}
          <PlayersTable rows={filteredCurrent} mode="current" />
        </>
      )}
      {tab === "agents-libres" && <PlayersTable rows={filteredFreeAgents} mode="free-agent" />}
      {tab === "transactions" && <TransactionsPlaceholder />}
      {tab === "awards" && <AwardsPlaceholder />}
    </div>
  );
}
