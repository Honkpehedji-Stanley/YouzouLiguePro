"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/league";
import { inputClass, selectClass, labelClass } from "./formStyles";

type TeamOption = { id: string; name: string; category: (typeof CATEGORIES)[number] };
type SeasonOption = { id: string; label: string };

export function TeamAssignmentFields({
  teams,
  seasons,
  defaultTeamId,
  defaultSeasonId,
  defaultJerseyNumber,
  defaultIsCaptain,
}: {
  teams: TeamOption[];
  seasons: SeasonOption[];
  defaultTeamId?: string;
  defaultSeasonId?: string;
  defaultJerseyNumber?: number | string;
  defaultIsCaptain?: boolean;
}) {
  const [teamId, setTeamId] = useState(defaultTeamId ?? "");
  const isFreeAgent = teamId === "";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelClass} htmlFor="teamId">
          Équipe
        </label>
        <select
          id="teamId"
          name="teamId"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className={selectClass}
        >
          <option value="">🕊️ Agent libre (aucune équipe)</option>
          {CATEGORIES.map((category) => (
            <optgroup key={category} label={CATEGORY_LABELS[category]}>
              {teams
                .filter((team) => team.category === category)
                .map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <div className="w-1/2">
          <label className={labelClass} htmlFor="seasonId">
            Saison
          </label>
          <select
            id="seasonId"
            name="seasonId"
            defaultValue={defaultSeasonId}
            disabled={isFreeAgent}
            className={selectClass}
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-1/4">
          <label className={labelClass} htmlFor="jerseyNumber">
            N°
          </label>
          <input
            id="jerseyNumber"
            name="jerseyNumber"
            type="number"
            min={0}
            max={99}
            defaultValue={defaultJerseyNumber ?? ""}
            disabled={isFreeAgent}
            className={inputClass}
          />
        </div>
        <div className="flex w-1/4 items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isCaptain"
              defaultChecked={defaultIsCaptain}
              disabled={isFreeAgent}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
            />
            Capitaine
          </label>
        </div>
      </div>
      {isFreeAgent && (
        <p className="text-xs text-slate-400">
          Ce joueur sera enregistré sans équipe et apparaîtra dans les agents libres.
        </p>
      )}
    </div>
  );
}
