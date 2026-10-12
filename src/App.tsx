import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { FocusTimer } from './components/Timer/FocusTimer';
import { SubjectList } from './components/Subjects/SubjectList';
import { GoalsSchedule } from './components/WeeklyGoals/GoalsSchedule';
import { RevisionsManager } from './components/Revisions/RevisionsManager';
import { DailyReport } from './components/Reports/DailyReport';
import { MonthlyReport } from './components/Reports/MonthlyReport';
import { GamificationModal } from './components/Gamification/GamificationModal';
import { GoogleCalendarSyncModal } from './components/Calendar/GoogleCalendarSyncModal';
import { BackupModal } from './components/Common/BackupModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');
  const [reportSubTab, setReportSubTab] = useState<'daily' | 'monthly'>('daily');

  // Modals state
  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGamification={() => setIsGamificationOpen(true)}
        onOpenCalendarSync={() => setIsCalendarSyncOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'timer' && <FocusTimer />}

        {activeTab === 'subjects' && <SubjectList />}

        {activeTab === 'schedule' && <GoalsSchedule />}

        {activeTab === 'revisions' && <RevisionsManager />}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Reports Sub-navigation */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2 bg-zinc-200/60 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <button
                  onClick={() => setReportSubTab('daily')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    reportSubTab === 'daily'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Desempenho Diário
                </button>
                <button
                  onClick={() => setReportSubTab('monthly')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    reportSubTab === 'monthly'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Relatório Mensal Personalizado
                </button>
              </div>
            </div>

            {reportSubTab === 'daily' ? <DailyReport /> : <MonthlyReport />}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
      />

      <GoogleCalendarSyncModal
        isOpen={isCalendarSyncOpen}
        onClose={() => setIsCalendarSyncOpen(false)}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
