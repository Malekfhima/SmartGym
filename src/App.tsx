import { useEffect, useState } from 'react';
import { AdaptiveNavigation } from './components/AdaptiveNavigation';
import { CoursesScreen } from './components/CoursesScreen';
import { HomeScreen } from './components/HomeScreen';
import { NewRoundSheet } from './components/NewRoundSheet';
import { ScorecardScreen } from './components/ScorecardScreen';
import { StatsScreen } from './components/StatsScreen';
import { COURSES, INITIAL_CLUBS, INITIAL_ROUNDS, INITIAL_TEE_TIMES } from './data/golfData';
import { ClubYardage, HoleScore, NavTab, RoundRecord, TeeTime } from './types/golf';

const STORAGE_KEYS = {
  rounds: 'par_rounds_v1',
  teeTimes: 'par_teetimes_v1',
  clubs: 'par_clubs_v1',
  theme: 'par_theme_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const DESKTOP_HEADERS: Record<NavTab, { title: string; subtitle: string }> = {
  home: {
    title: 'Clubhouse',
    subtitle: 'Handicap index, active round ledger, and upcoming tee times',
  },
  scorecard: {
    title: 'Live Scorecard',
    subtitle: 'Tap any hole to enter strokes, putts, fairways hit, and greens in regulation',
  },
  courses: {
    title: 'Courses & Yardages',
    subtitle: 'Browse championship routings, inspect tee boxes, and launch a round',
  },
  stats: {
    title: 'Performance & Bag',
    subtitle: 'Scoring trends, par differentials, and stock club carry yardages',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [rounds, setRounds] = useState<RoundRecord[]>(() =>
    loadStored(STORAGE_KEYS.rounds, INITIAL_ROUNDS)
  );
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>(() =>
    loadStored(STORAGE_KEYS.teeTimes, INITIAL_TEE_TIMES)
  );
  const [clubs, setClubs] = useState<ClubYardage[]>(() =>
    loadStored(STORAGE_KEYS.clubs, INITIAL_CLUBS)
  );
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.theme) === 'dark';
    } catch {
      return false;
    }
  });

  const [selectedRoundId, setSelectedRoundId] = useState<string>(() => {
    const stored = loadStored(STORAGE_KEYS.rounds, INITIAL_ROUNDS);
    const live = stored.find((r) => r.status === 'in_progress');
    return live?.id || stored[0]?.id || INITIAL_ROUNDS[0].id;
  });

  const [newRoundOpen, setNewRoundOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.rounds, JSON.stringify(rounds));
    } catch {
      // Ignore storage errors
    }
  }, [rounds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.teeTimes, JSON.stringify(teeTimes));
    } catch {
      // Ignore storage errors
    }
  }, [teeTimes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.clubs, JSON.stringify(clubs));
    } catch {
      // Ignore storage errors
    }
  }, [clubs]);

  useEffect(() => {
    if (!snackMessage) return;
    const timer = window.setTimeout(() => setSnackMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [snackMessage]);

  const showSnack = (msg: string) => setSnackMessage(msg);

  const startRound = (courseId: string, teeBoxId: string, startingHole = 1) => {
    const course = COURSES.find((c) => c.id === courseId) || COURSES[0];
    const tee = course.teeBoxes.find((t) => t.id === teeBoxId) || course.teeBoxes[0];

    const newRound: RoundRecord = {
      id: `round-${Date.now()}`,
      courseId: course.id,
      courseName: course.name,
      courseImage: course.image,
      teeBoxName: tee.name,
      teeColorHex: tee.colorHex,
      coursePar: course.par,
      courseRating: tee.rating,
      courseSlope: tee.slope,
      date: 'Today · Just Started',
      status: 'in_progress',
      currentHole: startingHole,
      holes: course.holes.map((h) => ({
        holeNumber: h.number,
        par: h.par,
        strokes: null,
        putts: null,
        fairway: null,
        gir: null,
      })),
    };

    setRounds((prev) => [newRound, ...prev]);
    setSelectedRoundId(newRound.id);
    setNewRoundOpen(false);
    setActiveTab('scorecard');
    showSnack(`Started round at ${course.name}`);
  };

  const handleUpdateHole = (roundId: string, holeNumber: number, patch: Partial<HoleScore>) => {
    setRounds((prev) =>
      prev.map((r) => {
        if (r.id !== roundId) return r;
        const nextHoles = r.holes.map((h) =>
          h.holeNumber === holeNumber ? { ...h, ...patch } : h
        );
        return {
          ...r,
          currentHole: holeNumber,
          holes: nextHoles,
        };
      })
    );
  };

  const handleCompleteRound = (roundId: string) => {
    setRounds((prev) =>
      prev.map((r) => {
        if (r.id !== roundId) return r;
        const filledHoles = r.holes.map((h) =>
          h.strokes === null
            ? {
                ...h,
                strokes: h.par,
                putts: 2,
                fairway: h.par === 3 ? null : ('hit' as const),
                gir: true,
              }
            : h
        );
        return {
          ...r,
          status: 'completed',
          date: 'Nov 13, 2026',
          holes: filledHoles,
        };
      })
    );
    showSnack('Round completed and saved to your ledger');
  };

  const handleReopenRound = (roundId: string) => {
    setRounds((prev) =>
      prev.map((r) => (r.id === roundId ? { ...r, status: 'in_progress' } : r))
    );
    showSnack('Round reopened for editing');
  };

  const handleAddTeeTime = (teeTime: Omit<TeeTime, 'id'>) => {
    setTeeTimes((prev) => [{ ...teeTime, id: `tt-${Date.now()}` }, ...prev]);
    showSnack(`Tee time reserved at ${teeTime.courseName}`);
  };

  const handleDeleteTeeTime = (id: string) => {
    setTeeTimes((prev) => prev.filter((t) => t.id !== id));
    showSnack('Tee time removed');
  };

  const handleUpdateClubYardage = (id: string, delta: number) => {
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextCarry = Math.max(40, Math.min(340, c.carryYards + delta));
        const roll = c.totalYards - c.carryYards;
        return {
          ...c,
          carryYards: nextCarry,
          totalYards: nextCarry + roll,
        };
      })
    );
  };

  const handleAddClub = (club: Omit<ClubYardage, 'id'>) => {
    setClubs((prev) => [...prev, { ...club, id: `c-${Date.now()}` }]);
    showSnack(`Added ${club.name} to your bag`);
  };

  const handleDeleteClub = (id: string) => {
    setClubs((prev) => prev.filter((c) => c.id !== id));
    showSnack('Removed club from bag');
  };

  const activeRound = rounds.find((r) => r.id === selectedRoundId) || rounds[0];
  const hasLiveRound = rounds.some((r) => r.status === 'in_progress');
  const headerInfo = DESKTOP_HEADERS[activeTab];

  return (
    <div className="min-h-screen bg-[#F6F8F6] dark:bg-[#0E1311] text-[#141C18] dark:text-[#EDF2EE] transition-colors">
      <AdaptiveNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewRound={() => setNewRoundOpen(true)}
        hasLiveRound={hasLiveRound}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      <main className="lg:pl-64 pb-24 lg:pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-5 lg:pt-8">
          {/* Desktop Material 3 Screen Header */}
          <div className="hidden lg:flex items-end justify-between gap-6 mb-7">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-[#141C18] dark:text-[#EDF2EE]">
                {headerInfo.title}
              </h1>
              <p className="mt-1 text-sm text-[#596860] dark:text-[#8E9F96]">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          {activeTab === 'home' && (
            <HomeScreen
              rounds={rounds}
              courses={COURSES}
              teeTimes={teeTimes}
              onResumeLiveRound={(id) => {
                setSelectedRoundId(id);
                setActiveTab('scorecard');
              }}
              onOpenRound={(id) => {
                setSelectedRoundId(id);
                setActiveTab('scorecard');
              }}
              onOpenNewRound={() => setNewRoundOpen(true)}
              onAddTeeTime={handleAddTeeTime}
              onDeleteTeeTime={handleDeleteTeeTime}
            />
          )}

          {activeTab === 'scorecard' && activeRound && (
            <ScorecardScreen
              round={activeRound}
              allRounds={rounds}
              courses={COURSES}
              onSelectRound={(id) => setSelectedRoundId(id)}
              onUpdateHole={handleUpdateHole}
              onCompleteRound={handleCompleteRound}
              onReopenRound={handleReopenRound}
              onOpenNewRound={() => setNewRoundOpen(true)}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesScreen
              courses={COURSES}
              onStartRoundAtCourse={(courseId, teeBoxId) => startRound(courseId, teeBoxId, 1)}
            />
          )}

          {activeTab === 'stats' && (
            <StatsScreen
              rounds={rounds}
              clubs={clubs}
              onUpdateClubYardage={handleUpdateClubYardage}
              onAddClub={handleAddClub}
              onDeleteClub={handleDeleteClub}
            />
          )}
        </div>
      </main>

      <NewRoundSheet
        open={newRoundOpen}
        courses={COURSES}
        onClose={() => setNewRoundOpen(false)}
        onStartRound={(courseId, teeBoxId, startHole) =>
          startRound(courseId, teeBoxId, startHole)
        }
      />

      {/* Flutter Material 3 SnackBar */}
      {snackMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm z-50 px-5 py-3.5 rounded-2xl bg-[#1C2721] dark:bg-[#E4ECE6] text-white dark:text-[#141C18] text-sm font-medium shadow-xl flex items-center justify-between gap-4"
        >
          <span className="truncate">{snackMessage}</span>
          <button
            type="button"
            onClick={() => setSnackMessage(null)}
            className="text-xs font-semibold text-emerald-300 dark:text-[#0F5C45] shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
