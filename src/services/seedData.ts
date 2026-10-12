import { Subject, StudySession, ScheduledRevision, WeeklyGoal, UserStats, AppSettings, Badge } from '../types/study';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-const',
    name: 'Direito Constitucional',
    color: '#3B82F6', // Blue
    weight: 3,
    weeklyTargetMinutes: 360, // 6h
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: 'top-const-1',
        subjectId: 'subj-const',
        title: 'Princípios Fundamentais (Arts. 1º a 4º da CF/88)',
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        totalMinutesStudied: 120,
        questionsTotal: 40,
        questionsCorrect: 36,
        attachments: [
          {
            id: 'att-1',
            name: 'Resumo_Principios_Fundamentais.pdf',
            size: 245000,
            type: 'application/pdf',
            uploadedAt: new Date().toISOString(),
            notes: 'Mnemônico SOCIDIVAPU e princípios das relações internacionais'
          }
        ]
      },
      {
        id: 'top-const-2',
        subjectId: 'subj-const',
        title: 'Direitos e Deveres Individuais e Coletivos (Art. 5º)',
        status: 'in_progress',
        lastStudiedAt: new Date().toISOString(),
        totalMinutesStudied: 180,
        questionsTotal: 65,
        questionsCorrect: 57,
        attachments: [
          {
            id: 'att-2',
            name: 'Remédios Constitucionais (Tabela Comparativa)',
            size: 15400,
            type: 'link',
            url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
            uploadedAt: new Date().toISOString(),
            notes: 'Habeas Corpus, Mandado de Segurança, HD, Ação Popular'
          }
        ]
      },
      {
        id: 'top-const-3',
        subjectId: 'subj-const',
        title: 'Organização Político-Administrativa do Estado',
        status: 'not_started',
        totalMinutesStudied: 0,
        questionsTotal: 0,
        questionsCorrect: 0,
        attachments: []
      },
      {
        id: 'top-const-4',
        subjectId: 'subj-const',
        title: 'Poder Judiciário e Funções Essenciais à Justiça',
        status: 'not_started',
        totalMinutesStudied: 0,
        questionsTotal: 0,
        questionsCorrect: 0,
        attachments: []
      }
    ]
  },
  {
    id: 'subj-admin',
    name: 'Direito Administrativo',
    color: '#8B5CF6', // Purple
    weight: 3,
    weeklyTargetMinutes: 300, // 5h
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: 'top-admin-1',
        subjectId: 'subj-admin',
        title: 'Princípios da Administração Pública (LIMPE)',
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        totalMinutesStudied: 90,
        questionsTotal: 30,
        questionsCorrect: 28,
        attachments: []
      },
      {
        id: 'top-admin-2',
        subjectId: 'subj-admin',
        title: 'Atos Administrativos (Requisitos, Atributos e Extinção)',
        status: 'in_progress',
        totalMinutesStudied: 110,
        questionsTotal: 45,
        questionsCorrect: 38,
        attachments: []
      },
      {
        id: 'top-admin-3',
        subjectId: 'subj-admin',
        title: 'Nova Lei de Licitações (Lei nº 14.133/2021)',
        status: 'not_started',
        totalMinutesStudied: 0,
        questionsTotal: 0,
        questionsCorrect: 0,
        attachments: []
      },
      {
        id: 'top-admin-4',
        subjectId: 'subj-admin',
        title: 'Regime Jurídico dos Servidores Públicos',
        status: 'not_started',
        totalMinutesStudied: 0,
        questionsTotal: 0,
        questionsCorrect: 0,
        attachments: []
      }
    ]
  },
  {
    id: 'subj-port',
    name: 'Língua Portuguesa',
    color: '#10B981', // Emerald
    weight: 2,
    weeklyTargetMinutes: 240, // 4h
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: 'top-port-1',
        subjectId: 'subj-port',
        title: 'Interpretação e Compreensão de Textos',
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        totalMinutesStudied: 80,
        questionsTotal: 50,
        questionsCorrect: 42,
        attachments: []
      },
      {
        id: 'top-port-2',
        subjectId: 'subj-port',
        title: 'Sintaxe do Período: Concordância e Regência Verbal/Nominal',
        status: 'in_progress',
        totalMinutesStudied: 130,
        questionsTotal: 60,
        questionsCorrect: 49,
        attachments: []
      },
      {
        id: 'top-port-3',
        subjectId: 'subj-port',
        title: 'Emprego do Sinal Indicativo de Crase',
        status: 'needs_review',
        totalMinutesStudied: 60,
        questionsTotal: 35,
        questionsCorrect: 27,
        attachments: []
      },
      {
        id: 'top-port-4',
        subjectId: 'subj-port',
        title: 'Pontuação (Uso da vírgula nas orações adverbiais)',
        status: 'not_started',
        totalMinutesStudied: 0,
        questionsTotal: 0,
        questionsCorrect: 0,
        attachments: []
      }
    ]
  },
  {
    id: 'subj-rlm',
    name: 'Raciocínio Lógico-Matemático',
    color: '#F59E0B', // Amber
    weight: 2,
    weeklyTargetMinutes: 200,
    createdAt: new Date().toISOString(),
    topics: [
      {
        id: 'top-rlm-1',
        subjectId: 'subj-rlm',
        title: 'Proposições Lógicas e Tabelas-Verdade',
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        totalMinutesStudied: 90,
        questionsTotal: 40,
        questionsCorrect: 35,
        attachments: []
      },
      {
        id: 'top-rlm-2',
        subjectId: 'subj-rlm',
        title: 'Equivalências Lógicas e Negações de Proposições Compostas',
        status: 'in_progress',
        totalMinutesStudied: 75,
        questionsTotal: 30,
        questionsCorrect: 24,
        attachments: []
      },
      {
        id: 'top-rlm-3',
        subjectId: 'subj-rlm',
        title: 'Análise Combinatória e Probabilidade',
        status: 'not_started',
        totalMinutesStudied: 0,
        questionsTotal: 0,
        questionsCorrect: 0,
        attachments: []
      }
    ]
  }
];

