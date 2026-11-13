import { useState } from 'react';
import { Calendar, ChevronRight, Play, Plus, Trash2 } from 'lucide-react';
import { HERO_CLUBHOUSE_IMAGE } from '../data/golfData';
import { Course, RoundRecord, TeeTime } from '../types/golf';
import { computeCareerStats, computeRoundTotals, formatToPar } from '../utils/golfStats';
import { ResilientImage } from './ResilientImage';

interface HomeScreenProps {
  rounds: RoundRecord[];
  courses: Course[];
  teeTimes: TeeTime[];
  onResumeLiveRound: (roundId: string) => void;
  onOpenRound: (roundId: string) => void;
  onOpenNewRound: () => void;
  onAddTeeTime: (teeTime: Omit<TeeTime, 'id'>) => void;
  onDeleteTeeTime: (id: string) => void;
}

export function HomeScreen({
  rounds,
  courses,
  teeTimes,
  onResumeLiveRound,
  onOpenRound,
  onOpenNewRound,
  onAddTeeTime,
  onDeleteTeeTime,
}: HomeScreenProps) {
  const [showTeeForm, setShowTeeForm] = useState(false);
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id || '');
  const [newDate, setNewDate] = useState('Sat, Nov 21');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newPlayers, setNewPlayers] = useState(4);

  const liveRound = rounds.find((r) => r.status === 'in_progress');
  const completedRounds = rounds.filter((r) => r.status === 'completed');
  const career = computeCareerStats(rounds);
  const liveTotals = liveRound ? computeRoundTotals(liveRound) : null;

  const handleCreateTeeTime = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === newCourseId) || courses[0];
    if (!course) return;
    onAddTeeTime({
      courseId: course.id,
      courseName: course.name,
      dateLabel: newDate.trim() || 'Upcoming',
      timeLabel: newTime.trim() || '08:30 AM',
      players: newPlayers,
      teeName: course.teeBoxes[1]?.name || course.teeBoxes[0]?.name || 'Blue Tees',
    });
    setShowTeeForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner Card (Flutter Material 3 Image Surface) */}
      <section className="relative rounded-3xl overflow-hidden bg-[#14201A] min-h-[250px] lg:min-h-[290px] flex items-end shadow-sm">
        <ResilientImage
          src={liveRound ? liveRound.courseImage : HERO_CLUBHOUSE_IMAGE}
          alt={liveRound ? liveRound.courseName : 'Laurel Meadow Golf Clubhouse'}
          fallbackTitle="Par Clubhouse"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />

        <div className="relative z-10 w-full p-6 lg:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-medium text-emerald-200 tracking-wide">
              {liveRound
                ? `Round in progress · Hole ${liveRound.currentHole} of 18 · ${liveRound.teeBoxName}`
                : 'Clubhouse Ledger · Season 2026'}
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight [text-wrap:balance]">
              {liveRound ? liveRound.courseName : 'Ready for your next 18 holes'}
            </h2>
            {liveRound && liveTotals ? (
              <p className="mt-2 text-sm text-white/85 font-mono tabular-nums">
                Through {liveTotals.holesPlayed} holes: {liveTotals.strokes} strokes ({formatToPar(liveTotals.toPar)}) · {liveTotals.fairwayPct}% fairways
              </p>
            ) : (
              <p className="mt-2 text-sm text-white/85">
                Track hole-by-hole strokes, fairways, greens in regulation, and club carry yardages.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {liveRound ? (
              <button
                type="button"
                onClick={() => onResumeLiveRound(liveRound.id)}
                className="h-12 px-6 rounded-2xl bg-[#0F5C45] hover:bg-[#0D503C] text-white font-semibold text-sm flex items-center gap-2 shadow-lg m3-press whitespace-nowrap shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Hole {liveRound.currentHole}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenNewRound}
                className="h-12 px-6 rounded-2xl bg-[#0F5C45] hover:bg-[#0D503C] text-white font-semibold text-sm flex items-center gap-2 shadow-lg m3-press whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Round</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4-Column Full-Width KPI Strip */}
      <section aria-label="Season snapshot" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-5">
          <p className="text-xs font-medium text-[#596860] dark:text-[#8E9F96]">Handicap Index</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
            {career.handicapIndex}
          </p>
          <p className="mt-1 text-xs text-[#0F5C45] dark:text-emerald-300 font-medium">
            Official WHS Index
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-5">
          <p className="text-xs font-medium text-[#596860] dark:text-[#8E9F96]">Scoring Average</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
            {career.scoringAvg}
          </p>
          <p className="mt-1 text-xs text-[#596860] dark:text-[#8E9F96]">
            Across {completedRounds.length} completed rounds
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-5">
          <p className="text-xs font-medium text-[#596860] dark:text-[#8E9F96]">Fairways Hit</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
            {career.fairwayPct}%
          </p>
          <p className="mt-1 text-xs text-[#596860] dark:text-[#8E9F96]">
            Par 4 & Par 5 tee shots
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-5">
          <p className="text-xs font-medium text-[#596860] dark:text-[#8E9F96]">Greens in Reg</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
            {career.girPct}%
          </p>
          <p className="mt-1 text-xs text-[#596860] dark:text-[#8E9F96]">
            {career.puttsPerRound} putts per round
          </p>
        </div>
      </section>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Rounds List */}
        <section className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EBF0EC] dark:border-[#212C26] flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#141C18] dark:text-[#EDF2EE]">
                Recent Rounds
              </h3>
              <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
                Tap any round to open the full 18-hole card
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenNewRound}
              className="h-9 px-3.5 rounded-full bg-[#EEF2EE] dark:bg-[#1D2823] hover:bg-[#E1E8E2] dark:hover:bg-[#25332C] text-[#141C18] dark:text-[#DCE4DE] text-xs font-semibold m3-press whitespace-nowrap shrink-0"
            >
              Log Round
            </button>
          </div>

          <div className="divide-y divide-[#EDF2EE] dark:divide-[#202B25]">
            {rounds.map((round) => {
              const totals = computeRoundTotals(round);
              const isLive = round.status === 'in_progress';
              return (
                <button
                  key={round.id}
                  type="button"
                  onClick={() => onOpenRound(round.id)}
                  className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-[#F7FAF8] dark:hover:bg-[#1A241F] transition-colors m3-press"
                >
                  <ResilientImage
                    src={round.courseImage}
                    alt={round.courseName}
                    fallbackTitle={round.courseName}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-semibold text-[#141C18] dark:text-[#EDF2EE] truncate">
                        {round.courseName}
                      </p>
                      {isLive && (
                        <span className="text-[11px] font-semibold text-[#0F5C45] dark:text-emerald-300 shrink-0">
                          · Live
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#596860] dark:text-[#8E9F96] truncate">
                      {round.date} · {round.teeBoxName} · {totals.holesPlayed}/18 holes
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono text-lg font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
                      {totals.strokes}
                    </p>
                    <p
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        totals.toPar < 0
                          ? 'text-[#D95D39]'
                          : totals.toPar === 0
                            ? 'text-[#0F5C45] dark:text-emerald-300'
                            : 'text-[#596860] dark:text-[#8E9F96]'
                      }`}
                    >
                      {formatToPar(totals.toPar)}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#87968E] shrink-0" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Upcoming Tee Times */}
        <section className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#EBF0EC] dark:border-[#212C26] flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-[#141C18] dark:text-[#EDF2EE]">
                Tee Sheet
              </h3>
              <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
                Upcoming reservations & foursomes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTeeForm((v) => !v)}
              className="h-9 px-3.5 rounded-full bg-[#EEF2EE] dark:bg-[#1D2823] hover:bg-[#E1E8E2] dark:hover:bg-[#25332C] text-[#141C18] dark:text-[#DCE4DE] text-xs font-semibold flex items-center gap-1.5 m3-press whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showTeeForm ? 'Close' : 'Add Tee Time'}</span>
            </button>
          </div>

          {showTeeForm && (
            <form
              onSubmit={handleCreateTeeTime}
              className="p-5 border-b border-[#EBF0EC] dark:border-[#212C26] bg-[#FAFBF9] dark:bg-[#111814] space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-[#45534B] dark:text-[#9FB0A7] mb-1">
                  Course
                </label>
                <select
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#18211C] border border-[#DCE3DD] dark:border-[#2B3932] text-sm text-[#141C18] dark:text-[#EDF2EE]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-[#45534B] dark:text-[#9FB0A7] mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#18211C] border border-[#DCE3DD] dark:border-[#2B3932] text-sm text-[#141C18] dark:text-[#EDF2EE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#45534B] dark:text-[#9FB0A7] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#18211C] border border-[#DCE3DD] dark:border-[#2B3932] text-sm text-[#141C18] dark:text-[#EDF2EE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#45534B] dark:text-[#9FB0A7] mb-1">
                    Players
                  </label>
                  <select
                    value={newPlayers}
                    onChange={(e) => setNewPlayers(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#18211C] border border-[#DCE3DD] dark:border-[#2B3932] text-sm text-[#141C18] dark:text-[#EDF2EE]"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Player' : 'Players'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-[#0F5C45] hover:bg-[#0C4C39] text-white text-xs font-semibold m3-press"
              >
                Save Reservation
              </button>
            </form>
          )}

          <div className="divide-y divide-[#EDF2EE] dark:divide-[#202B25] flex-1">
            {teeTimes.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#596860] dark:text-[#8E9F96]">
                No upcoming tee times scheduled.
              </div>
            ) : (
              teeTimes.map((tt) => (
                <div key={tt.id} className="px-6 py-4 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-2xl bg-[#EEF2EE] dark:bg-[#1D2823] text-[#0F5C45] dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-[#141C18] dark:text-[#EDF2EE] truncate">
                        {tt.courseName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#596860] dark:text-[#8E9F96] truncate">
                        {tt.dateLabel} · {tt.timeLabel} · {tt.players} {tt.players === 1 ? 'player' : 'players'} · {tt.teeName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteTeeTime(tt.id)}
                    aria-label={`Remove tee time at ${tt.courseName}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#76857D] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 m3-press shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
