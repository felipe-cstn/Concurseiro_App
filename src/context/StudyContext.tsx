import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Subject,
  Topic,
  StudySession,
  ScheduledRevision,
  WeeklyGoal,
  UserStats,
  AppSettings,
  Badge,
  Attachment,
  StudyTopicStatus
} from '../types/study';
import { StorageService } from '../services/storage';
import { soundPlayer } from '../services/audio';
import { NotificationService } from '../services/notifications';
import { initAuth, googleSignIn, logout, getAccessToken } from '../services/firebase';
import { CONCURSEIRO_RANKS, getMondayOfCurrentWeek } from '../services/seedData';
import { User } from 'firebase/auth';

export type TimerMode = 'pomodoro' | 'stopwatch' | 'break';

export interface ActiveTimerState {
  isRunning: boolean;
  mode: TimerMode;
  secondsElapsed: number;
  secondsRemaining: number;
  initialDuration: number;
  subjectId?: string;
  topicId?: string;
  sessionStartTime?: string;
}

interface StudyContextType {
  // State
  subjects: Subject[];
  sessions: StudySession[];
  revisions: ScheduledRevision[];
  weeklyGoal: WeeklyGoal;
  userStats: UserStats;
  badges: Badge[];
  settings: AppSettings;
  isOnline: boolean;
  currentUser: User | null;
  googleToken: string | null;
  isAuthLoading: boolean;
  activeTimer: ActiveTimerState;
  isZenMode: boolean;
  setIsZenMode: (val: boolean) => void;

  // Subjects & Topics Actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'topics'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopic: (subjectId: string, title: string, notes?: string) => void;
  updateTopic: (subjectId: string, topicId: string, updates: Partial<Topic>) => void;
  toggleTopicCompleted: (subjectId: string, topicId: string) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;
  addAttachmentToTopic: (subjectId: string, topicId: string, attachment: Attachment) => void;
  removeAttachmentFromTopic: (subjectId: string, topicId: string, attachmentId: string) => void;

