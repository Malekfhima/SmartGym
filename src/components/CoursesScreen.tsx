import { useState } from 'react';
import { MapPin, Play, Search, X } from 'lucide-react';
import { Course, CourseStyle } from '../types/golf';
import { ResilientImage } from './ResilientImage';

interface CoursesScreenProps {
  courses: Course[];
  onStartRoundAtCourse: (courseId: string, teeBoxId: string) => void;
}

export function CoursesScreen({ courses, onStartRoundAtCourse }: CoursesScreenProps) {
  const [query, setQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState<'All' | CourseStyle>('All');
  const [inspectCourse, setInspectCourse] = useState<Course | null>(null);
  const [selectedTeeId, setSelectedTeeId] = useState<string>('');

  const filtered = courses.filter((c) => {
    const matchesStyle = styleFilter === 'All' || c.style === styleFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
    return matchesStyle && matchesQuery;
  });

  const openCourse = (course: Course) => {
    setInspectCourse(course);
    setSelectedTeeId(course.teeBoxes[1]?.id || course.teeBoxes[0]?.id || '');
  };

  const activeTee =
    inspectCourse?.teeBoxes.find((t) => t.id === selectedTeeId) || inspectCourse?.teeBoxes[0];

  return (
    <div className="space-y-6">
      {/* Search & Segmented Filter Toolbar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7A72] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses or locations..."
            className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] text-sm text-[#141C18] dark:text-[#EDF2EE] placeholder:text-[#7D8C84] focus:outline-none focus:ring-2 focus:ring-[#0F5C45]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#EEF2EE] dark:bg-[#1A241F] self-start sm:self-auto">
          {(['All', 'Links', 'Parkland', 'Desert'] as const).map((style) => {
            const active = styleFilter === style;
            return (
              <button
                key={style}
                type="button"
                onClick={() => setStyleFilter(style)}
                className={`h-9 px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-[#27352E] text-[#141C18] dark:text-[#EDF2EE] shadow-xs'
                    : 'text-[#596860] dark:text-[#8E9F96] hover:text-[#141C18] dark:hover:text-white'
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </section>

      {/* Course Directory Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] p-12 text-center">
          <p className="font-display text-base font-semibold text-[#141C18] dark:text-[#EDF2EE]">
            No courses match "{query}"
          </p>
          <p className="mt-1 text-sm text-[#596860] dark:text-[#8E9F96]">
            Try clearing your search or switching course styles.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((course) => {
            const mainTee = course.teeBoxes[0];
            return (
              <article
                key={course.id}
                className="rounded-3xl bg-white dark:bg-[#151D19] border border-[#E2E8E3] dark:border-[#232F29] overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ResilientImage
                    src={course.image}
                    alt={course.name}
                    fallbackTitle={course.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-white/85 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{course.location}</span>
                      </p>
                      <h3 className="mt-0.5 font-display text-xl font-bold text-white">
                        {course.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    <p className="text-xs font-medium text-[#596860] dark:text-[#8E9F96]">
                      {course.style} · Par {course.par} · {mainTee.totalYards.toLocaleString()} yds · Slope {mainTee.slope}
                    </p>
                    <p className="mt-2.5 text-sm text-[#39463F] dark:text-[#BDCAC2] leading-relaxed">
                      {course.summary}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#EBF0EC] dark:border-[#212C26]">
                    <span className="text-xs text-[#6B7A72] dark:text-[#86968D] truncate">
                      {course.architect}
                    </span>
                    <button
                      type="button"
                      onClick={() => openCourse(course)}
                      className="h-10 px-4 rounded-2xl bg-[#EEF2EE] dark:bg-[#1D2823] hover:bg-[#0F5C45] hover:text-white dark:hover:bg-[#0F5C45] text-[#141C18] dark:text-[#EDF2EE] text-xs font-semibold transition-colors m3-press whitespace-nowrap shrink-0"
                    >
                      Yardage & Tee Guide
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Course Yardage & Tee Sheet Modal */}
      {inspectCourse && activeTee && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm p-0 lg:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-modal-title"
        >
          <div className="w-full lg:max-w-3xl bg-white dark:bg-[#151D19] rounded-t-3xl lg:rounded-3xl border border-[#DCE3DD] dark:border-[#24312B] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="lg:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-[#CBD4CD] dark:bg-[#314038]" />
            </div>

            <div className="px-6 py-4 border-b border-[#E7EDE8] dark:border-[#222D28] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2
                  id="course-modal-title"
                  className="font-display text-lg font-bold text-[#141C18] dark:text-[#EDF2EE] truncate"
                >
                  {inspectCourse.name}
                </h2>
                <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
                  {inspectCourse.location} · Par {inspectCourse.par} · {inspectCourse.architect}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectCourse(null)}
                aria-label="Close course guide"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#526058] dark:text-[#96A79E] hover:bg-[#EFF4F0] dark:hover:bg-[#1E2A24] m3-press shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Tee Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {inspectCourse.teeBoxes.map((tee) => {
                  const selected = tee.id === activeTee.id;
                  return (
                    <button
                      key={tee.id}
                      type="button"
                      onClick={() => setSelectedTeeId(tee.id)}
                      className={`p-3 rounded-2xl border text-left transition-colors m3-press ${
                        selected
                          ? 'border-[#0F5C45] bg-[#EEF6F1] dark:bg-[#143025] dark:border-emerald-500/60'
                          : 'border-[#E2E8E3] dark:border-[#24312B]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-black/15"
                          style={{ backgroundColor: tee.colorHex }}
                        />
                        <span className="text-sm font-semibold text-[#141C18] dark:text-[#EDF2EE]">
                          {tee.name}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs tabular-nums text-[#596860] dark:text-[#8E9F96]">
                        {tee.totalYards.toLocaleString()} yds · {tee.rating} / {tee.slope}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Hole-by-hole Yardage Table */}
              <div className="rounded-2xl border border-[#E7EDE8] dark:border-[#222D28] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4F7F4] dark:bg-[#1B2520] text-[#596860] dark:text-[#8E9F96] font-semibold">
                      <th className="py-2.5 px-4">Hole</th>
                      <th className="py-2.5 px-4 text-right">Par</th>
                      <th className="py-2.5 px-4 text-right">Yards</th>
                      <th className="py-2.5 px-4 text-right">Stroke Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF2EE] dark:divide-[#202B25] font-mono tabular-nums">
                    {inspectCourse.holes.map((hole, idx) => (
                      <tr key={hole.number}>
                        <td className="py-2 px-4 font-bold text-[#141C18] dark:text-[#EDF2EE]">
                          {hole.number}
                        </td>
                        <td className="py-2 px-4 text-right text-[#45534B] dark:text-[#BAC8C0]">
                          {hole.par}
                        </td>
                        <td className="py-2 px-4 text-right text-[#141C18] dark:text-[#EDF2EE]">
                          {activeTee.holeYards[idx]}
                        </td>
                        <td className="py-2 px-4 text-right text-[#6B7A72] dark:text-[#86968D]">
                          {hole.strokeIndex}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-5 border-t border-[#E7EDE8] dark:border-[#222D28] bg-[#FAFBF9] dark:bg-[#121916]">
              <button
                type="button"
                onClick={() => {
                  onStartRoundAtCourse(inspectCourse.id, activeTee.id);
                  setInspectCourse(null);
                }}
                className="w-full h-12 rounded-2xl bg-[#0F5C45] hover:bg-[#0C4C39] text-white font-semibold text-sm flex items-center justify-center gap-2 m3-press"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Round on {activeTee.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
