import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Settings,
  X,
  Target
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { getMondayOfCurrentWeek } from '../../services/seedData';

const DAYS_OF_WEEK = [
  { index: 1, name: 'Segunda', short: 'Seg' },
  { index: 2, name: 'Terça', short: 'Ter' },
  { index: 3, name: 'Quarta', short: 'Qua' },
  { index: 4, name: 'Quinta', short: 'Qui' },
  { index: 5, name: 'Sexta', short: 'Sex' },
  { index: 6, name: 'Sábado', short: 'Sáb' },
  { index: 0, name: 'Domingo', short: 'Dom' },
];

export const GoalsSchedule: React.FC = () => {
  const {
    subjects,
    sessions,
    weeklyGoal,
    updateWeeklyGoal,
    startTimer
  } = useStudy();

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [targetHoursInput, setTargetHoursInput] = useState(
    Math.round(weeklyGoal.targetTotalMinutes / 60)
  );
  const [targetQuestionsInput, setTargetQuestionsInput] = useState(
    weeklyGoal.targetTotalQuestions
  );

  // Compute this week's actual progress
  const currentMonday = getMondayOfCurrentWeek();
  const weekSessions = useMemo(() => {
    return sessions.filter(s => s.startTime >= currentMonday);
  }, [sessions, currentMonday]);

  const totalMinutesStudiedThisWeek = useMemo(() => {
    return weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [weekSessions]);

  const totalQuestionsSolvedThisWeek = useMemo(() => {
    return weekSessions.reduce((acc, s) => acc + (s.questionsAttempted || 0), 0);
  }, [weekSessions]);

  // Minutes per subject this week
  const minutesBySubject = useMemo(() => {
    const map: { [subjectId: string]: number } = {};
    weekSessions.forEach(s => {
      map[s.subjectId] = (map[s.subjectId] || 0) + s.durationMinutes;
    });
    return map;
  }, [weekSessions]);

  const progressPercentHours = weeklyGoal.targetTotalMinutes > 0
    ? Math.min(100, Math.round((totalMinutesStudiedThisWeek / weeklyGoal.targetTotalMinutes) * 100))
    : 0;

  const progressPercentQuestions = weeklyGoal.targetTotalQuestions > 0
    ? Math.min(100, Math.round((totalQuestionsSolvedThisWeek / weeklyGoal.targetTotalQuestions) * 100))
    : 0;

  // Toggle subject on a day schedule
  const toggleSubjectOnDay = (dayIndex: number, subjectId: string) => {
    const currentList = weeklyGoal.daySchedule[dayIndex] || [];
    const exists = currentList.includes(subjectId);
    const updatedList = exists
      ? currentList.filter(id => id !== subjectId)
      : [...currentList, subjectId];

    updateWeeklyGoal({
      daySchedule: {
        ...weeklyGoal.daySchedule,
        [dayIndex]: updatedList
      }
    });
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateWeeklyGoal({
      targetTotalMinutes: targetHoursInput * 60,
      targetTotalQuestions: targetQuestionsInput
    });
    setIsEditingGoals(false);
  };

  const currentDayOfWeek = new Date().getDay();

  return (
    <div className="space-y-6">
      {/* Top Card: Weekly Targets & Overview */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Target className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Metas Semanais de Estudo
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Acompanhamento do ciclo semanal (Semana com início em {new Date(currentMonday).toLocaleDateString('pt-BR')})
            </p>
          </div>

          <button
            onClick={() => setIsEditingGoals(!isEditingGoals)}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Ajustar Metas</span>
          </button>
        </div>

        {/* Edit Goals Panel */}
        {isEditingGoals && (
          <form onSubmit={handleSaveGoals} className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Meta Semanal de Horas Líquidas
                </label>
                <input
                  type="number"
                  min={1}
                  max={70}
                  value={targetHoursInput}
                  onChange={(e) => setTargetHoursInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Meta Semanal de Questões
                </label>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={targetQuestionsInput}
                  onChange={(e) => setTargetQuestionsInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingGoals(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl text-xs font-medium"
              >
                Salvar Metas
              </button>
            </div>
          </form>
        )}

        {/* Global Weekly Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Hours Card */}
          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                Horas Líquidas
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {Math.floor(totalMinutesStudiedThisWeek / 60)}h {totalMinutesStudiedThisWeek % 60}m / {Math.round(weeklyGoal.targetTotalMinutes / 60)}h
              </span>
            </div>

            <div className="w-full h-3 bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentHours}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
              <span>{progressPercentHours}% da meta atingida</span>
              <span>Restam {Math.max(0, Math.round((weeklyGoal.targetTotalMinutes - totalMinutesStudiedThisWeek) / 60))}h</span>
            </div>
          </div>

          {/* Questions Card */}
          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Questões Praticadas
              </span>
              <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {totalQuestionsSolvedThisWeek} / {weeklyGoal.targetTotalQuestions}
              </span>
            </div>

            <div className="w-full h-3 bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentQuestions}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
              <span>{progressPercentQuestions}% da meta atingida</span>
              <span>Faltam {Math.max(0, weeklyGoal.targetTotalQuestions - totalQuestionsSolvedThisWeek)} questões</span>
            </div>
          </div>
        </div>

        {/* Subjects Weekly Distribution Progress */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
            Progresso por Disciplina na Semana
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {subjects.map(subj => {
              const studied = minutesBySubject[subj.id] || 0;
              const target = subj.weeklyTargetMinutes || 240;
              const pct = target > 0 ? Math.min(100, Math.round((studied / target) * 100)) : 0;

              return (
                <div
                  key={subj.id}
                  className="p-3.5 bg-white dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[130px]">
                      {subj.name}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {Math.round(studied / 60)}h/{Math.round(target / 60)}h
                    </span>
                  </div>

                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: subj.color,
                        width: `${pct}%`
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block text-right font-medium">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Schedule / Study Cycle (Ciclo de Estudos) */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Grade Semanal & Ciclo de Disciplinas
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Defina quais matérias estudar em cada dia da semana. Clique para ativar ou desativar.
            </p>
          </div>
        </div>

        {/* Days Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mt-6">
          {DAYS_OF_WEEK.map(day => {
            const isToday = day.index === currentDayOfWeek;
            const assignedSubjectIds = weeklyGoal.daySchedule[day.index] || [];
            const assignedSubjects = subjects.filter(s => assignedSubjectIds.includes(s.id));

            return (
              <div
                key={day.index}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isToday
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 ring-1 ring-blue-500/20'
                    : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200/50 dark:border-zinc-800">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {day.name}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-md">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Badges of assigned subjects */}
                  <div className="space-y-1.5 min-h-[90px]">
                    {assignedSubjects.length === 0 ? (
                      <span className="text-[11px] text-zinc-400 italic block py-4 text-center">
                        Descanso / Livre
                      </span>
                    ) : (
                      assignedSubjects.map(s => (
                        <div
                          key={s.id}
                          className="px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between shadow-2xs group"
                        >
                          <span className="truncate max-w-[90px]">{s.name}</span>
                          <button
                            onClick={() => toggleSubjectOnDay(day.index, s.id)}
                            className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Day Action / Quick Start */}
                <div className="mt-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
                  {isToday && assignedSubjects.length > 0 && (
                    <button
                      onClick={() => startTimer('pomodoro', assignedSubjects[0].id)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer mb-2"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      Foco de Hoje
                    </button>
                  )}

                  {/* Add subject dropdown to day */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleSubjectOnDay(day.index, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="w-full px-1.5 py-1 text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 focus:outline-hidden"
                  >
                    <option value="" disabled>+ Adicionar</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
