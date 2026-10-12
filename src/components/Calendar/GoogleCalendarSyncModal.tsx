import React, { useState } from 'react';
import { Calendar, Check, ExternalLink, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { GoogleCalendarService } from '../../services/googleCalendar';
import { ConfirmationModal } from '../Common/ConfirmationModal';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, googleToken, loginWithGoogle, revisions } = useStudy();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string; count?: number } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEventTime, setSelectedEventTime] = useState('09:00');

  if (!isOpen) return null;

  const pendingRevisions = revisions.filter(r => !r.completed);

  const handleStartSyncFlow = () => {
    if (!currentUser || !googleToken) {
      setSyncStatus({ type: 'error', message: 'Faça login com sua conta Google antes de sincronizar.' });
      return;
    }
    if (pendingRevisions.length === 0) {
      setSyncStatus({ type: 'error', message: 'Nenhuma revisão pendente para sincronizar no momento.' });
      return;
    }
    setShowConfirmModal(true);
  };

  const executeSync = async () => {
    setShowConfirmModal(false);
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      let createdCount = 0;
      // Take up to 5 pending revisions to sync
      const toSync = pendingRevisions.slice(0, 5);

      for (const rev of toSync) {
        const [hours, minutes] = selectedEventTime.split(':').map(Number);
        const startDate = new Date(rev.scheduledDate);
        startDate.setHours(hours || 9, minutes || 0, 0, 0);

        const endDate = new Date(startDate.getTime() + 45 * 60000); // 45 min revision session

        await GoogleCalendarService.createStudyEvent({
          summary: `[FocoConcurso] Revisão: ${rev.subjectName} - ${rev.topicTitle}`,
          description: `Sessão de Repetição Espaçada agendada pelo FocoConcurso.\nMatéria: ${rev.subjectName}\nAssunto: ${rev.topicTitle}\nTipo: Revisão ${rev.intervalType}`,
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString()
        });

        createdCount++;
      }

      setSyncStatus({
        type: 'success',
        message: `${createdCount} revisões foram sincronizadas diretamente com o seu Google Calendar!`,
        count: createdCount
      });
    } catch (e: unknown) {
      console.error(e);
      setSyncStatus({
        type: 'error',
        message: e instanceof Error ? e.message : 'Falha ao sincronizar com o Google Calendar.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Google Calendar Sync
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Integre suas revisões programadas com sua agenda oficial
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account status card */}
          <div className="mt-6 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Google User'}
                      className="w-9 h-9 rounded-full ring-2 ring-blue-500/30"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.email?.[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {currentUser.displayName || 'Conectado'}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Conectado
                </span>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                  Faça login para permitir que o app agende suas revisões no seu Google Calendar.
                </p>
                <button
                  onClick={() => loginWithGoogle()}
                  className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-xl hover:bg-zinc-50 transition-colors shadow-2xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Conectar com o Google
                </button>
              </div>
            )}
          </div>

          {/* Sync Options */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Horário Padrão das Sessões de Revisão
              </label>
              <input
                type="time"
                value={selectedEventTime}
                onChange={(e) => setSelectedEventTime(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Revisions Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Revisões a Sincronizar ({pendingRevisions.length})
                </span>
                <span className="text-[11px] text-zinc-400">Próximos 5 eventos</span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {pendingRevisions.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-3 text-center italic">
                    Nenhuma revisão pendente para os próximos dias.
                  </p>
                ) : (
                  pendingRevisions.slice(0, 5).map(rev => (
                    <div
                      key={rev.id}
                      className="p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                          {rev.subjectName}
                        </span>
                        <span className="text-[11px] text-zinc-500 truncate block">
                          {rev.topicTitle}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                          {rev.scheduledDate}
                        </span>
                        <span className="text-[10px] text-zinc-400 block uppercase">
                          {rev.intervalType}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          {syncStatus && (
            <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              syncStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
            }`}>
              {syncStatus.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{syncStatus.message}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              Abrir Google Calendar <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleStartSyncFlow}
                disabled={isSyncing || !currentUser || pendingRevisions.length === 0}
                className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" />
                    Sincronizar com a Agenda
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory explicit user confirmation dialog */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Sincronizar com o Google Calendar?"
        description={`Deseja agendar ${Math.min(5, pendingRevisions.length)} revisões pendentes no seu Google Calendar para as ${selectedEventTime}? Os eventos incluirão notificações de lembrete 30min antes.`}
        confirmLabel="Sim, Sincronizar"
        cancelLabel="Cancelar"
        onConfirm={executeSync}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
};
