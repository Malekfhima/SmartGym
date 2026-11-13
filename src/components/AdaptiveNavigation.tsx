import { BarChart3, ClipboardList, Compass, Flag, Home, Moon, Plus, Sun } from 'lucide-react';
import { NavTab } from '../types/golf';

interface AdaptiveNavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewRound: () => void;
  hasLiveRound: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'scorecard', label: 'Scorecard', icon: ClipboardList },
  { id: 'courses', label: 'Courses', icon: Compass },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
];

const SCREEN_TITLES: Record<NavTab, string> = {
  home: 'Clubhouse',
  scorecard: 'Live Scorecard',
  courses: 'Courses',
  stats: 'Stats & Bag',
};

export function AdaptiveNavigation({
  activeTab,
  onSelectTab,
  onNewRound,
  hasLiveRound,
  isDark,
  onToggleTheme,
}: AdaptiveNavigationProps) {
  return (
    <>
      {/* Desktop Flutter Material 3 NavigationRail / Drawer */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-[#F0F4F0] dark:bg-[#121916] border-r border-[#DCE3DD] dark:border-[#222D28] z-30">
        <div className="px-5 pt-6 pb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45] rounded-xl"
          >
            <span className="w-10 h-10 rounded-2xl bg-[#0F5C45] text-white flex items-center justify-center shadow-sm">
              <Flag className="w-5 h-5" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-[#141C18] dark:text-[#EDF2EE]">
              Par
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#45534B] dark:text-[#A3B3AA] hover:bg-[#E2EAE3] dark:hover:bg-[#1D2823] m3-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45]"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Material 3 Extended FAB */}
        <div className="px-4 pb-5">
          <button
            type="button"
            onClick={onNewRound}
            className="w-full h-12 rounded-2xl bg-[#0F5C45] hover:bg-[#0C4C39] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0F5C45]/15 m3-press whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F5C45]"
          >
            <Plus className="w-4 h-4" />
            <span>New Round</span>
          </button>
        </div>

        {/* Material 3 Navigation Destinations */}
        <nav aria-label="Primary navigation" className="flex-1 px-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full h-12 px-4 rounded-full flex items-center justify-between text-sm font-medium transition-colors m3-press whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C45] ${
                  active
                    ? 'bg-[#D3E8DC] dark:bg-[#193B2D] text-[#0A3E2E] dark:text-[#B9EAD3] font-semibold'
                    : 'text-[#44524A] dark:text-[#9AA9A0] hover:bg-[#E5ECE6] dark:hover:bg-[#1B2520]'
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.25 : 1.85} />
                  <span>{item.label}</span>
                </span>
                {item.id === 'scorecard' && hasLiveRound && (
                  <span className="text-[11px] font-mono font-semibold text-[#0F5C45] dark:text-emerald-300">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-[#DCE3DD] dark:border-[#222D28] text-xs text-[#5B6961] dark:text-[#86968D]">
          <p className="font-medium text-[#141C18] dark:text-[#DCE4DE]">Malek Fhima</p>
          <p className="mt-0.5">GHIN Linked · Home Club Surrey</p>
        </div>
      </aside>

      {/* Mobile Sticky Top App Bar (52px height to stay well inside 15% mobile cap) */}
      <header className="lg:hidden sticky top-0 z-30 h-[52px] px-4 bg-[#F6F8F6]/90 dark:bg-[#0E1311]/90 backdrop-blur-md border-b border-[#E2E7E3] dark:border-[#1E2823] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-[#0F5C45] text-white flex items-center justify-center shrink-0">
            <Flag className="w-4 h-4" />
          </span>
          <h1 className="font-display text-base font-bold text-[#141C18] dark:text-[#EDF2EE] truncate">
            {SCREEN_TITLES[activeTab]}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#45534B] dark:text-[#A3B3AA] hover:bg-[#E6ECE7] dark:hover:bg-[#1B2520] m3-press"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
          <button
            type="button"
            onClick={onNewRound}
            className="h-9 px-3.5 rounded-full bg-[#0F5C45] text-white text-xs font-semibold flex items-center gap-1.5 m3-press whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Round</span>
          </button>
        </div>
      </header>

      {/* Mobile Fixed Material 3 Bottom NavigationBar (60px height) */}
      <nav
        aria-label="Bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-[#F0F4F0]/95 dark:bg-[#121916]/95 backdrop-blur-md border-t border-[#DCE3DD] dark:border-[#222D28] grid grid-cols-4 items-center px-2"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className="flex flex-col items-center justify-center h-full min-w-[44px] focus-visible:outline-none"
            >
              <span
                className={`px-4 py-1 rounded-full transition-colors flex items-center justify-center ${
                  active
                    ? 'bg-[#D3E8DC] dark:bg-[#193B2D] text-[#0A3E2E] dark:text-[#B9EAD3]'
                    : 'text-[#526058] dark:text-[#8E9E95]'
                }`}
              >
                <Icon className="w-[19px] h-[19px]" strokeWidth={active ? 2.3 : 1.8} />
              </span>
              <span
                className={`text-[11px] leading-none mt-1 whitespace-nowrap ${
                  active
                    ? 'font-semibold text-[#141C18] dark:text-[#EDF2EE]'
                    : 'font-medium text-[#526058] dark:text-[#8E9E95]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
