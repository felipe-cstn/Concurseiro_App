import React, { useState, useId } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  Volume2,
  VolumeX,
  Star,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useStudy, TimerMode } from '../../context/StudyContext';
import { ZenModal } from './ZenModal';

export const FocusTimer: React.FC = () => {
  const gradientId = useId();
  const {
    activeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    completeTimerSession,
    subjects,
    sessions,
    settings,
    updateSettings
  } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeTimer.subjectId || (subjects[0]?.id || '')
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    activeTimer.topicId || (subjects[0]?.topics[0]?.id || '')
  );

  const [isZenOpen, setIsZenOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Completion session form state
  const [questionsAttempted, setQuestionsAttempted] = useState<number>(0);
  const [questionsCorrect, setQuestionsCorrect] = useState<number>(0);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const currentSubject = subjects.find(s => s.id === (activeTimer.subjectId || selectedSubjectId));
  const availableTopics = currentSubject?.topics || [];
  const currentTopic = availableTopics.find(t => t.id === (activeTimer.topicId || selectedTopicId));

  // Time calculations
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

  // SVG circular properties
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = activeTimer.mode === 'stopwatch'
    ? 0
    : circumference - (progress / 100) * circumference;

  const handleStart = (mode: TimerMode, durationMinutes?: number) => {
    startTimer(mode, selectedSubjectId, selectedTopicId, durationMinutes);
  };

  const handleFinishSession = () => {
    completeTimerSession(
      questionsAttempted,
      questionsCorrect,
      qualityRating,
      sessionNotes
    );
    setIsCompleteModalOpen(false);
    setQuestionsAttempted(0);
    setQuestionsCorrect(0);
    setQualityRating(5);
    setSessionNotes('');
  };

  // Today's total liquid study minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutes = sessions
    .filter(s => s.startTime.startsWith(todayStr))
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Timer Main Card */}
      <div className="p-6 sm:p-10 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs relative overflow-hidden">
        {/* Subtle background glow based on subject color */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: currentSubject ? currentSubject.color : '#3B82F6' }}
        />

        {/* Top Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Cronômetro de Alta Performance
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Sessão de Foco Líquido
            </h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                settings.soundEnabled
                  ? 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600'
              }`}
              title={settings.soundEnabled ? 'Sons Ativados' : 'Sons Desativados'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsZenOpen(true)}
              className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Modo Zen</span>
            </button>
          </div>
        </div>

        {/* Subject & Topic Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
              Disciplina Selecionada
            </label>
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  const s = subjects.find(item => item.id === e.target.value);
                  if (s && s.topics.length > 0) {
                    setSelectedTopicId(s.topics[0].id);
                  } else {
                    setSelectedTopicId('');
                  }
                }}
                disabled={activeTimer.isRunning}
                className="w-full pl-3.5 pr-8 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden disabled:opacity-60"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Peso {s.weight})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5">
              Assunto / Tópico
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={activeTimer.isRunning || availableTopics.length === 0}
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden disabled:opacity-60"
            >
              {availableTopics.length === 0 ? (
                <option value="">Nenhum tópico cadastrado</option>
              ) : (
                availableTopics.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} {t.status === 'completed' ? '✓' : ''}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Circular Timer Display */}
        <div className="flex flex-col items-center justify-center my-8">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 300 300">
              {/* Background Ring */}
              <circle
                cx="150"
                cy="150"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800/70"
                strokeWidth="10"
                fill="none"
              />

              {/* Progress Ring */}
              <circle
                cx="150"
                cy="150"
                r={radius}
                stroke={currentSubject ? currentSubject.color : `url(#${gradientId})`}
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 0.8s ease'
                }}
              />

              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center p-4">
              <span className="font-mono text-5xl sm:text-6xl font-light tracking-tighter text-zinc-900 dark:text-zinc-100">
                {timeFormatted}
              </span>

              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentSubject ? currentSubject.color : '#3B82F6' }}
                />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider truncate max-w-[170px]">
                  {currentSubject ? currentSubject.name : 'Geral'}
                </span>
              </div>

              {currentTopic && (
                <span className="text-[11px] text-zinc-400 mt-0.5 max-w-[190px] truncate">
                  {currentTopic.title}
                </span>
              )}
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <button
              onClick={() => handleStart('pomodoro', 25)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTimer.mode === 'pomodoro' && activeTimer.initialDuration === 1500
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              25m Foco
            </button>
            <button
              onClick={() => handleStart('pomodoro', 50)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTimer.mode === 'pomodoro' && activeTimer.initialDuration === 3000
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              50m Foco
            </button>
            <button
              onClick={() => handleStart('stopwatch')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTimer.mode === 'stopwatch'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Cronômetro Livre
            </button>
            <button
              onClick={() => handleStart('break', 5)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTimer.mode === 'break'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Pausa (5m)
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={stopTimer}
            disabled={!activeTimer.isRunning && activeTimer.secondsElapsed === 0}
            className="p-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors cursor-pointer disabled:opacity-30"
            title="Reiniciar Cronômetro"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {activeTimer.isRunning ? (
            <button
              onClick={pauseTimer}
              className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-2xl text-sm font-semibold transition-transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pausar
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-2xl text-sm font-semibold transition-transform active:scale-95 shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              {activeTimer.secondsElapsed > 0 ? 'Retomar' : 'Iniciar'}
            </button>
          )}

          <button
            onClick={() => setIsCompleteModalOpen(true)}
            disabled={activeTimer.secondsElapsed < 30 && activeTimer.mode !== 'pomodoro'}
            className="px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            title="Concluir e Salvar Sessão"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar Sessão</span>
          </button>
        </div>

        {/* Daily Summary Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-400" />
            <span>Total Estudado Hoje:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold font-mono">
              {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
            </strong>
          </div>

          <div className="flex items-center gap-1 text-amber-500 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{Math.max(10, Math.round(activeTimer.secondsElapsed / 60) * 2)} XP ao salvar</span>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Registro da Sessão de Estudo
                </h3>
                <p className="text-xs text-zinc-500">
                  Tempo líquido: ~{Math.max(1, Math.round(activeTimer.secondsElapsed / 60))} minutos
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Matéria & Assunto
                </span>
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>{currentSubject?.name || 'Geral'}</span>
                  {currentTopic && <span className="text-zinc-400">• {currentTopic.title}</span>}
                </div>
              </div>

              {/* Questions Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Questões Feitas
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={questionsAttempted}
                    onChange={(e) => setQuestionsAttempted(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Acertos
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={questionsAttempted}
                    value={questionsCorrect}
                    onChange={(e) => setQuestionsCorrect(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Quality Rating */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Qualidade do Foco (1 a 5 estrelas)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setQualityRating(star)}
                      className="p-1 text-zinc-300 hover:text-amber-400 dark:text-zinc-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= qualityRating ? 'text-amber-400 fill-amber-400' : ''
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Notas da Sessão / Dúvidas
                </label>
                <textarea
                  rows={2}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="ex: revisar prazos de recurso na lei..."
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                Continuar Estudando
              </button>
              <button
                type="button"
                onClick={handleFinishSession}
                className="px-5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
              >
                Salvar & Registrar XP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zen Fullscreen Modal */}
      <ZenModal
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
        onOpenCompleteModal={() => setIsCompleteModalOpen(true)}
      />
    </div>
  );
};
