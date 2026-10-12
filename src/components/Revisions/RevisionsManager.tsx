import React, { useState } from 'react';
import {
  RotateCcw,
  Calendar,
  CheckCircle2,
  Circle,
  Bell,
  Trash2,
  Plus,
  Play
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { NotificationService } from '../../services/notifications';
import { GoogleCalendarSyncModal } from '../Calendar/GoogleCalendarSyncModal';

export const RevisionsManager: React.FC = () => {
  const {
    revisions,
    toggleRevisionComplete,
    deleteRevision,
    subjects,
    createSpacedRevisions,
    startTimer
  } = useStudy();

  const [filterTab, setFilterTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Revision form state
  const [manualSubjectId, setManualSubjectId] = useState(subjects[0]?.id || '');
  const [manualTopicTitle, setManualTopicTitle] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayRevisions = revisions.filter(r => !r.completed && r.scheduledDate <= todayStr);
  const upcomingRevisions = revisions.filter(r => !r.completed && r.scheduledDate > todayStr);
  const completedRevisions = revisions.filter(r => r.completed);

  const displayedList = filterTab === 'today'
    ? todayRevisions
    : filterTab === 'upcoming'
    ? upcomingRevisions
    : completedRevisions;

  const handleRequestNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      NotificationService.sendNotification('Notificações Ativadas!', {
        body: 'Você será lembrado quando suas revisões programadas vencerem.'
      });
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTopicTitle.trim()) return;

    createSpacedRevisions(
      manualSubjectId,
      `top-manual-${Date.now()}`,
      manualTopicTitle.trim(),
      new Date(manualDate)
    );

    setIsManualModalOpen(false);
    setManualTopicTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <RotateCcw className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Revisões Programadas & Repetição Espaçada
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Método comprovado (24h, 7d, 30d) para blindar a memória de longo prazo e evitar a curva do esquecimento
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRequestNotifications}
              className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Ativar alertas no navegador"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Notificações</span>
            </button>

            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Google Calendar</span>
            </button>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Revisão</span>
            </button>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div
            onClick={() => setFilterTab('today')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterTab === 'today'
                ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 ring-1 ring-amber-400/30'
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800'
            }`}
          >
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block">
              Para Hoje / Pendentes
            </span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
              {todayRevisions.length}
            </span>
          </div>

          <div
            onClick={() => setFilterTab('upcoming')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterTab === 'upcoming'
                ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 ring-1 ring-blue-400/30'
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800'
            }`}
          >
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block">
              Próximos Dias
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
              {upcomingRevisions.length}
            </span>
          </div>

          <div
            onClick={() => setFilterTab('completed')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              filterTab === 'completed'
                ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-400/30'
                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800'
            }`}
          >
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium block">
              Realizadas
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {completedRevisions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Revisions List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {filterTab === 'today'
                ? 'Todas as revisões de hoje em dia!'
                : filterTab === 'upcoming'
                ? 'Nenhuma revisão agendada para os próximos dias.'
                : 'Nenhuma revisão realizada ainda.'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {filterTab === 'today'
                ? 'Excelente disciplina! Quando você conclui tópicos no edital, revisões são geradas automaticamente.'
                : 'Complete tópicos para que o ciclo 24h / 7d / 30d seja acionado.'}
            </p>
          </div>
        ) : (
          displayedList.map(rev => {
            const isOverdue = !rev.completed && rev.scheduledDate < todayStr;
            const isDueToday = !rev.completed && rev.scheduledDate === todayStr;

            return (
              <div
                key={rev.id}
                className={`p-4 bg-white dark:bg-zinc-900 border rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                  isOverdue
                    ? 'border-red-200/80 dark:border-red-950/80'
                    : 'border-zinc-200/80 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleRevisionComplete(rev.id)}
                    className="mt-0.5 text-zinc-300 hover:text-emerald-500 dark:text-zinc-600 dark:hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                    title={rev.completed ? 'Desmarcar' : 'Concluir revisão'}
                  >
                    {rev.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {rev.subjectName}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md uppercase">
                        Ciclo {rev.intervalType}
                      </span>

                      {isOverdue && (
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                          Atrasada ({rev.scheduledDate})
                        </span>
                      )}
                      {isDueToday && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                          Hoje
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mt-1 truncate ${
                      rev.completed ? 'text-zinc-400 line-through' : 'text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {rev.topicTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 w-full sm:w-auto justify-end">
                  {!rev.completed && (
                    <button
                      onClick={() => startTimer('pomodoro', rev.subjectId, rev.topicId, 25)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Revisar Agora</span>
                    </button>
                  )}

                  <button
                    onClick={() => deleteRevision(rev.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Excluir Revisão"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Revision Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Agendar Revisões Espaçadas
            </h3>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Disciplina
                </label>
                <select
                  value={manualSubjectId}
                  onChange={(e) => setManualSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Título do Assunto / Resumo a Revisar
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mandado de Segurança e Prazos Decadenciais"
                  value={manualTopicTitle}
                  onChange={(e) => setManualTopicTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Data Base do Estudo
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  O sistema gerará automaticamente as revisões de 24 horas, 7 dias e 30 dias a partir desta data.
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-xl"
                >
                  Criar Ciclo de Revisões
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Calendar Sync Modal */}
      <GoogleCalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );
};
