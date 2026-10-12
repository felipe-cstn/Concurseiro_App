import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  Award,
  AlertTriangle,
  Printer,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const MonthlyReport: React.FC = () => {
  const { sessions, subjects, userStats } = useStudy();

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  // Filter sessions in this month
  const monthSessions = useMemo(() => {
    return sessions.filter(s => s.startTime.startsWith(monthPrefix));
  }, [sessions, monthPrefix]);

  // Total days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Aggregate stats
  const totalMinutes = useMemo(() => {
    return monthSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [monthSessions]);

  const totalQuestions = useMemo(() => {
    return monthSessions.reduce((acc, s) => acc + (s.questionsAttempted || 0), 0);
  }, [monthSessions]);

  const totalCorrect = useMemo(() => {
    return monthSessions.reduce((acc, s) => acc + (s.questionsCorrect || 0), 0);
  }, [monthSessions]);

  const avgAccuracy = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;

  // Active study days in month
  const activeDaysSet = useMemo(() => {
    const set = new Set<string>();
    monthSessions.forEach(s => set.add(s.startTime.split('T')[0]));
    return set;
  }, [monthSessions]);

  // Day-by-day minutes for SVG chart
  const dailyMinutes = useMemo(() => {
    const map: number[] = Array.from({ length: daysInMonth }, () => 0);
    monthSessions.forEach(s => {
      const day = parseInt(s.startTime.split('T')[0].split('-')[2], 10);
      if (day >= 1 && day <= daysInMonth) {
        map[day - 1] += s.durationMinutes;
      }
    });
    return map;
  }, [monthSessions, daysInMonth]);

  const maxDailyMinutes = Math.max(120, ...dailyMinutes); // at least 2h scale

  // Stats by Subject
  const subjectStats = useMemo(() => {
    const map: {
      [id: string]: {
        name: string;
        color: string;
        minutes: number;
        questions: number;
        correct: number;
        weight: number;
      };
    } = {};

    subjects.forEach(s => {
      map[s.id] = {
        name: s.name,
        color: s.color,
        minutes: 0,
        questions: 0,
        correct: 0,
        weight: s.weight
      };
    });

    monthSessions.forEach(s => {
      if (map[s.subjectId]) {
        map[s.subjectId].minutes += s.durationMinutes;
        map[s.subjectId].questions += s.questionsAttempted || 0;
        map[s.subjectId].correct += s.questionsCorrect || 0;
      }
    });

    return Object.values(map);
  }, [subjects, monthSessions]);

  // Strengths & Weaknesses
  const diagnosis = useMemo(() => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    subjectStats.forEach(stat => {
      const acc = stat.questions > 0 ? (stat.correct / stat.questions) * 100 : null;

      if (acc !== null && acc >= 80 && stat.questions >= 10) {
        strengths.push(`${stat.name} (${Math.round(acc)}% de acerto em ${stat.questions} questões)`);
      } else if (acc !== null && acc < 65 && stat.questions >= 10) {
        weaknesses.push(`${stat.name} (Apenas ${Math.round(acc)}% de assertividade - Requer revisão teórica e resolução de provas anteriores)`);
      }

      if (stat.weight === 3 && stat.minutes < 180) {
        weaknesses.push(`${stat.name} tem Peso 3 no concurso, mas recebeu pouca carga horária este mês (< 3h).`);
      }
    });

    if (strengths.length === 0) {
      strengths.push('Constância em desenvolvimento. Mantenha o ritmo de resolução de questões.');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Distribuição equilibrada! Continue com o ciclo de revisões programadas.');
    }

    return { strengths, weaknesses };
  }, [subjectStats]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Month Navigator Header */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Relatório Mensal Personalizado
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <span className="text-[11px] text-zinc-400 block">Horas Estudadas</span>
            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono mt-1 block">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              ~{Math.round(totalMinutes / (activeDaysSet.size || 1))} min/dia ativo
            </span>
          </div>

          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <span className="text-[11px] text-zinc-400 block">Consistência Mensal</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1 block">
              {activeDaysSet.size} / {daysInMonth} dias
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              {Math.round((activeDaysSet.size / daysInMonth) * 100)}% de frequência
            </span>
          </div>

          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <span className="text-[11px] text-zinc-400 block">Total de Questões</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
              {totalQuestions}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              {totalCorrect} acertos
            </span>
          </div>

          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <span className="text-[11px] text-zinc-400 block">Aproveitamento Médio</span>
            <span className="text-2xl font-black text-amber-500 font-mono mt-1 block">
              {totalQuestions > 0 ? `${avgAccuracy}%` : '—'}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              Precisão geral da banca
            </span>
          </div>
        </div>

        {/* Daily Bar Chart */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Evolução Diária de Tempo Líquido (Dias 1 a {daysInMonth})
            </h3>
            <span className="text-[11px] text-zinc-400">Escala máx: {Math.round(maxDailyMinutes / 60)}h</span>
          </div>

          <div className="w-full h-36 flex items-end gap-1 sm:gap-1.5 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            {dailyMinutes.map((minutes, idx) => {
              const dayNum = idx + 1;
              const barHeightPct = maxDailyMinutes > 0 ? (minutes / maxDailyMinutes) * 100 : 0;
              const isToday = selectedYear === currentDate.getFullYear() &&
                              selectedMonth === currentDate.getMonth() &&
                              dayNum === currentDate.getDate();

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 hidden group-hover:flex bg-zinc-900 text-white text-[10px] px-1.5 py-0.5 rounded-md whitespace-nowrap z-10 font-mono shadow-md">
                    Dia {dayNum}: {Math.floor(minutes / 60)}h {minutes % 60}m
                  </div>

                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      minutes > 0
                        ? isToday
                          ? 'bg-amber-500'
                          : 'bg-blue-600 hover:bg-blue-500'
                        : 'bg-zinc-100 dark:bg-zinc-800/40'
                    }`}
                    style={{ height: `${Math.max(4, barHeightPct)}%` }}
                  />
                  <span className="text-[9px] text-zinc-400 mt-1 font-mono hidden sm:inline">
                    {dayNum % 5 === 0 || dayNum === 1 || dayNum === daysInMonth ? dayNum : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disciplines Performance & Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Discipline Table Breakdown */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Distribuição por Disciplina no Mês
          </h3>

          <div className="space-y-3">
            {subjectStats.map(stat => {
              const statAcc = stat.questions > 0
                ? Math.round((stat.correct / stat.questions) * 100)
                : null;
              const pctOfTotal = totalMinutes > 0
                ? Math.round((stat.minutes / totalMinutes) * 100)
                : 0;

              return (
                <div
                  key={stat.name}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span>{stat.name}</span>
                    </div>
                    <span className="font-mono">{Math.floor(stat.minutes / 60)}h {stat.minutes % 60}m</span>
                  </div>

                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden my-1.5">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: stat.color, width: `${pctOfTotal}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{pctOfTotal}% do tempo dedicado</span>
                    <span>
                      {stat.questions > 0
                        ? `${stat.correct}/${stat.questions} questões (${statAcc}%)`
                        : 'Sem questões registradas'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnosis: Pontos Fortes e Pontos de Atenção */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs space-y-6">
          {/* Pontos Fortes */}
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-3">
              <Award className="w-4 h-4" />
              <span>Pontos Fortes do Concurseiro</span>
            </div>
            <ul className="space-y-2">
              {diagnosis.strengths.map((st, i) => (
                <li
                  key={i}
                  className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 flex items-start gap-2"
                >
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pontos de Atenção */}
          <div>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-bold mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span>Pontos de Atenção & Ajuste de Rota</span>
            </div>
            <ul className="space-y-2">
              {diagnosis.weaknesses.map((wk, i) => (
                <li
                  key={i}
                  className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 flex items-start gap-2"
                >
                  <span className="text-amber-500 font-bold">!</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
