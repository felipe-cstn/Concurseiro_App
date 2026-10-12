import React from 'react';
import {
  Timer,
  BookOpen,
  Calendar,
  RotateCcw,
  BarChart3,
  Flame,
  Trophy,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Database,
  CalendarCheck
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export type ActiveTab = 'timer' | 'subjects' | 'schedule' | 'revisions' | 'reports';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenGamification: () => void;
  onOpenCalendarSync: () => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGamification,
  onOpenCalendarSync,
  onOpenBackup
}) => {
  const {
    userStats,
    settings,
    toggleTheme,
    isOnline,
    currentUser,
    revisions
  } = useStudy();

  const pendingRevisionsCount = revisions.filter(
    r => !r.completed && r.scheduledDate <= new Date().toISOString().split('T')[0]
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-xs">
              <span className="font-black text-sm tracking-tighter">FC</span>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 block">
                FocoConcurso
              </span>
              <span className="text-[10px] text-zinc-500 font-medium block -mt-0.5">
                Alta Performance
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/80 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'timer'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-blue-500" />
              <span>Foco</span>
            </button>

            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'subjects'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              <span>Edital</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Metas & Ciclo</span>
            </button>

            <button
              onClick={() => setActiveTab('revisions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'revisions'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
              <span>Revisões</span>
              {pendingRevisionsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
              <span>Relatórios</span>
            </button>
          </nav>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2">
            {/* Streak Counter */}
            <button
              onClick={onOpenGamification}
              className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
              title="Dias seguidos de estudo (Streak)"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{userStats.streakDays}</span>
            </button>

            {/* XP Level Badge */}
            <button
              onClick={onOpenGamification}
              className="hidden sm:flex px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 items-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              title="Nível e Conquistas"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span>Nv. {userStats.level}</span>
            </button>

            {/* Offline / Online Pill */}
            <div
              className={`p-1.5 rounded-xl border text-xs flex items-center transition-colors ${
                isOnline
                  ? 'text-emerald-600 border-emerald-200/60 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/40'
                  : 'text-amber-600 border-amber-200/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/40'
              }`}
              title={isOnline ? 'Conectado à internet (Sincronização Ativa)' : 'Modo Offline Ativo (Armazenamento Local Garantido)'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </div>

            {/* Google Calendar Link Button */}
            <button
              onClick={onOpenCalendarSync}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                currentUser
                  ? 'border-blue-200/60 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                  : 'border-zinc-200/60 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Google Calendar"
            >
              <CalendarCheck className="w-4 h-4" />
            </button>

            {/* Backup & Sync Modal */}
            <button
              onClick={onOpenBackup}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Backup e Sincronização entre Dispositivos"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={settings.theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-100 dark:border-zinc-850">
          <button
            onClick={() => setActiveTab('timer')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 ${
              activeTab === 'timer' ? 'text-blue-600 font-bold' : 'text-zinc-500'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span className="text-[10px]">Foco</span>
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 ${
              activeTab === 'subjects' ? 'text-purple-600 font-bold' : 'text-zinc-500'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px]">Edital</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 ${
              activeTab === 'schedule' ? 'text-indigo-600 font-bold' : 'text-zinc-500'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[10px]">Metas</span>
          </button>

          <button
            onClick={() => setActiveTab('revisions')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 relative ${
              activeTab === 'revisions' ? 'text-emerald-600 font-bold' : 'text-zinc-500'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px]">Revisões</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 ${
              activeTab === 'reports' ? 'text-amber-600 font-bold' : 'text-zinc-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px]">Relatórios</span>
          </button>
        </div>
      </div>
    </header>
  );
};