export const INITIAL_REVISIONS: ScheduledRevision[] = [
  {
    id: 'rev-1',
    subjectId: 'subj-const',
    subjectName: 'Direito Constitucional',
    topicId: 'top-const-1',
    topicTitle: 'Princípios Fundamentais (Arts. 1º a 4º)',
    scheduledDate: new Date().toISOString().split('T')[0],
    intervalType: '7d',
    completed: false
  },
  {
    id: 'rev-2',
    subjectId: 'subj-admin',
    subjectName: 'Direito Administrativo',
    topicId: 'top-admin-1',
    topicTitle: 'Princípios da Administração Pública (LIMPE)',
    scheduledDate: new Date().toISOString().split('T')[0],
    intervalType: '24h',
    completed: false
  },
  {
    id: 'rev-3',
    subjectId: 'subj-port',
    subjectName: 'Língua Portuguesa',
    topicId: 'top-port-3',
    topicTitle: 'Emprego do Sinal Indicativo de Crase',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    intervalType: '15d',
    completed: false
  }
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'subj-const',
    subjectName: 'Direito Constitucional',
    topicId: 'top-const-2',
    topicTitle: 'Direitos e Deveres Individuais e Coletivos (Art. 5º)',
    startTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    durationMinutes: 60,
    questionsAttempted: 25,
    questionsCorrect: 22,
    qualityRating: 5,
    notes: 'Excelente foco no estudo de jurisprudência do STF sobre inviolabilidade domiciliar.'
  },
  {
    id: 'sess-2',
    subjectId: 'subj-admin',
    subjectName: 'Direito Administrativo',
    topicId: 'top-admin-2',
    topicTitle: 'Atos Administrativos (Requisitos e Atributos)',
    startTime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 0.75).toISOString(),
    durationMinutes: 45,
    questionsAttempted: 15,
    questionsCorrect: 13,
    qualityRating: 4,
    notes: 'Foco na diferenciação entre revogação e anulação.'
  }
];