  // Timer Actions
  startTimer: (mode: TimerMode, subjectId?: string, topicId?: string, customMinutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  completeTimerSession: (questionsAttempted?: number, questionsCorrect?: number, qualityRating?: number, notes?: string) => void;

  // Sessions Actions
  addManualSession: (session: Omit<StudySession, 'id'>) => void;
  deleteSession: (id: string) => void;

  // Revisions Actions
  createSpacedRevisions: (subjectId: string, topicId: string, topicTitle: string, baseDate?: Date) => void;
  toggleRevisionComplete: (revisionId: string) => void;
  deleteRevision: (revisionId: string) => void;

  // Weekly Goals Actions
  updateWeeklyGoal: (updates: Partial<WeeklyGoal>) => void;

  // Gamification Actions
  addXp: (amount: number, reason?: string) => void;
  triggerConfetti: () => void;

  // Settings Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleTheme: () => void;

  // Auth Actions
  loginWithGoogle: () => Promise<boolean>;
  logoutUser: () => Promise<void>;

  // Backup & Sync Actions
  exportData: () => string;
  importData: (json: string) => boolean;
  resetData: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core Data
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [sessions, setSessions] = useState<StudySession[]>(() => StorageService.getSessions());
  const [revisions, setRevisions] = useState<ScheduledRevision[]>(() => StorageService.getRevisions());
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal>(() => StorageService.getWeeklyGoal());
  const [userStats, setUserStats] = useState<UserStats>(() => StorageService.getUserStats());
  const [badges, setBadges] = useState<Badge[]>(() => StorageService.getBadges());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Connection & Auth
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Timer & Focus UI
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState>({
    isRunning: false,
    mode: 'pomodoro',
    secondsElapsed: 0,
    secondsRemaining: 25 * 60,
    initialDuration: 25 * 60
  });

  // Keep theme class updated on document.documentElement
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Online / Offline status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Multi-tab broadcast channel listener for real-time sync
  useEffect(() => {
    const channel = StorageService.broadcastChannel;
    if (!channel) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      if (type === 'subjects' && payload) setSubjects(payload);
      if (type === 'sessions' && payload) setSessions(payload);
      if (type === 'revisions' && payload) setRevisions(payload);
      if (type === 'weeklyGoal' && payload) setWeeklyGoal(payload);
      if (type === 'userStats' && payload) setUserStats(payload);
    };

    channel.addEventListener('message', handleMessage);
    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, []);

  // Initialize Firebase Auth & cached OAuth token
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setGoogleToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setGoogleToken(null);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save changes to storage whenever states update
  useEffect(() => {
    StorageService.saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    StorageService.saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    StorageService.saveRevisions(revisions);
  }, [revisions]);

  useEffect(() => {
    StorageService.saveWeeklyGoal(weeklyGoal);
  }, [weeklyGoal]);

  useEffect(() => {
    StorageService.saveUserStats(userStats);
  }, [userStats]);

  useEffect(() => {
    StorageService.saveBadges(badges);
  }, [badges]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  // Trigger celebration confetti
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  // Gamification: Add XP and level up check
  const addXp = useCallback((amount: number, reason?: string) => {
    setUserStats(prev => {
      const newXp = prev.xp + amount;
      let newLevel = prev.level;
      for (const rank of CONCURSEIRO_RANKS) {
        if (newXp >= rank.minXp) {
          newLevel = rank.level;
        }
      }

      if (newLevel > prev.level) {
        if (settings.soundEnabled) soundPlayer.playLevelUp(settings.soundVolume);
        triggerConfetti();
        NotificationService.sendNotification(`Parabéns! Subiu para o Nível ${newLevel}!`, {
          body: `Você conquistou a patente: ${CONCURSEIRO_RANKS.find(r => r.level === newLevel)?.title}`
        });
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  }, [settings.soundEnabled, settings.soundVolume, triggerConfetti]);

  // Check badges unlock conditions
  const checkBadges = useCallback((updatedStats: UserStats, allSessions: StudySession[], allRevisions: ScheduledRevision[], allSubjects: Subject[]) => {
    const newlyUnlocked: string[] = [];

    setBadges(prevBadges => {
      return prevBadges.map(badge => {
        if (badge.unlockedAt) return badge; // already unlocked

        let shouldUnlock = false;
        let progress = 0;

        if (badge.id === 'badge-first-focus') {
          progress = allSessions.length > 0 ? 100 : 0;
          shouldUnlock = allSessions.length >= 1;
        } else if (badge.id === 'badge-fire-streak-3') {
          progress = Math.min(100, Math.round((updatedStats.streakDays / 3) * 100));
          shouldUnlock = updatedStats.streakDays >= 3;
        } else if (badge.id === 'badge-fire-streak-7') {
          progress = Math.min(100, Math.round((updatedStats.streakDays / 7) * 100));
          shouldUnlock = updatedStats.streakDays >= 7;
        } else if (badge.id === 'badge-marathon-3h') {
          // Check if any day has >= 180 min
          const minutesByDay: { [date: string]: number } = {};
          allSessions.forEach(s => {
            const date = s.startTime.split('T')[0];
            minutesByDay[date] = (minutesByDay[date] || 0) + s.durationMinutes;
          });
          const maxDayMinutes = Math.max(0, ...Object.values(minutesByDay));
          progress = Math.min(100, Math.round((maxDayMinutes / 180) * 100));
          shouldUnlock = maxDayMinutes >= 180;
        } else if (badge.id === 'badge-sniper-100') {
          progress = Math.min(100, Math.round((updatedStats.totalQuestionsSolved / 100) * 100));
          shouldUnlock = updatedStats.totalQuestionsSolved >= 100;
        } else if (badge.id === 'badge-review-master') {
          progress = Math.min(100, Math.round((updatedStats.totalRevisionsDone / 10) * 100));
          shouldUnlock = updatedStats.totalRevisionsDone >= 10;
        } else if (badge.id === 'badge-edital-hero') {
          const hasCompleteSubject = allSubjects.some(
            s => s.topics.length > 0 && s.topics.every(t => t.status === 'completed')
          );
          progress = hasCompleteSubject ? 100 : 50;
          shouldUnlock = hasCompleteSubject;
        }

        if (shouldUnlock && !badge.unlockedAt) {
          newlyUnlocked.push(badge.id);
          return {
            ...badge,
            progress: 100,
            unlockedAt: new Date().toISOString()
          };
        }

        return { ...badge, progress };
      });
    });

    if (newlyUnlocked.length > 0) {
      triggerConfetti();
      if (settings.soundEnabled) soundPlayer.playLevelUp(settings.soundVolume);
    }
  }, [settings.soundEnabled, settings.soundVolume, triggerConfetti]);

  // Timer Tick Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev.isRunning) return prev;

          if (prev.mode === 'stopwatch') {
            return {
              ...prev,
              secondsElapsed: prev.secondsElapsed + 1
            };
          } else {
            // Countdown (Pomodoro or Break)
            if (prev.secondsRemaining <= 1) {
              // Timer finished!
              if (settings.soundEnabled) {
                if (prev.mode === 'break') {
                  soundPlayer.playBreakComplete(settings.soundVolume);
                } else {
                  soundPlayer.playSessionComplete(settings.soundVolume);
                }
              }

              NotificationService.sendNotification(
                prev.mode === 'pomodoro' ? 'Sessão de Foco Concluída! 🎯' : 'Pausa finalizada! Hora de retomar o foco 📚',
                { body: 'Excelente disciplina! Mantenha a consistência.' }
              );

              return {
                ...prev,
                isRunning: false,
                secondsRemaining: 0,
                secondsElapsed: prev.initialDuration
              };
            }

            return {
              ...prev,
              secondsElapsed: prev.secondsElapsed + 1,
              secondsRemaining: prev.secondsRemaining - 1
            };
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.isRunning, settings.soundEnabled, settings.soundVolume]);

  // Timer Controls
  const startTimer = useCallback((mode: TimerMode, subjectId?: string, topicId?: string, customMinutes?: number) => {
    let durationSec = 25 * 60;
    if (mode === 'break') {
      durationSec = (settings.pomodoroBreakMinutes || 5) * 60;
    } else if (mode === 'pomodoro') {
      durationSec = (customMinutes || settings.pomodoroWorkMinutes || 25) * 60;
    } else if (mode === 'stopwatch') {
      durationSec = 0;
    }

    if (settings.soundEnabled) soundPlayer.playClick(settings.soundVolume);

    setActiveTimer({
      isRunning: true,
      mode,
      secondsElapsed: 0,
      secondsRemaining: durationSec,
      initialDuration: durationSec,
      subjectId,
      topicId,
      sessionStartTime: new Date().toISOString()
    });
  }, [settings.pomodoroBreakMinutes, settings.pomodoroWorkMinutes, settings.soundEnabled, settings.soundVolume]);

  const pauseTimer = useCallback(() => {
    if (settings.soundEnabled) soundPlayer.playClick(settings.soundVolume);
    setActiveTimer(prev => ({ ...prev, isRunning: false }));
  }, [settings.soundEnabled, settings.soundVolume]);

  const resumeTimer = useCallback(() => {
    if (settings.soundEnabled) soundPlayer.playClick(settings.soundVolume);
    setActiveTimer(prev => ({ ...prev, isRunning: true }));
  }, [settings.soundEnabled, settings.soundVolume]);

  const stopTimer = useCallback(() => {
    if (settings.soundEnabled) soundPlayer.playClick(settings.soundVolume);
    setActiveTimer(prev => ({
      ...prev,
      isRunning: false,
      secondsElapsed: 0,
      secondsRemaining: prev.initialDuration
    }));
  }, [settings.soundEnabled, settings.soundVolume]);

  // Complete and save study session
  const completeTimerSession = useCallback((
    questionsAttempted: number = 0,
    questionsCorrect: number = 0,
    qualityRating: number = 5,
    notes: string = ''
  ) => {
    const elapsedMinutes = Math.max(1, Math.round(activeTimer.secondsElapsed / 60));
    const targetSubject = subjects.find(s => s.id === activeTimer.subjectId);
    const targetTopic = targetSubject?.topics.find(t => t.id === activeTimer.topicId);

    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      subjectId: targetSubject ? targetSubject.id : 'subj-geral',
      subjectName: targetSubject ? targetSubject.name : 'Estudo Geral',
      topicId: targetTopic?.id,
      topicTitle: targetTopic?.title,
      startTime: activeTimer.sessionStartTime || new Date(Date.now() - elapsedMinutes * 60000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: elapsedMinutes,
      questionsAttempted,
      questionsCorrect,
      qualityRating,
      notes
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);

    // Update topic time & questions if attached
    if (targetSubject && targetTopic) {
      setSubjects(prev =>
        prev.map(subj => {
          if (subj.id !== targetSubject.id) return subj;
          return {
            ...subj,
            topics: subj.topics.map(top => {
              if (top.id !== targetTopic.id) return top;
              return {
                ...top,
                totalMinutesStudied: top.totalMinutesStudied + elapsedMinutes,
                questionsTotal: top.questionsTotal + questionsAttempted,
                questionsCorrect: top.questionsCorrect + questionsCorrect,
                lastStudiedAt: new Date().toISOString(),
                status: top.status === 'not_started' ? 'in_progress' : top.status
              };
            })
          };
        })
      );
    }

    // Update streak and gamification
    const todayStr = new Date().toISOString().split('T')[0];
    const earnedXp = elapsedMinutes * 2 + questionsCorrect * 5 + (questionsAttempted > 0 ? 10 : 0);

    setUserStats(prev => {
      let newStreak = prev.streakDays;
      if (prev.lastStudyDate !== todayStr) {
        // check if yesterday was last study date
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (prev.lastStudyDate === yesterday) {
          newStreak = prev.streakDays + 1;
        } else if (prev.lastStudyDate === '') {
          newStreak = 1;
        } else {
          // streak broken, reset to 1
          newStreak = 1;
        }
      }

      const updatedStats: UserStats = {
        ...prev,
        xp: prev.xp + earnedXp,
        streakDays: newStreak,
        lastStudyDate: todayStr,
        totalMinutesStudied: prev.totalMinutesStudied + elapsedMinutes,
        totalQuestionsSolved: prev.totalQuestionsSolved + questionsAttempted,
        totalQuestionsCorrect: prev.totalQuestionsCorrect + questionsCorrect
      };

      checkBadges(updatedStats, updatedSessions, revisions, subjects);
      return updatedStats;
    });

    if (settings.soundEnabled) soundPlayer.playSessionComplete(settings.soundVolume);
    stopTimer();
  }, [activeTimer, sessions, subjects, revisions, checkBadges, settings.soundEnabled, settings.soundVolume, stopTimer]);

  // Add manual session
  const addManualSession = useCallback((sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: `sess-${Date.now()}`
    };
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);

    // Update subject & topic
    if (sessionData.subjectId && sessionData.topicId) {
      setSubjects(prev =>
        prev.map(subj => {
          if (subj.id !== sessionData.subjectId) return subj;
          return {
            ...subj,
            topics: subj.topics.map(top => {
              if (top.id !== sessionData.topicId) return top;
              return {
                ...top,
                totalMinutesStudied: top.totalMinutesStudied + sessionData.durationMinutes,
                questionsTotal: top.questionsTotal + (sessionData.questionsAttempted || 0),
                questionsCorrect: top.questionsCorrect + (sessionData.questionsCorrect || 0),
                lastStudiedAt: new Date().toISOString()
              };
            })
          };
        })
      );
    }

    addXp(sessionData.durationMinutes * 2 + (sessionData.questionsCorrect || 0) * 5, 'Sessão manual');
  }, [sessions, addXp]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  // Subjects & Topics CRUD
  const addSubject = useCallback((subjectData: Omit<Subject, 'id' | 'createdAt' | 'topics'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topics: []
    };
    setSubjects(prev => [...prev, newSubject]);
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setRevisions(prev => prev.filter(r => r.subjectId !== id));
  }, []);

  const addTopic = useCallback((subjectId: string, title: string, notes?: string) => {
    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      subjectId,
      title,
      status: 'not_started',
      notes,
      totalMinutesStudied: 0,
      questionsTotal: 0,
      questionsCorrect: 0,
      attachments: []
    };
    setSubjects(prev =>
      prev.map(s => (s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s))
    );
  }, []);

  const updateTopic = useCallback((subjectId: string, topicId: string, updates: Partial<Topic>) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => (t.id === topicId ? { ...t, ...updates } : t))
        };
      })
    );
  }, []);

  // Automatic Spaced Repetition (24h, 7d, 30d)
  const createSpacedRevisions = useCallback((subjectId: string, topicId: string, topicTitle: string, baseDate: Date = new Date()) => {
    const subject = subjects.find(s => s.id === subjectId);
    const subjectName = subject ? subject.name : 'Matéria';

    const intervals: { type: ScheduledRevision['intervalType']; days: number }[] = [
      { type: '24h', days: 1 },
      { type: '7d', days: 7 },
      { type: '30d', days: 30 }
    ];

    const newRevs: ScheduledRevision[] = intervals.map(inv => {
      const targetDate = new Date(baseDate.getTime() + inv.days * 86400000);
      return {
        id: `rev-${Date.now()}-${inv.type}`,
        subjectId,
        subjectName,
        topicId,
        topicTitle,
        scheduledDate: targetDate.toISOString().split('T')[0],
        intervalType: inv.type,
        completed: false
      };
    });

    setRevisions(prev => [...prev, ...newRevs]);
  }, [subjects]);

  const toggleTopicCompleted = useCallback((subjectId: string, topicId: string) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => {
            if (t.id !== topicId) return t;
            const newStatus: StudyTopicStatus = t.status === 'completed' ? 'in_progress' : 'completed';
            const completedAt = newStatus === 'completed' ? new Date().toISOString() : undefined;

            if (newStatus === 'completed') {
              triggerConfetti();
              addXp(50, 'Tópico concluído!');
              createSpacedRevisions(subjectId, topicId, t.title);
            }

            return {
              ...t,
              status: newStatus,
              completedAt
            };
          })
        };
      })
    );
  }, [triggerConfetti, addXp, createSpacedRevisions]);

  const deleteTopic = useCallback((subjectId: string, topicId: string) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.filter(t => t.id !== topicId)
        };
      })
    );
    setRevisions(prev => prev.filter(r => r.topicId !== topicId));
  }, []);

  const addAttachmentToTopic = useCallback((subjectId: string, topicId: string, attachment: Attachment) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => {
            if (t.id !== topicId) return t;
            return {
              ...t,
              attachments: [...t.attachments, attachment]
            };
          })
        };
      })
    );
  }, []);

  const removeAttachmentFromTopic = useCallback((subjectId: string, topicId: string, attachmentId: string) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map(t => {
            if (t.id !== topicId) return t;
            return {
              ...t,
              attachments: t.attachments.filter(a => a.id !== attachmentId)
            };
          })
        };
      })
    );
    // Also clean up from IndexedDB
    StorageService.deleteAttachmentBlob(attachmentId);
  }, []);

  // Revision Actions
  const toggleRevisionComplete = useCallback((revisionId: string) => {
    setRevisions(prev =>
      prev.map(r => {
        if (r.id !== revisionId) return r;
        const completed = !r.completed;
        if (completed) {
          addXp(35, 'Revisão concluída!');
          setUserStats(s => ({ ...s, totalRevisionsDone: s.totalRevisionsDone + 1 }));
        }
        return {
          ...r,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined
        };
      })
    );
  }, [addXp]);

  const deleteRevision = useCallback((revisionId: string) => {
    setRevisions(prev => prev.filter(r => r.id !== revisionId));
  }, []);

  // Weekly Goal Updates
  const updateWeeklyGoal = useCallback((updates: Partial<WeeklyGoal>) => {
    setWeeklyGoal(prev => ({ ...prev, ...updates }));
  }, []);

  // Settings & Theme
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  }, []);

  // Google Login / Logout
  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setGoogleToken(res.accessToken);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Google Sign In failed', e);
      return false;
    }
  }, []);

  const logoutUser = useCallback(async () => {
    await logout();
    setCurrentUser(null);
    setGoogleToken(null);
  }, []);

  // Backup & Restore
  const exportData = useCallback(() => {
    return StorageService.exportAllData();
  }, []);

  const importData = useCallback((json: string): boolean => {
    const success = StorageService.importAllData(json);
    if (success) {
      setSubjects(StorageService.getSubjects());
      setSessions(StorageService.getSessions());
      setRevisions(StorageService.getRevisions());
      setWeeklyGoal(StorageService.getWeeklyGoal());
      setUserStats(StorageService.getUserStats());
      setBadges(StorageService.getBadges());
      setSettings(StorageService.getSettings());
    }
    return success;
  }, []);

  const resetData = useCallback(() => {
    StorageService.resetToInitialData();
    setSubjects(StorageService.getSubjects());
    setSessions(StorageService.getSessions());
    setRevisions(StorageService.getRevisions());
    setWeeklyGoal(StorageService.getWeeklyGoal());
    setUserStats(StorageService.getUserStats());
    setBadges(StorageService.getBadges());
    setSettings(StorageService.getSettings());
  }, []);

  const contextValue = useMemo(() => ({
    subjects,
    sessions,
    revisions,
    weeklyGoal,
    userStats,
    badges,
    settings,
    isOnline,
    currentUser,
    googleToken,
    isAuthLoading,
    activeTimer,
    isZenMode,
    setIsZenMode,

    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    toggleTopicCompleted,
    deleteTopic,
    addAttachmentToTopic,
    removeAttachmentFromTopic,

    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    completeTimerSession,

    addManualSession,
    deleteSession,

    createSpacedRevisions,
    toggleRevisionComplete,
    deleteRevision,

    updateWeeklyGoal,

    addXp,
    triggerConfetti,

    updateSettings,
    toggleTheme,

    loginWithGoogle,
    logoutUser,

    exportData,
    importData,
    resetData
  }), [
    subjects,
    sessions,
    revisions,
    weeklyGoal,
    userStats,
    badges,
    settings,
    isOnline,
    currentUser,
    googleToken,
    isAuthLoading,
    activeTimer,
    isZenMode,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    toggleTopicCompleted,
    deleteTopic,
    addAttachmentToTopic,
    removeAttachmentFromTopic,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    completeTimerSession,
    addManualSession,
    deleteSession,
    createSpacedRevisions,
    toggleRevisionComplete,
    deleteRevision,
    updateWeeklyGoal,
    addXp,
    triggerConfetti,
    updateSettings,
    toggleTheme,
    loginWithGoogle,
    logoutUser,
    exportData,
    importData,
    resetData
  ]);

  return (
    <StudyContext.Provider value={contextValue}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
