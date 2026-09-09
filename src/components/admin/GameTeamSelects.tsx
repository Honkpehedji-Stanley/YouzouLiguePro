"use client";

import { useState } from "react";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/league";
import { labelClass, selectClass } from "./formStyles";

type TeamOption = { id: string; name: string; category: (typeof CATEGORIES)[number] };

// Évite l'erreur la plus fréquente en saisie rapide : programmer un match d'une
// équipe contre elle-même. L'équipe déjà choisie d'un côté est désactivée de l'autre.
export function GameTeamSelects({ teams }: { teams: TeamOption[] }) {
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");

  const renderOptions = (excludeId: string) =>
    CATEGORIES.map((category) => (
      <optgroup key={category} label={CATEGORY_LABELS[category]}>
        {teams
          .filter((team) => team.category === category)
          .map((team) => (
            <option key={team.id} value={team.id} disabled={team.id === excludeId}>
              {team.name}
            </option>
          ))}
      </optgroup>
    ));

  return (
    <>
      <div>
        <label className={labelClass} htmlFor="homeTeamId">
          Équipe à domicile
        </label>
        <select
          id="homeTeamId"
          name="homeTeamId"
          required
          value={homeTeamId}
          onChange={(e) => setHomeTeamId(e.target.value)}
          className={selectClass}
        >
          <option value="">Équipe à domicile</option>
          {renderOptions(awayTeamId)}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="awayTeamId">
          Équipe à l&apos;extérieur
        </label>
        <select
          id="awayTeamId"
          name="awayTeamId"
          required
          value={awayTeamId}
          onChange={(e) => setAwayTeamId(e.target.value)}
          className={selectClass}
        >
          <option value="">Équipe à l&apos;extérieur</option>
          {renderOptions(homeTeamId)}
        </select>
      </div>
    </>
  );
}
