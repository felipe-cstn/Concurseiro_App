export type StudyTopicStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string; // e.g. 'application/pdf', 'image/png', 'link', 'note'
  url?: string; // external link if type is link
  dataUrl?: string; // base64 or object URL for offline storage
  uploadedAt: string;
  notes?: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  status: StudyTopicStatus;
  completedAt?: string;
  notes?: string;
  lastStudiedAt?: string;
  totalMinutesStudied: number;
  questionsTotal: number;
  questionsCorrect: number;
  attachments: Attachment[];
}

export interface Subject {
  id: string;
  name: string;
  color: string; // hex or tailwind token
  icon?: string;
  weight: number; // Peso 1, 2, 3
  weeklyTargetMinutes: number; // Weekly goal for this subject
  topics: Topic[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicTitle?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number; // líquidos
  questionsAttempted?: number;
  questionsCorrect?: number;
  qualityRating?: number; // 1 to 5
  notes?: string;
}

export type RevisionIntervalType = '24h' | '7d' | '15d' | '30d' | '60d' | 'custom';

export interface ScheduledRevision {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicTitle: string;
  scheduledDate: string; // YYYY-MM-DD
  intervalType: RevisionIntervalType;
  completed: boolean;
  completedAt?: string;
  googleCalendarEventId?: string;
}

export interface WeeklyGoal {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  targetTotalMinutes: number;
  targetTotalQuestions: number;
  subjectTargets: { [subjectId: string]: number }; // subjectId -> target minutes
  daySchedule: { [dayOfWeek: number]: string[] }; // 0-6 (Sun-Sat) -> array of subjectIds
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'hours' | 'questions' | 'revisions' | 'completion';
  unlockedAt?: string;
  progress: number; // 0 to 100
}

export interface UserStats {
  xp: number;
  level: number;
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  streakFreezeRemaining: number;
  totalMinutesStudied: number;
  totalQuestionsSolved: number;
  totalQuestionsCorrect: number;
  totalRevisionsDone: number;
  unlockedBadges: string[]; // Badge IDs
}

export interface AppSettings {
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  autoStartBreak: boolean;
  theme: 'dark' | 'light';
  dailyTargetMinutes: number;
  cloudSyncEnabled: boolean;
}