export const ALL_BADGES: Badge[] = [
  {
    id: 'badge-first-focus',
    title: 'Primeiro Foco',
    description: 'Completou sua primeira sessão de estudo líquido.',
    icon: 'target',
    category: 'hours',
    progress: 100,
    unlockedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'badge-fire-streak-3',
    title: 'Hábito de Ferro',
    description: 'Estudou por 3 dias seguidos sem falhar.',
    icon: 'flame',
    category: 'streak',
    progress: 100,
    unlockedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'badge-fire-streak-7',
    title: 'Semana Implacável',
    description: 'Completou 7 dias consecutivos de estudos.',
    icon: 'zap',
    category: 'streak',
    progress: 57
  },
  {
    id: 'badge-marathon-3h',
    title: 'Maratona 3 Horas',
    description: 'Estudou mais de 3 horas líquidas em um único dia.',
    icon: 'clock',
    category: 'hours',
    progress: 60
  },
  {
    id: 'badge-sniper-100',
    title: 'Centurião das Questões',
    description: 'Resolveu mais de 100 questões com aproveitamento alto.',
    icon: 'award',
    category: 'questions',
    progress: 100,
    unlockedAt: new Date().toISOString()
  },
  {
    id: 'badge-review-master',
    title: 'Mestre da Curva de Esquecimento',
    description: 'Completou 10 revisões programadas no prazo.',
    icon: 'rotate-ccw',
    category: 'revisions',
    progress: 40
  },
  {
    id: 'badge-edital-hero',
    title: 'Edital Zerado',
    description: 'Concluiu 100% de todos os tópicos de uma matéria.',
    icon: 'check-circle',
    category: 'completion',
    progress: 50
  }
];

export const INITIAL_USER_STATS: UserStats = {
  xp: 1450,
  level: 3, // Nível 3: Maratona do Edital
  streakDays: 4,
  lastStudyDate: new Date().toISOString().split('T')[0],
  streakFreezeRemaining: 1,
  totalMinutesStudied: 765,
  totalQuestionsSolved: 320,
  totalQuestionsCorrect: 279,
  totalRevisionsDone: 6,
  unlockedBadges: ['badge-first-focus', 'badge-fire-streak-3', 'badge-sniper-100']
};

export const INITIAL_WEEKLY_GOAL: WeeklyGoal = {
  id: 'goal-current',
  weekStartDate: getMondayOfCurrentWeek(),
  targetTotalMinutes: 1100, // ~18h semanais
  targetTotalQuestions: 200,
  subjectTargets: {
    'subj-const': 360,
    'subj-admin': 300,
    'subj-port': 240,
    'subj-rlm': 200
  },
  daySchedule: {
    1: ['subj-const', 'subj-port'], // Segunda
    2: ['subj-admin', 'subj-rlm'],  // Terça
    3: ['subj-const', 'subj-admin'],// Quarta
    4: ['subj-port', 'subj-rlm'],   // Quinta
    5: ['subj-const', 'subj-admin'],// Sexta
    6: ['subj-port', 'subj-rlm'],   // Sábado
    0: ['subj-const']               // Domingo (revisão leve)
  }
};

export const INITIAL_APP_SETTINGS: AppSettings = {
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  soundEnabled: true,
  soundVolume: 0.6,
  autoStartBreak: false,
  theme: 'dark',
  dailyTargetMinutes: 180, // 3h/dia
  cloudSyncEnabled: true
};

export function getMondayOfCurrentWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export const CONCURSEIRO_RANKS = [
  { level: 1, title: 'Iniciante do Edital', minXp: 0, maxXp: 500 },
  { level: 2, title: 'Concurseiro Focado', minXp: 500, maxXp: 1200 },
  { level: 3, title: 'Maratonista dos Estudos', minXp: 1200, maxXp: 2500 },
  { level: 4, title: 'Mestre da Lei Seca', minXp: 2500, maxXp: 4500 },
  { level: 5, title: 'Estrategista de Bancas', minXp: 4500, maxXp: 7500 },
  { level: 6, title: 'Quase Posse', minXp: 7500, maxXp: 12000 },
  { level: 7, title: 'Nomeado no Diário Oficial', minXp: 12000, maxXp: 999999 }
];
