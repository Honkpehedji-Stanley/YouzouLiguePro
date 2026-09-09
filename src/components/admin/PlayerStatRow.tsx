"use client";

import { useState } from "react";
import { NumberStepper } from "@/components/NumberStepper";

export function PlayerStatRow({
  playerName,
  prefix,
  existing,
}: {
  playerName: string;
  prefix: string;
  existing?: {
    points: number;
    reboundsOff: number;
    reboundsDef: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fouls: number;
    minutes: number;
    fgMade: number;
    fgAttempted: number;
    threeMade: number;
    threeAttempted: number;
    ftMade: number;
    ftAttempted: number;
  };
}) {
  const [minutes, setMinutes] = useState(existing?.minutes ?? 0);
  const [activityStats, setActivityStats] = useState({
    points: existing?.points ?? 0,
    reboundsOff: existing?.reboundsOff ?? 0,
    reboundsDef: existing?.reboundsDef ?? 0,
    assists: existing?.assists ?? 0,
    steals: existing?.steals ?? 0,
    blocks: existing?.blocks ?? 0,
  });

  const hasActivityWithoutMinutes =
    minutes === 0 && Object.values(activityStats).some((v) => v > 0);

  const trackActivity = (field: keyof typeof activityStats) => (value: number) =>
    setActivityStats((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="py-4 first:pt-4">
      <p className="mb-1 font-medium text-slate-800">{playerName}</p>
      {hasActivityWithoutMinutes && (
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-amber-600">
          ⚠ Minutes à 0 avec des statistiques saisies — ce joueur sera exclu des moyennes tant que les
          minutes ne sont pas renseignées.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <NumberStepper name={`${prefix}points`} label="Pts" defaultValue={existing?.points} onValueChange={trackActivity("points")} />
        <NumberStepper
          name={`${prefix}reboundsOff`}
          label="Reb.O"
          defaultValue={existing?.reboundsOff}
          onValueChange={trackActivity("reboundsOff")}
        />
        <NumberStepper
          name={`${prefix}reboundsDef`}
          label="Reb.D"
          defaultValue={existing?.reboundsDef}
          onValueChange={trackActivity("reboundsDef")}
        />
        <NumberStepper name={`${prefix}assists`} label="Pd" defaultValue={existing?.assists} onValueChange={trackActivity("assists")} />
        <NumberStepper name={`${prefix}steals`} label="Int" defaultValue={existing?.steals} onValueChange={trackActivity("steals")} />
        <NumberStepper name={`${prefix}blocks`} label="Ct" defaultValue={existing?.blocks} onValueChange={trackActivity("blocks")} />
        <NumberStepper name={`${prefix}turnovers`} label="Ballons perdus" defaultValue={existing?.turnovers} />
        <NumberStepper name={`${prefix}fouls`} label="Fautes" defaultValue={existing?.fouls} />
        <NumberStepper name={`${prefix}minutes`} label="Min" defaultValue={existing?.minutes} onValueChange={setMinutes} />
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-brand">Détail des tirs</summary>
        <div className="mt-2 flex flex-wrap gap-3">
          <NumberStepper name={`${prefix}fgMade`} label="2/3pts réussis" defaultValue={existing?.fgMade} />
          <NumberStepper name={`${prefix}fgAttempted`} label="2/3pts tentés" defaultValue={existing?.fgAttempted} />
          <NumberStepper name={`${prefix}threeMade`} label="3pts réussis" defaultValue={existing?.threeMade} />
          <NumberStepper name={`${prefix}threeAttempted`} label="3pts tentés" defaultValue={existing?.threeAttempted} />
          <NumberStepper name={`${prefix}ftMade`} label="LF réussis" defaultValue={existing?.ftMade} />
          <NumberStepper name={`${prefix}ftAttempted`} label="LF tentés" defaultValue={existing?.ftAttempted} />
        </div>
      </details>
    </div>
  );
}
