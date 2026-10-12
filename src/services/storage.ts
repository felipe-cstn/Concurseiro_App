import { Subject, StudySession, ScheduledRevision, WeeklyGoal, UserStats, AppSettings, Badge } from '../types/study';
import {
  INITIAL_SUBJECTS,
  INITIAL_REVISIONS,
  INITIAL_SESSIONS,
  ALL_BADGES,
  INITIAL_USER_STATS,
  INITIAL_WEEKLY_GOAL,
  INITIAL_APP_SETTINGS
} from './seedData';

const STORAGE_KEYS = {
  SUBJECTS: 'foco_subjects_v1',
  SESSIONS: 'foco_sessions_v1',
  REVISIONS: 'foco_revisions_v1',
  WEEKLY_GOAL: 'foco_weekly_goal_v1',
  USER_STATS: 'foco_user_stats_v1',
  SETTINGS: 'foco_settings_v1',
  BADGES: 'foco_badges_v1',
  CLOUD_SYNC_TS: 'foco_last_sync_ts'
};

// IndexedDB database for large attachments
const IDB_NAME = 'FocoConcursoDB';
const IDB_VERSION = 1;
const IDB_STORE_ATTACHMENTS = 'attachments';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE_ATTACHMENTS)) {
        db.createObjectStore(IDB_STORE_ATTACHMENTS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageService = {
  // Subjects
  getSubjects(): Subject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading subjects from localStorage', e);
    }
    return INITIAL_SUBJECTS;
  },

  saveSubjects(subjects: Subject[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
      this.broadcastChange('subjects', subjects);
    } catch (e) {
      console.error('Error saving subjects to localStorage', e);
    }
  },

  // Sessions
  getSessions(): StudySession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading sessions from localStorage', e);
    }
    return INITIAL_SESSIONS;
  },

  saveSessions(sessions: StudySession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      this.broadcastChange('sessions', sessions);
    } catch (e) {
      console.error('Error saving sessions to localStorage', e);
    }
  },

  // Revisions
  getRevisions(): ScheduledRevision[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVISIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading revisions from localStorage', e);
    }
    return INITIAL_REVISIONS;
  },

  saveRevisions(revisions: ScheduledRevision[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisions));
      this.broadcastChange('revisions', revisions);
    } catch (e) {
      console.error('Error saving revisions to localStorage', e);
    }
  },

  // Weekly Goal
  getWeeklyGoal(): WeeklyGoal {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_GOAL);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading weekly goal from localStorage', e);
    }
    return INITIAL_WEEKLY_GOAL;
  },

  saveWeeklyGoal(goal: WeeklyGoal): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_GOAL, JSON.stringify(goal));
      this.broadcastChange('weeklyGoal', goal);
    } catch (e) {
      console.error('Error saving weekly goal to localStorage', e);
    }
  },

  // User Stats
  getUserStats(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading user stats from localStorage', e);
    }
    return INITIAL_USER_STATS;
  },

  saveUserStats(stats: UserStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
      this.broadcastChange('userStats', stats);
    } catch (e) {
      console.error('Error saving user stats to localStorage', e);
    }
  },

  // Badges
  getBadges(): Badge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BADGES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading badges from localStorage', e);
    }
    return ALL_BADGES;
  },

  saveBadges(badges: Badge[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
    } catch (e) {
      console.error('Error saving badges to localStorage', e);
    }
  },

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading settings from localStorage', e);
    }
    return INITIAL_APP_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  },

  // Large Attachment Storage via IndexedDB (offline-ready)
  async saveAttachmentBlob(id: string, name: string, type: string, dataUrl: string): Promise<void> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE_ATTACHMENTS, 'readwrite');
        const store = tx.objectStore(IDB_STORE_ATTACHMENTS);
        store.put({ id, name, type, dataUrl, savedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Fallback: IndexedDB unavailable, continuing with memory/in-line storage', e);
    }
  },

  async getAttachmentBlob(id: string): Promise<{ id: string; name: string; dataUrl: string; type: string } | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE_ATTACHMENTS, 'readonly');
        const store = tx.objectStore(IDB_STORE_ATTACHMENTS);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  async deleteAttachmentBlob(id: string): Promise<void> {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE_ATTACHMENTS, 'readwrite');
        const store = tx.objectStore(IDB_STORE_ATTACHMENTS);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch (e) {
      // ignore
    }
  },

  // Cross-tab broadcast channel for real-time synchronization
  broadcastChannel: typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('foco_sync_bus') : null,

  broadcastChange(type: string, payload: unknown) {
    try {
      this.broadcastChannel?.postMessage({ type, payload, timestamp: Date.now() });
    } catch (e) {
      // ignore
    }
  },

  // Complete Export & Import for Cloud/Device Migration & Backups
  exportAllData(): string {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      subjects: this.getSubjects(),
      sessions: this.getSessions(),
      revisions: this.getRevisions(),
      weeklyGoal: this.getWeeklyGoal(),
      userStats: this.getUserStats(),
      settings: this.getSettings(),
      badges: this.getBadges()
    };
    return JSON.stringify(payload, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.subjects) this.saveSubjects(data.subjects);
      if (data.sessions) this.saveSessions(data.sessions);
      if (data.revisions) this.saveRevisions(data.revisions);
      if (data.weeklyGoal) this.saveWeeklyGoal(data.weeklyGoal);
      if (data.userStats) this.saveUserStats(data.userStats);
      if (data.settings) this.saveSettings(data.settings);
      if (data.badges) this.saveBadges(data.badges);
      return true;
    } catch (e) {
      console.error('Failed to import backup data', e);
      return false;
    }
  },

  resetToInitialData(): void {
    this.saveSubjects(INITIAL_SUBJECTS);
    this.saveSessions(INITIAL_SESSIONS);
    this.saveRevisions(INITIAL_REVISIONS);
    this.saveWeeklyGoal(INITIAL_WEEKLY_GOAL);
    this.saveUserStats(INITIAL_USER_STATS);
    this.saveBadges(ALL_BADGES);
    this.saveSettings(INITIAL_APP_SETTINGS);
  }
};
