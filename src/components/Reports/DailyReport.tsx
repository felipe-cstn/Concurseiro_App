import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Star,
  Activity,
  Award
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const DailyReport: React.FC = () => {
  const {
    sessions,
    subjects,
    addManualSession,
    deleteSession,
    settings
  } = useStudy();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Manual Session State
  const [manualSubjectId, setManualSubjectId] = useState(subjects[0]?.id || '');
  const [manualTopicTitle, setManualTopicTitle] = useState('');
  const [manualDurationMinutes, setManualDurationMinutes] = useState(60);
  const [manualQuestions, setManualQuestions] = useState(20);
  const [manualCorrect, setManualCorrect] = useState(16);
  const [manualNotes, setManualNotes] = useState('');
  const [manualRating, setManualRating] = useState(5);

  // Filter sessions for selected date
  const daySessions = useMemo(() => {
    return sessions.filter(s => s.startTime.startsWith(selectedDate));
  }, [sessions, selectedDate]);

  // Aggregate stats
  const totalMinutes = useMemo(() => {
    return daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [daySessions]);

  const totalQuestions = useMemo(() => {
    return daySessions.reduce((acc, s) => acc + (s.questionsAttempted || 0), 0);
  }, [daySessions]);

  const totalCorrect = useMemo(() => {
    return daySessions.reduce((acc, s) => acc + (s.questionsCorrect || 0), 0);
  }, [daySessions]);

  const accuracyRate = totalQuestions > 0
    ? Math.round((totalCorrect / totalQuestions) * 100)
    : 0;

  // Minutes by subject for visual breakdown
  const subjectMinutes = useMemo(() => {
    const map: { [name: string]: { minutes: number; color: string } } = {};
    daySessions.forEach(s => {
      const subj = subjects.find(item => item.id === s.subjectId);
      const name = s.subjectName || subj?.name || 'Geral';
      const color = subj?.color || '#3B82F6';
      if (!map[name]) {
        map[name] = { minutes: 0, color };
      }
      map[name].minutes += s.durationMinutes;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      minutes: data.minutes,
      color: data.color,
      pct: totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0
    }));
  }, [daySessions, subjects, totalMinutes]);

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find(s => s.id === manualSubjectId);
    const startTime = `${selectedDate}T10:00:00.000Z`;
    const endTime = `${selectedDate}T11:00:00.000Z`;

    addManualSession({
      subjectId: manualSubjectId,
      subjectName: subj?.name || 'Geral',
      topicTitle: manualTopicTitle || undefined,
      startTime,
      endTime,
      durationMinutes: manualDurationMinutes,
      questionsAttempted: manualQuestions,
      questionsCorrect: manualCorrect,
      qualityRating: manualRating,
      notes: manualNotes || undefined
    });

    setIsManualModalOpen(false);
    setManualNotes('');
    setManualTopicTitle('');
  };

  const dailyGoalMinutes = settings.dailyTargetMinutes || 180;
  const goalProgress = Math.min(100, Math.round((totalMinutes / dailyGoalMinutes) * 100));

  return (
    <div className="space-y-6">
      {/* Date Picker & Action Header */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Desempenho Diário
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Relatório de Produtividade do Dia
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registro Manual</span>
            </button>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Liquid Hours */}
          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Horas Líquidas</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </div>
            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">
              {goalProgress}% da meta de {Math.round(dailyGoalMinutes / 60)}h/dia
            </span>
          </div>

          {/* Questions */}
          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Questões Resolvidas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {totalQuestions}
            </div>
            <span className="text-[11px] text-zinc-500 mt-2 block font-medium">
              {totalCorrect} acertos • {totalQuestions - totalCorrect} erros
            </span>
          </div>

          {/* Accuracy Rate */}
          <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Taxa de Assertividade</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {totalQuestions > 0 ? `${accuracyRate}%` : '—'}
            </div>
            <span className="text-[11px] text-zinc-400 mt-2 block">
              {accuracyRate >= 80 ? '🎯 Rendimento de Alta Performance' : accuracyRate >= 65 ? '⚖️ Rendimento Regular' : 'Reforce a teoria e lei seca'}
            </span>
          </div>
        </div>

        {/* Proportional Subject Breakdown */}
        {subjectMinutes.length > 0 && (
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2.5">
              Divisão do Tempo por Disciplina
            </h3>
            <div className="w-full h-3 rounded-full flex overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              {subjectMinutes.map((item, idx) => (
                <div
                  key={idx}
                  className="h-full transition-all"
                  style={{
                    width: `${item.pct}%`,
                    backgroundColor: item.color
                  }}
                  title={`${item.name}: ${item.minutes}m (${item.pct}%)`}
                />
              ))}
            </div>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {subjectMinutes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.name}:
                  </span>
                  <span className="text-zinc-500 font-mono">
                    {Math.floor(item.minutes / 60)}h {item.minutes % 60}m ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day Sessions Timeline */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>Sessões Registradas ({daySessions.length})</span>
        </h3>

        {daySessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            Nenhuma sessão de estudo registrada para esta data. Inicie o cronômetro ou adicione manualmente.
          </div>
        ) : (
          <div className="space-y-2.5">
            {daySessions.map(sess => (
              <div
                key={sess.id}
                className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {sess.subjectName}
                    </span>
                    {sess.topicTitle && (
                      <span className="text-zinc-500">• {sess.topicTitle}</span>
                    )}
                    <span className="font-mono text-zinc-400">
                      ({sess.durationMinutes} min)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                    {sess.questionsAttempted ? (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {sess.questionsCorrect}/{sess.questionsAttempted} questões
                      </span>
                    ) : null}

                    {sess.qualityRating && (
                      <span className="flex items-center text-amber-500">
                        {Array.from({ length: sess.qualityRating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </span>
                    )}

                    {sess.notes && <span className="italic truncate max-w-xs">"{sess.notes}"</span>}
                  </div>
                </div>

                <button
                  onClick={() => deleteSession(sess.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Excluir Registro"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Lançar Estudo Manual
            </h3>

            <form onSubmit={handleSaveManual} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Disciplina
                </label>
                <select
                  value={manualSubjectId}
                  onChange={(e) => setManualSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Assunto / Capítulo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="ex: Leitura de Doutrina e Teoria Geral"
                  value={manualTopicTitle}
                  onChange={(e) => setManualTopicTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Minutos
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={manualDurationMinutes}
                    onChange={(e) => setManualDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Questões
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={manualQuestions}
                    onChange={(e) => setManualQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Acertos
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={manualQuestions}
                    value={manualCorrect}
                    onChange={(e) => setManualCorrect(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Qualidade do Foco (1 a 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setManualRating(st)}
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                        manualRating === st
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-zinc-200 text-zinc-400'
                      }`}
                    >
                      {st} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Anotações Rápidas
                </label>
                <input
                  type="text"
                  placeholder="Resumo dos principais pontos..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-zinc-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-medium"
                >
                  Salvar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
