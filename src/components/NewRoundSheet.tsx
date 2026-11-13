import { useState } from 'react';
import { X, Play } from 'lucide-react';
import { Course } from '../types/golf';
import { ResilientImage } from './ResilientImage';

interface NewRoundSheetProps {
  open: boolean;
  courses: Course[];
  initialCourseId?: string;
  onClose: () => void;
  onStartRound: (courseId: string, teeBoxId: string, startingHole: number) => void;
}

export function NewRoundSheet({
  open,
  courses,
  initialCourseId,
  onClose,
  onStartRound,
}: NewRoundSheetProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || courses[0]?.id || ''
  );
  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const [selectedTeeId, setSelectedTeeId] = useState<string>(
    activeCourse?.teeBoxes[1]?.id || activeCourse?.teeBoxes[0]?.id || ''
  );
  const [startingHole, setStartingHole] = useState<1 | 10>(1);

  if (!open || !activeCourse) return null;

  const currentTee =
    activeCourse.teeBoxes.find((t) => t.id === selectedTeeId) || activeCourse.teeBoxes[0];

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const nextCourse = courses.find((c) => c.id === courseId);
    if (nextCourse) {
      setSelectedTeeId(nextCourse.teeBoxes[1]?.id || nextCourse.teeBoxes[0]?.id || '');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm p-0 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-round-sheet-title"
    >
      <div className="w-full lg:max-w-xl bg-white dark:bg-[#151D19] rounded-t-3xl lg:rounded-3xl border border-[#DCE3DD] dark:border-[#24312B] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Material 3 Bottom Sheet Drag Handle */}
        <div className="lg:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#CBD4CD] dark:bg-[#314038]" />
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E7EDE8] dark:border-[#222D28]">
          <div>
            <h2
              id="new-round-sheet-title"
              className="font-display text-lg font-bold text-[#141C18] dark:text-[#EDF2EE]"
            >
              Start a New Round
            </h2>
            <p className="text-xs text-[#596860] dark:text-[#8E9F96]">
              Select course, tee box, and starting tee
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close new round sheet"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#526058] dark:text-[#96A79E] hover:bg-[#EFF4F0] dark:hover:bg-[#1E2A24] m3-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Course List */}
          <div>
            <label className="block text-xs font-semibold text-[#45534B] dark:text-[#9FB0A7] mb-2.5">
              Course
            </label>
            <div className="space-y-2.5">
              {courses.map((course) => {
                const selected = course.id === activeCourse.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => handleCourseChange(course.id)}
                    className={`w-full flex items-center gap-3.5 p-2.5 rounded-2xl border text-left transition-colors m3-press ${
                      selected
                        ? 'border-[#0F5C45] bg-[#EEF6F1] dark:bg-[#143025] dark:border-emerald-500/60'
                        : 'border-[#E2E8E3] dark:border-[#24312B] hover:bg-[#F7FAF8] dark:hover:bg-[#1A241F]'
                    }`}
                  >
                    <ResilientImage
                      src={course.image}
                      alt={course.name}
                      fallbackTitle={course.name}
                      className="w-16 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-semibold text-[#141C18] dark:text-[#EDF2EE] truncate">
                        {course.name}
                      </p>
                      <p className="text-xs text-[#596860] dark:text-[#8E9F96] truncate">
                        {course.location} · Par {course.par} · {course.style}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tee Box Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#45534B] dark:text-[#9FB0A7] mb-2.5">
              Tee Box
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeCourse.teeBoxes.map((tee) => {
                const selected = tee.id === currentTee.id;
                return (
                  <button
                    key={tee.id}
                    type="button"
                    onClick={() => setSelectedTeeId(tee.id)}
                    className={`p-3 rounded-2xl border text-left transition-colors m3-press ${
                      selected
                        ? 'border-[#0F5C45] bg-[#EEF6F1] dark:bg-[#143025] dark:border-emerald-500/60'
                        : 'border-[#E2E8E3] dark:border-[#24312B] hover:bg-[#F7FAF8] dark:hover:bg-[#1A241F]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-black/15"
                        style={{ backgroundColor: tee.colorHex }}
                      />
                      <span className="text-sm font-semibold text-[#141C18] dark:text-[#EDF2EE] truncate">
                        {tee.name}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-mono tabular-nums text-[#596860] dark:text-[#8E9F96]">
                      {tee.totalYards.toLocaleString()} yds · {tee.rating}/{tee.slope}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starting Tee Segmented Button */}
          <div>
            <label className="block text-xs font-semibold text-[#45534B] dark:text-[#9FB0A7] mb-2.5">
              Starting Hole
            </label>
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#EEF2EE] dark:bg-[#1D2722]">
              {([1, 10] as const).map((hole) => {
                const active = startingHole === hole;
                return (
                  <button
                    key={hole}
                    type="button"
                    onClick={() => setStartingHole(hole)}
                    className={`h-10 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white dark:bg-[#27352E] text-[#141C18] dark:text-[#EDF2EE] shadow-sm'
                        : 'text-[#596860] dark:text-[#94A59C]'
                    }`}
                  >
                    Hole {hole} ({hole === 1 ? 'Front Nine' : 'Back Nine'})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[#E7EDE8] dark:border-[#222D28] bg-[#FAFBF9] dark:bg-[#121916]">
          <button
            type="button"
            onClick={() => onStartRound(activeCourse.id, currentTee.id, startingHole)}
            className="w-full h-12 rounded-2xl bg-[#0F5C45] hover:bg-[#0C4C39] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0F5C45]/15 m3-press"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Round at {activeCourse.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
