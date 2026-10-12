import React from 'react';
import { Trophy, Flame, Zap, Award, Target, Clock, CheckCircle2, RotateCcw, X, ShieldCheck } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { CONCURSEIRO_RANKS } from '../../services/seedData';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({ isOpen, onClose }) => {
  const { userStats, badges, triggerConfetti } = useStudy();

  if (!isOpen) return null;

  const currentRank = CONCURSEIRO_RANKS.find(r => r.level === userStats.level) || CONCURSEIRO_RANKS[0];
  const nextRank = CONCURSEIRO_RANKS.find(r => r.level === userStats.level + 1);

  const xpCurrentLevel = userStats.xp - currentRank.minXp;
  const xpNeededLevel = nextRank ? nextRank.minXp - currentRank.minXp : 1000;
  const levelProgress = nextRank ? Math.min(100, Math.max(0, Math.round((xpCurrentLevel / xpNeededLevel) * 100))) : 100;

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return <Target className="w-5 h-5 text-blue-500" />;
      case 'flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'zap': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'clock': return <Clock className="w-5 h-5 text-indigo-500" />;
      case 'award': return <Award className="w-5 h-5 text-purple-500" />;
      case 'rotate-ccw': return <RotateCcw className="w-5 h-5 text-emerald-500" />;
      case 'check-circle': return <CheckCircle2 className="w-5 h-5 text-teal-500" />;
      default: return <Trophy className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Progresso & Conquistas
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Sua jornada de disciplina rumo à aprovação e posse
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

        {/* Level & Rank Card */}
        <div className="mt-6 p-5 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Nível {userStats.level}
              </div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {currentRank.title}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {userStats.xp.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">XP Total</span>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
              <span>{xpCurrentLevel} XP no nível</span>
              <span>{nextRank ? `Faltam ${xpNeededLevel - xpCurrentLevel} XP para ${nextRank.title}` : 'Patente Máxima Alcançada!'}</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{userStats.streakDays}</span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Dias de Streak</span>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {Math.round(userStats.totalMinutesStudied / 60)}h
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Horas Líquidas</span>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{userStats.streakFreezeRemaining}</span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Escudo de Streak</span>
          </div>
        </div>

        {/* Badges Collection */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Medalhas & Distintivos
            </h4>
            <span className="text-xs text-zinc-500">
              {badges.filter(b => b.unlockedAt).length} de {badges.length} desbloqueadas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {badges.map(badge => {
              const isUnlocked = !!badge.unlockedAt;
              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isUnlocked
                      ? 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 shadow-xs'
                      : 'bg-zinc-50/40 dark:bg-zinc-900/40 border-zinc-200/40 dark:border-zinc-800/50 opacity-60'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isUnlocked
                      ? 'bg-white dark:bg-zinc-800 shadow-xs'
                      : 'bg-zinc-200/60 dark:bg-zinc-800/40 grayscale'
                  }`}>
                    {getBadgeIcon(badge.icon)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {badge.title}
                      </h5>
                      {isUnlocked ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                          Conquistado
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {badge.progress}%
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      {badge.description}
                    </p>
                    {!isUnlocked && (
                      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {
              triggerConfetti();
              onClose();
            }}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Fechar e Voltar ao Foco
          </button>
        </div>
      </div>
    </div>
  );
};
