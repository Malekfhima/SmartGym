import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from 'lucide-react';
import { Course, FairwayResult, HoleScore, RoundRecord } from '../types/golf';
import { computeRoundTotals, formatToPar, getScoreLabel } from '../utils/golfStats';

interface ScorecardScreenProps {
  round: RoundRecord;
  allRounds: RoundRecord[];
  courses: Course[];
  onSelectRound: (roundId: string) => void;
  onUpdateHole: (roundId: string, holeNumber: number, patch: Partial<HoleScore>) => void;
  onCompleteRound: (roundId: string) => void;
  onReopenRound: (roundId: string) => void;
  onOpenNewRound: () => void;
}

function ScoreMark({ strokes, par }: { strokes: number | null; par: number }) {
  if (strokes === null) {
    return <span className="font-mono text-sm text-[#87968E]">—</span>;
  }
  const diff = strokes - par;
  if (diff <= -2) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-[#D95D39] ring-2 ring-[#D95D39]/30 font-mono text-xs font-bold text-[#D95D39] tabular-nums">
        {strokes}
      </span>
    );
  }
  if (diff === -1) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#D95D39] bg-[#D95D39]/10 font-mono text-xs font-bold text-[#D95D39] tabular-nums">
        {strokes}
      </span>
    );
  }
  if (diff === 0) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 font-mono text-xs font-semibold text-[#141C18] dark:text-[#EDF2EE] tabular-nums">
        {strokes}
      </span>
    );
  }
  if (diff === 1) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-[#6E7F76] dark:border-[#62736A] font-mono text-xs font-semibold text-[#45534B] dark:text-[#BAC8C0] tabular-nums">
        {strokes}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md border-2 border-[#45534B] dark:border-[#7B8D83] bg-[#EEF2EE] dark:bg-[#24312B] font-mono text-xs font-bold text-[#141C18] dark:text-[#EDF2EE] tabular-nums">
      {strokes}
    </span>
  );
}

