import { HoleScore, RoundRecord } from '../types/golf';

export function formatToPar(diff: number): string {
  if (diff === 0) return 'E';
  return diff > 0 ? `+${diff}` : `${diff}`;
}

export function getScoreLabel(strokes: number, par: number): string {
  const diff = strokes - par;
  if (strokes === 1) return 'Ace';
  if (diff <= -2) return 'Eagle';
  if (diff === -1) return 'Birdie';
  if (diff === 0) return 'Par';
  if (diff === 1) return 'Bogey';
  if (diff === 2) return 'Double';
  return `+${diff}`;
}

export function computeRoundTotals(round: RoundRecord) {
  const playedHoles = round.holes.filter((h) => h.strokes !== null);
  const strokes = playedHoles.reduce((sum, h) => sum + (h.strokes ?? 0), 0);
  const parPlayed = playedHoles.reduce((sum, h) => sum + h.par, 0);
  const toPar = strokes - parPlayed;

  const front9 = round.holes.slice(0, 9);
  const back9 = round.holes.slice(9, 18);

  const frontStrokes = front9.every((h) => h.strokes !== null)
    ? front9.reduce((s, h) => s + (h.strokes ?? 0), 0)
    : null;
  const backStrokes = back9.every((h) => h.strokes !== null)
    ? back9.reduce((s, h) => s + (h.strokes ?? 0), 0)
    : null;

  const puttsPlayed = playedHoles.filter((h) => h.putts !== null);
  const totalPutts = puttsPlayed.reduce((s, h) => s + (h.putts ?? 0), 0);

  const fairwayEligible = playedHoles.filter((h) => h.par !== 3 && h.fairway !== null);
  const fairwayHits = fairwayEligible.filter((h) => h.fairway === 'hit').length;

  const girEligible = playedHoles.filter((h) => h.gir !== null);
  const girHits = girEligible.filter((h) => h.gir === true).length;

  return {
    holesPlayed: playedHoles.length,
    strokes,
    parPlayed,
    toPar,
    frontStrokes,
    backStrokes,
    totalPutts,
    puttsAvgPerHole: puttsPlayed.length > 0 ? totalPutts / puttsPlayed.length : 0,
    fairwayPct: fairwayEligible.length > 0 ? Math.round((fairwayHits / fairwayEligible.length) * 100) : 0,
    girPct: girEligible.length > 0 ? Math.round((girHits / girEligible.length) * 100) : 0,
  };
}

export function computeCareerStats(rounds: RoundRecord[]) {
  const completed = rounds.filter((r) => r.status === 'completed');
  if (completed.length === 0) {
    return {
      handicapIndex: '6.4',
      scoringAvg: '72.0',
      fairwayPct: 0,
      girPct: 0,
      puttsPerRound: '0.0',
      distribution: { eagle: 0, birdie: 0, par: 0, bogey: 0, doublePlus: 0 },
      trend: [] as Array<{ id: string; label: string; course: string; score: number; toPar: number; differential: number }>,
    };
  }

  let totalScore = 0;
  let totalFwHits = 0;
  let totalFwOpps = 0;
  let totalGirHits = 0;
  let totalGirOpps = 0;
  let totalPutts = 0;
  let puttRounds = 0;

  const distribution = { eagle: 0, birdie: 0, par: 0, bogey: 0, doublePlus: 0 };
  const differentials: number[] = [];

  const trend = completed
    .slice()
    .reverse()
    .map((round) => {
      const totals = computeRoundTotals(round);
      totalScore += totals.strokes;

      const diff = Number((((totals.strokes - round.courseRating) * 113) / round.courseSlope).toFixed(1));
      differentials.push(diff);

      let roundPutts = 0;
      let hasPutts = false;
      round.holes.forEach((h: HoleScore) => {
        if (h.strokes === null) return;
        const rel = h.strokes - h.par;
        if (rel <= -2) distribution.eagle += 1;
        else if (rel === -1) distribution.birdie += 1;
        else if (rel === 0) distribution.par += 1;
        else if (rel === 1) distribution.bogey += 1;
        else distribution.doublePlus += 1;

        if (h.par !== 3 && h.fairway !== null) {
          totalFwOpps += 1;
          if (h.fairway === 'hit') totalFwHits += 1;
        }
        if (h.gir !== null) {
          totalGirOpps += 1;
          if (h.gir) totalGirHits += 1;
        }
        if (h.putts !== null) {
          roundPutts += h.putts;
          hasPutts = true;
        }
      });

      if (hasPutts) {
        totalPutts += roundPutts;
        puttRounds += 1;
      }

      return {
        id: round.id,
        label: round.date.replace(', 2026', ''),
        course: round.courseName,
        score: totals.strokes,
        toPar: totals.toPar,
        differential: diff,
      };
    });

  const sortedDiffs = [...differentials].sort((a, b) => a - b);
  const countBest = Math.max(1, Math.min(3, Math.ceil(sortedDiffs.length / 2)));
  const avgBestDiff =
    sortedDiffs.slice(0, countBest).reduce((sum, d) => sum + d, 0) / countBest;

  return {
    handicapIndex: Math.max(0, avgBestDiff * 0.96).toFixed(1),
    scoringAvg: (totalScore / completed.length).toFixed(1),
    fairwayPct: totalFwOpps > 0 ? Math.round((totalFwHits / totalFwOpps) * 100) : 0,
    girPct: totalGirOpps > 0 ? Math.round((totalGirHits / totalGirOpps) * 100) : 0,
    puttsPerRound: puttRounds > 0 ? (totalPutts / puttRounds).toFixed(1) : '31.0',
    distribution,
    trend,
  };
}
