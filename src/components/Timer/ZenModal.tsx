import React from 'react';
import { Play, Pause, Square, Check, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface ZenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCompleteModal: () => void;
}

export const ZenModal: React.FC<ZenModalProps> = ({
  isOpen,
  onClose,
  onOpenCompleteModal
}) => {
  const {
    activeTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    subjects,
    settings,
    updateSettings
  } = useStudy();

  if (!isOpen) return null;

  const currentSubject = subjects.find(s => s.id === activeTimer.subjectId);
  const currentTopic = currentSubject?.topics.find(t => t.id === activeTimer.topicId);

  // Format time
  const totalSeconds = activeTimer.mode === 'stopwatch'
    ? activeTimer.secondsElapsed
    : activeTimer.secondsRemaining;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = activeTimer.mode === 'stopwatch'
    ? 100
    : activeTimer.initialDuration > 0
    ? Math.min(100, Math.max(0, ((activeTimer.initialDuration - activeTimer.secondsRemaining) / activeTimer.initialDuration) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 bg-zinc-950 text-white select-none animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentSubject && (
            <span
              className="w-3 h-3 rounded-full ring-2 ring-zinc-800"
              style={{ backgroundColor: currentSubject.color }}
            />
          )}
          <div className="text-left">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block">
              {currentSubject ? currentSubject.name : 'Estudo Geral'}
            </span>
            <span className="text-sm text-zinc-200 font-medium truncate max-w-md block">
              {currentTopic ? currentTopic.title : 'Foco Livre'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="p-2 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'Silenciar' : 'Ativar Sons'}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Sair do Modo Zen"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Minimalist Clock */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          {/* Subtle background glow */}
          <div
            className="absolute inset-0 blur-3xl opacity-20 transition-all rounded-full"
            style={{ backgroundColor: currentSubject ? currentSubject.color : '#3B82F6' }}
          />

          {/* Large timer display */}
          <div className="relative text-center">
            <div className="font-mono text-7xl sm:text-9xl font-light tracking-tighter text-zinc-100">
              {timeFormatted}
            </div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-medium mt-3">
              {activeTimer.mode === 'pomodoro' ? 'Ciclo de Foco' : activeTimer.mode === 'stopwatch' ? 'Tempo Líquido' : 'Pausa Restaurativa'}
            </div>
          </div>
        </div>

        {/* Minimal Progress Line */}
        <div className="w-64 sm:w-96 h-1 bg-zinc-800 rounded-full mt-10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: currentSubject ? currentSubject.color : '#3B82F6'
            }}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex items-center justify-center gap-6">
        <button
          onClick={stopTimer}
          className="p-3 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-2xl transition-colors cursor-pointer"
          title="Reiniciar"
        >
          <Square className="w-5 h-5" />
        </button>

        {activeTimer.isRunning ? (
          <button
            onClick={pauseTimer}
            className="p-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-3xl transition-transform active:scale-95 shadow-lg border border-zinc-800 cursor-pointer"
            title="Pausar"
          >
            <Pause className="w-8 h-8 fill-current" />
          </button>
        ) : (
          <button
            onClick={resumeTimer}
            className="p-6 bg-white hover:bg-zinc-100 text-zinc-950 rounded-3xl transition-transform active:scale-95 shadow-lg cursor-pointer"
            title="Continuar"
          >
            <Play className="w-8 h-8 fill-current" />
          </button>
        )}

        <button
          onClick={() => {
            onClose();
            onOpenCompleteModal();
          }}
          className="p-3 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 rounded-2xl transition-colors cursor-pointer"
          title="Finalizar e Salvar Sessão"
        >
          <Check className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
