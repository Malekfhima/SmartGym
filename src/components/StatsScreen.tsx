import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ClubYardage, RoundRecord } from '../types/golf';
import { computeCareerStats, formatToPar } from '../utils/golfStats';

interface StatsScreenProps {
  rounds: RoundRecord[];
  clubs: ClubYardage[];
  onUpdateClubYardage: (id: string, delta: number) => void;
  onAddClub: (club: Omit<ClubYardage, 'id'>) => void;
  onDeleteClub: (id: string) => void;
}

export function StatsScreen({
  rounds,
  clubs,
  onUpdateClubYardage,
  onAddClub,
  onDeleteClub,
}: StatsScreenProps) {
  const [bagFilter, setBagFilter] = useState<'All' | ClubYardage['category']>('All');
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [showAddClub, setShowAddClub] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubCategory, setNewClubCategory] = useState<ClubYardage['category']>('Woods');
  const [newClubLoft, setNewClubLoft] = useState('18°');
  const [newClubCarry, setNewClubCarry] = useState(215);

  const career = computeCareerStats(rounds);
  const dist = career.distribution;
  const totalHolesScored =
    dist.eagle + dist.birdie + dist.par + dist.bogey + dist.doublePlus || 1;

  const distRows = [
    { label: 'Eagle (-2+)', count: dist.eagle, color: 'bg-[#D95D39]' },
    { label: 'Birdie (-1)', count: dist.birdie, color: 'bg-[#E58464]' },
    { label: 'Par (E)', count: dist.par, color: 'bg-[#0F5C45]' },
    { label: 'Bogey (+1)', count: dist.bogey, color: 'bg-[#6F8479]' },
    { label: 'Double+ (+2+)', count: dist.doublePlus, color: 'bg-[#3C4A43]' },
  ];

  const trend = career.trend;
  const chartW = 540;
  const chartH = 190;
  const padX = 28;
  const padY = 24;
  const scores = trend.map((t) => t.score);
  const minScore = scores.length > 0 ? Math.min(...scores) - 3 : 68;
  const maxScore = scores.length > 0 ? Math.max(...scores) + 3 : 82;
  const scoreSpan = Math.max(1, maxScore - minScore);

  const points = trend.map((t, i) => {
    const x =
      trend.length === 1
        ? chartW / 2
        : padX + (i / (trend.length - 1)) * (chartW - padX * 2);
    const y = padY + ((maxScore - t.score) / scoreSpan) * (chartH - padY * 2);
    return { ...t, x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${chartH - padY} L ${points[0].x.toFixed(1)} ${chartH - padY} Z`
      : '';

  const activePoint =
    hoveredTrendIdx !== null ? points[hoveredTrendIdx] : points[points.length - 1];

  const filteredClubs = clubs.filter(
    (c) => bagFilter === 'All' || c.category === bagFilter
  );

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;
    onAddClub({
      name: newClubName.trim(),
      category: newClubCategory,
      loft: newClubLoft.trim() || '—',
      carryYards: newClubCarry,
      totalYards: newClubCarry + 10,
    });
    setNewClubName('');
    setShowAddClub(false);
  };

  return (
    <div className="space-y-6">
      {/* Scoring Trend & Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scoring Trend SVG Chart */}
        <section className="lg:col-span-7 rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-bold text-[#141C18] dark:text-[#EDF2EE]">
                Scoring Trend
              </h3>
              <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
                Completed 18-hole rounds & course differentials
              </p>
            </div>
            {activePoint && (
              <div className="text-right">
                <p className="font-mono text-lg font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
                  {activePoint.score} ({formatToPar(activePoint.toPar)})
                </p>
                <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
                  {activePoint.course} · Diff {activePoint.differential}
                </p>
              </div>
            )}
          </div>

          {points.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-[#596860] dark:text-[#8E9F96]">
              Complete a round to view your scoring trend.
            </div>
          ) : (
            <div className="mt-4">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-48 overflow-visible"
                role="img"
                aria-label="Golf scoring trend line chart"
              >
                <defs>
                  <linearGradient id="parAreaGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0F5C45" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#0F5C45" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((ratio) => {
                  const y = padY + ratio * (chartH - padY * 2);
                  return (
                    <line
                      key={ratio}
                      x1={padX}
                      x2={chartW - padX}
                      y1={y}
                      y2={y}
                      stroke="currentColor"
                      className="text-[#E6ECE7] dark:text-[#24312B]"
                      strokeDasharray="4 4"
                    />
                  );
                })}
                {areaPath && <path d={areaPath} fill="url(#parAreaGrad)" />}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#0F5C45"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {points.map((p, idx) => {
                  const active = activePoint?.id === p.id;
                  return (
                    <g
                      key={p.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredTrendIdx(idx)}
                      onClick={() => setHoveredTrendIdx(idx)}
                    >
                      <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={active ? 6 : 4.5}
                        fill={active ? '#D95D39' : '#0F5C45'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <text
                        x={p.x}
                        y={chartH - 4}
                        textAnchor="middle"
                        className="fill-[#6B7A72] dark:fill-[#8E9F96] text-[10px] font-mono"
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </section>

        {/* Score Distribution Bars */}
        <section className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-6">
          <h3 className="font-display text-base font-bold text-[#141C18] dark:text-[#EDF2EE]">
            Score Distribution
          </h3>
          <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
            {totalHolesScored} completed holes analyzed
          </p>

          <div className="mt-5 space-y-3.5">
            {distRows.map((row) => {
              const pct = Math.round((row.count / totalHolesScored) * 100);
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#141C18] dark:text-[#EDF2EE]">
                      {row.label}
                    </span>
                    <span className="font-mono tabular-nums text-[#596860] dark:text-[#8E9F96]">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#EEF2EE] dark:bg-[#1F2B25] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${Math.max(pct, row.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* In My Bag — Club Carry Matrix */}
      <section className="rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EBF0EC] dark:border-[#212C26] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-[#141C18] dark:text-[#EDF2EE]">
              In My Bag · Carry Yardages
            </h3>
            <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
              Dial in stock carry distances for approach club selection
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EEF2EE] dark:bg-[#1D2823]">
              {(['All', 'Woods', 'Irons', 'Wedges'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBagFilter(cat)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    bagFilter === cat
                      ? 'bg-white dark:bg-[#293831] text-[#141C18] dark:text-[#EDF2EE] shadow-xs'
                      : 'text-[#596860] dark:text-[#8E9F96]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddClub((v) => !v)}
              className="h-9 px-3.5 rounded-full bg-[#0F5C45] text-white text-xs font-semibold flex items-center gap-1.5 m3-press whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddClub ? 'Cancel' : 'Add Club'}</span>
            </button>
          </div>
        </div>

        {showAddClub && (
          <form
            onSubmit={handleCreateClub}
            className="px-6 py-4 bg-[#FAFBF9] dark:bg-[#111814] border-b border-[#EBF0EC] dark:border-[#212C26] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#45534B] dark:text-[#9FB0A7] mb-1">
                Club Name
              </label>
              <input
                type="text"
                placeholder="e.g. 5 Wood"
                value={newClubName}
                onChange={(e) => setNewClubName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#18211C] border border-[#DCE3DD] dark:border-[#2B3932] text-sm text-[#141C18] dark:text-[#EDF2EE]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#45534B] dark:text-[#9FB0A7] mb-1">
                Category
              </label>
              <select
                value={newClubCategory}
                onChange={(e) => setNewClubCategory(e.target.value as ClubYardage['category'])}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#18211C] border border-[#DCE3DD] dark:border-[#2B3932] text-sm text-[#141C18] dark:text-[#EDF2EE]"
              >
                <option value="Woods">Woods</option>
                <option value="Irons">Irons</option>
                <option value="Wedges">Wedges</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#45534B] dark:text-[#9FB0A7] mb-1">
                Carry (yds)
              </label>
              <input
                type="number"
                value={newClubCarry}
                onChange={(e) => setNewClubCarry(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#18211C] border border-[#DCE3DD] dark:border-[#2B3932] text-sm font-mono text-[#141C18] dark:text-[#EDF2EE]"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="Club loft"
                value={newClubLoft}
                onChange={(e) => setNewClubLoft(e.target.value)}
                className="w-16 h-10 px-2.5 rounded-xl bg-white dark:bg-[#18211C] border border-[#DCE3DD] dark:border-[#2B3932] text-sm font-mono text-[#141C18] dark:text-[#EDF2EE]"
              />
              <button
                type="submit"
                className="flex-1 h-10 rounded-xl bg-[#0F5C45] text-white text-xs font-semibold m3-press"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[#EDF2EE] dark:divide-[#202B25]">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F7FAF8] dark:hover:bg-[#1A241F] transition-colors"
            >
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-[#141C18] dark:text-[#EDF2EE] truncate">
                  {club.name}
                </p>
                <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
                  {club.category} · Loft {club.loft}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {club.category === 'Putter' ? (
                  <span className="font-mono text-xs text-[#6B7A72] dark:text-[#86968D] px-3">
                    Green speeds
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateClubYardage(club.id, -2)}
                      aria-label={`Decrease ${club.name} carry`}
                      className="w-9 h-9 rounded-xl bg-[#EEF2EE] dark:bg-[#1D2823] text-[#141C18] dark:text-[#EDF2EE] flex items-center justify-center m3-press"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-24 text-center">
                      <p className="font-mono text-sm font-bold tabular-nums text-[#141C18] dark:text-[#EDF2EE]">
                        {club.carryYards} yds
                      </p>
                      <p className="font-mono text-[11px] tabular-nums text-[#6B7A72] dark:text-[#86968D]">
                        {club.totalYards} total
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUpdateClubYardage(club.id, 2)}
                      aria-label={`Increase ${club.name} carry`}
                      className="w-9 h-9 rounded-xl bg-[#EEF2EE] dark:bg-[#1D2823] text-[#141C18] dark:text-[#EDF2EE] flex items-center justify-center m3-press"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onDeleteClub(club.id)}
                  aria-label={`Remove ${club.name}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#87968E] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 m3-press"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
