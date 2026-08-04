export type GameStatRow = {
  gameId: string;
  seasonId: string;
  seasonLabel: string;
  phase: string | null;
  teamName: string;
  minutes: number;
  points: number;
  fgMade: number;
  fgAttempted: number;
  threeMade: number;
  threeAttempted: number;
  ftMade: number;
  ftAttempted: number;
  reboundsOff: number;
  reboundsDef: number;
  assists: number;
  turnovers: number;
  steals: number;
  blocks: number;
  fouls: number;
  didNotPlay: boolean;
};

export type SeasonSplitRow = {
  seasonId: string;
  seasonLabel: string;
  teamName: string;
  gp: number;
  min: number;
  pts: number;
  fgm: number;
  fga: number;
  fgPct: number | null;
  tpm: number;
  tpa: number;
  tpPct: number | null;
  ftm: number;
  fta: number;
  ftPct: number | null;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  tov: number;
  stl: number;
  blk: number;
  pf: number;
  fp: number;
  dd2: number;
  td3: number;
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function fantasyPoints(row: GameStatRow) {
  return (
    row.points +
    1.2 * (row.reboundsOff + row.reboundsDef) +
    1.5 * row.assists +
    3 * row.steals +
    3 * row.blocks -
    row.turnovers
  );
}

function isDoubleDigit(value: number) {
  return value >= 10;
}

export function computeSeasonSplits(
  rows: GameStatRow[],
  fallback: { seasonId: string; seasonLabel: string; teamName: string }[]
): SeasonSplitRow[] {
  const bySeasin = new Map<string, GameStatRow[]>();
  for (const row of rows) {
    if (!bySeasin.has(row.seasonId)) bySeasin.set(row.seasonId, []);
    bySeasin.get(row.seasonId)!.push(row);
  }

  const seasonIds = new Set([...bySeasin.keys(), ...fallback.map((f) => f.seasonId)]);

  const result: SeasonSplitRow[] = [];
  for (const seasonId of seasonIds) {
    const seasonRows = (bySeasin.get(seasonId) ?? []).filter((r) => !r.didNotPlay);
    const info =
      fallback.find((f) => f.seasonId === seasonId) ??
      (() => {
        const any = bySeasin.get(seasonId)![0];
        return { seasonId, seasonLabel: any.seasonLabel, teamName: any.teamName };
      })();

    const gp = seasonRows.length;
    if (gp === 0) {
      result.push({
        seasonId,
        seasonLabel: info.seasonLabel,
        teamName: info.teamName,
        gp: 0,
        min: 0,
        pts: 0,
        fgm: 0,
        fga: 0,
        fgPct: null,
        tpm: 0,
        tpa: 0,
        tpPct: null,
        ftm: 0,
        fta: 0,
        ftPct: null,
        oreb: 0,
        dreb: 0,
        reb: 0,
        ast: 0,
        tov: 0,
        stl: 0,
        blk: 0,
        pf: 0,
        fp: 0,
        dd2: 0,
        td3: 0,
      });
      continue;
    }

    const totals = seasonRows.reduce(
      (acc, r) => {
        acc.min += r.minutes;
        acc.pts += r.points;
        acc.fgm += r.fgMade;
        acc.fga += r.fgAttempted;
        acc.tpm += r.threeMade;
        acc.tpa += r.threeAttempted;
        acc.ftm += r.ftMade;
        acc.fta += r.ftAttempted;
        acc.oreb += r.reboundsOff;
        acc.dreb += r.reboundsDef;
        acc.ast += r.assists;
        acc.tov += r.turnovers;
        acc.stl += r.steals;
        acc.blk += r.blocks;
        acc.pf += r.fouls;
        acc.fp += fantasyPoints(r);

        const reb = r.reboundsOff + r.reboundsDef;
        const categories = [r.points, reb, r.assists, r.steals, r.blocks].filter(isDoubleDigit).length;
        if (categories >= 2) acc.dd2 += 1;
        if (categories >= 3) acc.td3 += 1;

        return acc;
      },
      {
        min: 0,
        pts: 0,
        fgm: 0,
        fga: 0,
        tpm: 0,
        tpa: 0,
        ftm: 0,
        fta: 0,
        oreb: 0,
        dreb: 0,
        ast: 0,
        tov: 0,
        stl: 0,
        blk: 0,
        pf: 0,
        fp: 0,
        dd2: 0,
        td3: 0,
      }
    );

    result.push({
      seasonId,
      seasonLabel: info.seasonLabel,
      teamName: info.teamName,
      gp,
      min: round1(totals.min / gp),
      pts: round1(totals.pts / gp),
      fgm: round1(totals.fgm / gp),
      fga: round1(totals.fga / gp),
      fgPct: totals.fga > 0 ? round1((totals.fgm / totals.fga) * 100) : null,
      tpm: round1(totals.tpm / gp),
      tpa: round1(totals.tpa / gp),
      tpPct: totals.tpa > 0 ? round1((totals.tpm / totals.tpa) * 100) : null,
      ftm: round1(totals.ftm / gp),
      fta: round1(totals.fta / gp),
      ftPct: totals.fta > 0 ? round1((totals.ftm / totals.fta) * 100) : null,
      oreb: round1(totals.oreb / gp),
      dreb: round1(totals.dreb / gp),
      reb: round1((totals.oreb + totals.dreb) / gp),
      ast: round1(totals.ast / gp),
      tov: round1(totals.tov / gp),
      stl: round1(totals.stl / gp),
      blk: round1(totals.blk / gp),
      pf: round1(totals.pf / gp),
      fp: round1(totals.fp / gp),
      dd2: totals.dd2,
      td3: totals.td3,
    });
  }

  return result.sort((a, b) => b.seasonLabel.localeCompare(a.seasonLabel));
}