export function ScorecardScreen({
  round,
  allRounds,
  courses,
  onSelectRound,
  onUpdateHole,
  onCompleteRound,
  onReopenRound,
  onOpenNewRound,
}: ScorecardScreenProps) {
  const [selectedHoleNum, setSelectedHoleNum] = useState<number>(round.currentHole || 1);
  const [tableScope, setTableScope] = useState<'front' | 'back' | 'all'>('all');

  const course = courses.find((c) => c.id === round.courseId) || courses[0];
  const teeBox =
    course?.teeBoxes.find((t) => t.name === round.teeBoxName) || course?.teeBoxes[0];

  const activeHoleSpec =
    course?.holes.find((h) => h.number === selectedHoleNum) || course?.holes[0];
  const activeHoleScore =
    round.holes.find((h) => h.holeNumber === selectedHoleNum) || round.holes[0];

  const activeYards = teeBox?.holeYards[selectedHoleNum - 1] ?? 400;
  const totals = computeRoundTotals(round);
  const effectiveStrokes = activeHoleScore.strokes ?? activeHoleScore.par;
  const effectivePutts = activeHoleScore.putts ?? 2;
  const scoreLabel =
    activeHoleScore.strokes !== null
      ? getScoreLabel(activeHoleScore.strokes, activeHoleScore.par)
      : 'Not Scored';
  const scoreDiff =
    activeHoleScore.strokes !== null ? activeHoleScore.strokes - activeHoleScore.par : 0;

  const setStrokes = (nextStrokes: number) => {
    const clamped = Math.max(1, Math.min(12, nextStrokes));
    onUpdateHole(round.id, selectedHoleNum, {
      strokes: clamped,
      putts: activeHoleScore.putts ?? Math.min(2, clamped - 1),
      gir:
        activeHoleScore.gir ??
        clamped - (activeHoleScore.putts ?? 2) <= activeHoleScore.par - 2,
    });
  };

  const setPutts = (nextPutts: number) => {
    const clamped = Math.max(0, Math.min(6, nextPutts));
    onUpdateHole(round.id, selectedHoleNum, {
      strokes: activeHoleScore.strokes ?? activeHoleScore.par,
      putts: clamped,
    });
  };

  const setFairway = (fw: FairwayResult) => {
    onUpdateHole(round.id, selectedHoleNum, {
      strokes: activeHoleScore.strokes ?? activeHoleScore.par,
      fairway: activeHoleScore.fairway === fw ? null : fw,
    });
  };

  const setGir = (gir: boolean) => {
    onUpdateHole(round.id, selectedHoleNum, {
      strokes: activeHoleScore.strokes ?? activeHoleScore.par,
      gir,
    });
  };

  const visibleHoles =
    tableScope === 'front'
      ? round.holes.slice(0, 9)
      : tableScope === 'back'
        ? round.holes.slice(9, 18)
        : round.holes;

  return (
    <div className="space-y-6">
      {/* Round Selector & Course Summary Header */}
      <section className="rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <select
                aria-label="Select round"
                value={round.id}
                onChange={(e) => {
                  const next = allRounds.find((r) => r.id === e.target.value);
                  onSelectRound(e.target.value);
                  if (next) setSelectedHoleNum(next.currentHole || 1);
                }}
                className="h-10 pl-3 pr-8 rounded-xl bg-[#F0F4F0] dark:bg-[#1D2823] border border-[#DCE3DD] dark:border-[#2B3932] font-display text-sm font-bold text-[#141C18] dark:text-[#EDF2EE]"
              >
                {allRounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.courseName} ({r.date})
                  </option>
                ))}
              </select>
              <span className="text-xs font-medium text-[#0F5C45] dark:text-emerald-300">
                {round.status === 'in_progress' ? 'Live Round' : 'Completed Round'}
              </span>
            </div>

            <p className="mt-2 text-xs text-[#596860] dark:text-[#8E9F96]">
              {round.teeBoxName} · Par {round.coursePar} · Rating {round.courseRating} · Slope {round.courseSlope} · {totals.holesPlayed}/18 Holes Scored
            </p>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <div>
              <p className="text-xs text-[#596860] dark:text-[#8E9F96]">Gross</p>
              <p className="font-mono text-2xl font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
                {totals.strokes}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#596860] dark:text-[#8E9F96]">To Par</p>
              <p
                className={`font-mono text-2xl font-bold tabular-nums ${
                  totals.toPar < 0
                    ? 'text-[#D95D39]'
                    : totals.toPar === 0
                      ? 'text-[#0F5C45] dark:text-emerald-300'
                      : 'text-[#141C18] dark:text-[#EDF2EE]'
                }`}
              >
                {formatToPar(totals.toPar)}
              </p>
            </div>
            {round.status === 'in_progress' ? (
              <button
                type="button"
                onClick={() => onCompleteRound(round.id)}
                className="h-11 px-5 rounded-2xl bg-[#0F5C45] hover:bg-[#0C4C39] text-white text-xs font-semibold flex items-center gap-1.5 m3-press whitespace-nowrap shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Finish Round</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReopenRound(round.id)}
                className="h-11 px-4 rounded-2xl bg-[#EEF2EE] dark:bg-[#1D2823] hover:bg-[#E1E8E2] dark:hover:bg-[#26342D] text-[#141C18] dark:text-[#EDF2EE] text-xs font-semibold flex items-center gap-1.5 m3-press whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Edit Round</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal 18-Hole Chip Strip */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {round.holes.map((h) => {
            const active = h.holeNumber === selectedHoleNum;
            const scored = h.strokes !== null;
            const rel = scored && h.strokes !== null ? h.strokes - h.par : 0;
            return (
              <button
                key={h.holeNumber}
                type="button"
                onClick={() => setSelectedHoleNum(h.holeNumber)}
                className={`min-w-[52px] h-14 px-2 rounded-2xl border flex flex-col items-center justify-center transition-colors m3-press shrink-0 ${
                  active
                    ? 'bg-[#0F5C45] border-[#0F5C45] text-white shadow-sm'
                    : scored
                      ? 'bg-[#F4F7F4] dark:bg-[#1B2520] border-[#DCE3DD] dark:border-[#27352E] text-[#141C18] dark:text-[#EDF2EE]'
                      : 'bg-white dark:bg-[#151D19] border-[#E7EDE8] dark:border-[#222D28] text-[#6B7A72] dark:text-[#86968D]'
                }`}
              >
                <span className="text-[11px] font-medium opacity-80 leading-none">
                  H{h.holeNumber}
                </span>
                <span
                  className={`mt-1 font-mono text-sm font-bold tabular-nums leading-none ${
                    !active && scored && rel < 0
                      ? 'text-[#D95D39]'
                      : !active && scored && rel === 0
                        ? 'text-[#0F5C45] dark:text-emerald-300'
                        : ''
                  }`}
                >
                  {scored ? h.strokes : `P${h.par}`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Hole Stepper & Shot Inputs */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#596860] dark:text-[#8E9F96]">
                Hole {selectedHoleNum} of 18 · SI {activeHoleSpec?.strokeIndex ?? 1}
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold text-[#141C18] dark:text-[#EDF2EE]">
                Par {activeHoleScore.par}
              </h2>
              <p className="mt-0.5 font-mono text-sm tabular-nums text-[#0F5C45] dark:text-emerald-300 font-semibold">
                {activeYards} yards
              </p>
            </div>

            <div className="text-right">
              <span
                className={`font-mono text-sm font-bold ${
                  activeHoleScore.strokes === null
                    ? 'text-[#6B7A72]'
                    : scoreDiff < 0
                      ? 'text-[#D95D39]'
                      : scoreDiff === 0
                        ? 'text-[#0F5C45] dark:text-emerald-300'
                        : 'text-[#45534B] dark:text-[#BAC8C0]'
                }`}
              >
                {activeHoleScore.strokes !== null
                  ? `${formatToPar(scoreDiff)} ${scoreLabel}`
                  : scoreLabel}
              </span>
            </div>
          </div>

          {/* Primary Strokes Stepper */}
          <div className="rounded-2xl bg-[#F4F7F4] dark:bg-[#1B2520] p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStrokes(effectiveStrokes - 1)}
              aria-label="Decrease strokes"
              className="w-12 h-12 rounded-2xl bg-white dark:bg-[#26342D] border border-[#DCE3DD] dark:border-[#314139] text-[#141C18] dark:text-[#EDF2EE] flex items-center justify-center shadow-xs m3-press"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-xs font-medium text-[#596860] dark:text-[#8E9F96]">Strokes</p>
              <p className="font-mono text-4xl font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
                {activeHoleScore.strokes ?? '—'}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setStrokes(activeHoleScore.strokes === null ? activeHoleScore.par : effectiveStrokes + 1)
              }
              aria-label="Increase strokes"
              className="w-12 h-12 rounded-2xl bg-[#0F5C45] text-white flex items-center justify-center shadow-sm m3-press"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Putts, Fairway & GIR Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[#141C18] dark:text-[#EDF2EE]">Putts</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPutts(effectivePutts - 1)}
                  aria-label="Decrease putts"
                  className="w-10 h-10 rounded-xl bg-[#EEF2EE] dark:bg-[#1D2823] text-[#141C18] dark:text-[#EDF2EE] flex items-center justify-center m3-press"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono text-lg font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
                  {activeHoleScore.putts ?? '—'}
                </span>
                <button
                  type="button"
                  onClick={() => setPutts(effectivePutts + 1)}
                  aria-label="Increase putts"
                  className="w-10 h-10 rounded-xl bg-[#EEF2EE] dark:bg-[#1D2823] text-[#141C18] dark:text-[#EDF2EE] flex items-center justify-center m3-press"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[#141C18] dark:text-[#EDF2EE]">
                Fairway
              </span>
              {activeHoleScore.par === 3 ? (
                <span className="text-xs text-[#6B7A72] dark:text-[#86968D]">
                  Par 3 · Approach hole
                </span>
              ) : (
                <div className="grid grid-cols-3 p-1 rounded-xl bg-[#EEF2EE] dark:bg-[#1D2823] gap-1">
                  {(['left', 'hit', 'right'] as const).map((dir) => {
                    const active = activeHoleScore.fairway === dir;
                    return (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => setFairway(dir)}
                        className={`h-8 px-3 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                          active
                            ? 'bg-white dark:bg-[#293831] text-[#0F5C45] dark:text-emerald-300 shadow-xs'
                            : 'text-[#596860] dark:text-[#8E9F96]'
                        }`}
                      >
                        {dir}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[#141C18] dark:text-[#EDF2EE]">
                Green in Reg
              </span>
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#EEF2EE] dark:bg-[#1D2823] gap-1">
                <button
                  type="button"
                  onClick={() => setGir(false)}
                  className={`h-8 px-4 rounded-lg text-xs font-semibold transition-colors ${
                    activeHoleScore.gir === false
                      ? 'bg-white dark:bg-[#293831] text-[#141C18] dark:text-[#EDF2EE] shadow-xs'
                      : 'text-[#596860] dark:text-[#8E9F96]'
                  }`}
                >
                  Missed
                </button>
                <button
                  type="button"
                  onClick={() => setGir(true)}
                  className={`h-8 px-4 rounded-lg text-xs font-semibold transition-colors ${
                    activeHoleScore.gir === true
                      ? 'bg-white dark:bg-[#293831] text-[#0F5C45] dark:text-emerald-300 shadow-xs'
                      : 'text-[#596860] dark:text-[#8E9F96]'
                  }`}
                >
                  Hit GIR
                </button>
              </div>
            </div>
          </div>

          {/* Previous / Next Hole Footer */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#EBF0EC] dark:border-[#212C26]">
            <button
              type="button"
              disabled={selectedHoleNum <= 1}
              onClick={() => setSelectedHoleNum((n) => Math.max(1, n - 1))}
              className="h-11 px-4 rounded-2xl bg-[#EEF2EE] dark:bg-[#1D2823] disabled:opacity-40 text-xs font-semibold text-[#141C18] dark:text-[#EDF2EE] flex items-center gap-1.5 m3-press"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Hole</span>
            </button>
            <button
              type="button"
              disabled={selectedHoleNum >= 18}
              onClick={() => setSelectedHoleNum((n) => Math.min(18, n + 1))}
              className="h-11 px-4 rounded-2xl bg-[#0F5C45] disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5 m3-press"
            >
              <span>Next Hole</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Digital 18-Hole Scorecard Table */}
        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#EBF0EC] dark:border-[#212C26] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-[#141C18] dark:text-[#EDF2EE]">
                Digital Scorecard
              </h3>
              <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
                Circle = under par · Square = over par
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EEF2EE] dark:bg-[#1D2823]">
              {(
                [
                  { id: 'front', label: 'Front 9' },
                  { id: 'back', label: 'Back 9' },
                  { id: 'all', label: 'All 18' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTableScope(tab.id)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    tableScope === tab.id
                      ? 'bg-white dark:bg-[#293831] text-[#141C18] dark:text-[#EDF2EE] shadow-xs'
                      : 'text-[#596860] dark:text-[#8E9F96]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EBF0EC] dark:border-[#212C26] text-[11px] font-semibold text-[#596860] dark:text-[#8E9F96]">
                  <th className="py-3 pl-6 pr-2">Hole</th>
                  <th className="py-3 px-2 text-right">Yards</th>
                  <th className="py-3 px-2 text-right">Par</th>
                  <th className="py-3 px-2 text-right">SI</th>
                  <th className="py-3 px-2 text-center">Score</th>
                  <th className="py-3 px-2 text-right">Putts</th>
                  <th className="py-3 pl-2 pr-6 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F1] dark:divide-[#1E2823] text-sm">
                {visibleHoles.map((hole) => {
                  const spec = course?.holes.find((h) => h.number === hole.holeNumber);
                  const yards = teeBox?.holeYards[hole.holeNumber - 1] ?? 400;
                  const isActive = hole.holeNumber === selectedHoleNum;
                  return (
                    <tr
                      key={hole.holeNumber}
                      onClick={() => setSelectedHoleNum(hole.holeNumber)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#EEF6F1] dark:bg-[#173026]'
                          : 'hover:bg-[#F7FAF8] dark:hover:bg-[#1A241F]'
                      }`}
                    >
                      <td className="py-2.5 pl-6 pr-2 font-mono font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
                        {hole.holeNumber}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-xs tabular-nums text-[#596860] dark:text-[#8E9F96]">
                        {yards}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-[#141C18] dark:text-[#DCE4DE]">
                        {hole.par}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-xs tabular-nums text-[#6B7A72] dark:text-[#86968D]">
                        {spec?.strokeIndex ?? hole.holeNumber}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <ScoreMark strokes={hole.strokes} par={hole.par} />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-xs tabular-nums text-[#596860] dark:text-[#8E9F96]">
                        {hole.putts ?? '—'}
                      </td>
                      <td className="py-2.5 pl-2 pr-6 text-right text-xs font-medium text-[#596860] dark:text-[#8E9F96]">
                        {hole.strokes !== null ? getScoreLabel(hole.strokes, hole.par) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-[#EBF0EC] dark:border-[#212C26] bg-[#FAFBF9] dark:bg-[#121916] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-5 font-mono tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
              <span>Out: {totals.frontStrokes ?? '—'}</span>
              <span>In: {totals.backStrokes ?? '—'}</span>
              <span className="font-bold">Total: {totals.strokes} ({formatToPar(totals.toPar)})</span>
            </div>
            <button
              type="button"
              onClick={onOpenNewRound}
              className="text-xs font-semibold text-[#0F5C45] dark:text-emerald-300 hover:underline whitespace-nowrap"
            >
              Start another round
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
