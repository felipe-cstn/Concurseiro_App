import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Paperclip,
  Play,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  BookOpen,
  Filter
} from 'lucide-react';
import { Subject, Topic, StudyTopicStatus } from '../../types/study';
import { useStudy } from '../../context/StudyContext';
import { SubjectModal } from './SubjectModal';
import { TopicModal } from './TopicModal';
import { AttachmentModal } from './AttachmentModal';
import { ConfirmationModal } from '../Common/ConfirmationModal';

export const SubjectList: React.FC = () => {
  const {
    subjects,
    deleteSubject,
    toggleTopicCompleted,
    deleteTopic,
    startTimer
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | StudyTopicStatus>('all');
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<{ [id: string]: boolean }>(() => {
    // Expand first two subjects by default
    const map: { [id: string]: boolean } = {};
    subjects.slice(0, 2).forEach(s => { map[s.id] = true; });
    return map;
  });

  // Modal States
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [activeSubjectForTopic, setActiveSubjectForTopic] = useState<Subject | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [attachmentModalState, setAttachmentModalState] = useState<{
    isOpen: boolean;
    subject?: Subject;
    topic?: Topic;
  }>({ isOpen: false });

  // Confirmation Delete State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'subject' | 'topic';
    subjectId: string;
    topicId?: string;
    name: string;
  }>({ isOpen: false, type: 'subject', subjectId: '', name: '' });

  const toggleSubjectExpanded = (id: string) => {
    setExpandedSubjectIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Overall Statistics
  const overallStats = useMemo(() => {
    let totalTopics = 0;
    let completedTopics = 0;
    let totalMinutes = 0;

    subjects.forEach(s => {
      s.topics.forEach(t => {
        totalTopics++;
        if (t.status === 'completed') completedTopics++;
        totalMinutes += t.totalMinutesStudied;
      });
    });

    const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return {
      totalTopics,
      completedTopics,
      remainingTopics: totalTopics - completedTopics,
      percent,
      totalHours: Math.round(totalMinutes / 60)
    };
  }, [subjects]);

  // Filtered Subjects and Topics
  const filteredSubjects = useMemo(() => {
    return subjects.map(s => {
      const filteredTopics = s.topics.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
      return {
        ...s,
        filteredTopics
      };
    }).filter(s => searchQuery ? s.filteredTopics.length > 0 : true);
  }, [subjects, searchQuery, statusFilter]);

  const confirmDeleteAction = () => {
    if (deleteConfirmation.type === 'subject') {
      deleteSubject(deleteConfirmation.subjectId);
    } else if (deleteConfirmation.type === 'topic' && deleteConfirmation.topicId) {
      deleteTopic(deleteConfirmation.subjectId, deleteConfirmation.topicId);
    }
    setDeleteConfirmation({ isOpen: false, type: 'subject', subjectId: '', name: '' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card: Edital Progress */}
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Edital Verticalizado & Matérias
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Controle granular de tópicos estudados, percentual de conclusão e materiais anexados
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingSubject(null);
                setIsSubjectModalOpen(true);
              }}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-xl text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nova Matéria
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Progresso Geral do Edital
              </span>
              <span className="text-zinc-400">
                ({overallStats.completedTopics} de {overallStats.totalTopics} assuntos concluídos)
              </span>
            </div>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {overallStats.percent}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${overallStats.percent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-2 text-center text-xs">
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <span className="text-[11px] text-zinc-400 block">Concluídos</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                {overallStats.completedTopics}
              </span>
            </div>
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <span className="text-[11px] text-zinc-400 block">Restantes</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                {overallStats.remainingTopics}
              </span>
            </div>
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
              <span className="text-[11px] text-zinc-400 block">Horas Acumuladas</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                {overallStats.totalHours}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar assunto ou disciplina..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1 mr-1" />
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Concluídos
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Em Estudo
          </button>
          <button
            onClick={() => setStatusFilter('not_started')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'not_started'
                ? 'bg-zinc-600 text-white'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            Não Iniciados
          </button>
        </div>
      </div>

      {/* Subjects Accordion / Cards List */}
      <div className="space-y-4">
        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <BookOpen className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhuma matéria ou assunto encontrado
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {searchQuery ? 'Tente buscar com outros termos.' : 'Clique em "Nova Matéria" para começar seu edital.'}
            </p>
          </div>
        ) : (
          filteredSubjects.map(subject => {
            const isExpanded = !!expandedSubjectIds[subject.id];
            const subjectTotalTopics = subject.topics.length;
            const subjectCompletedTopics = subject.topics.filter(t => t.status === 'completed').length;
            const subjectProgress = subjectTotalTopics > 0
              ? Math.round((subjectCompletedTopics / subjectTotalTopics) * 100)
              : 0;
            const subjectTotalMinutes = subject.topics.reduce((acc, t) => acc + t.totalMinutesStudied, 0);

            return (
              <div
                key={subject.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden transition-all"
              >
                {/* Subject Header */}
                <div className="p-5 flex items-center justify-between gap-4 select-none">
                  <div
                    onClick={() => toggleSubjectExpanded(subject.id)}
                    className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                  >
                    <button
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white dark:ring-zinc-900 shadow-2xs"
                      style={{ backgroundColor: subject.color }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {subject.name}
                        </h3>
                        <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                          Peso {subject.weight}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {Math.round(subjectTotalMinutes / 60)}h líquidas
                        </span>
                      </div>

                      {/* Mini inline progress bar */}
                      <div className="flex items-center gap-3 mt-1.5 max-w-xs">
                        <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              backgroundColor: subject.color,
                              width: `${subjectProgress}%`
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {subjectProgress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setActiveSubjectForTopic(subject);
                        setEditingTopic(null);
                        setIsTopicModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      title="Adicionar Assunto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Assunto</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingSubject(subject);
                        setIsSubjectModalOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                      title="Editar Matéria"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmation({
                        isOpen: true,
                        type: 'subject',
                        subjectId: subject.id,
                        name: subject.name
                      })}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                      title="Excluir Matéria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Topics List */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 sm:p-5 space-y-2">
                    {subject.filteredTopics.length === 0 ? (
                      <p className="text-xs text-zinc-400 py-3 text-center italic">
                        Nenhum tópico cadastrado nesta matéria. Clique em "+ Assunto" acima.
                      </p>
                    ) : (
                      subject.filteredTopics.map(topic => {
                        const isCompleted = topic.status === 'completed';
                        const hasAttachments = topic.attachments && topic.attachments.length > 0;

                        return (
                          <div
                            key={topic.id}
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isCompleted
                                ? 'bg-white/80 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-zinc-800'
                                : 'bg-white dark:bg-zinc-800/70 border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {/* Completion checkbox */}
                              <button
                                onClick={() => toggleTopicCompleted(subject.id, topic.id)}
                                className="mt-0.5 text-zinc-300 hover:text-emerald-500 dark:text-zinc-600 dark:hover:text-emerald-400 transition-colors shrink-0 cursor-pointer"
                                title={isCompleted ? 'Marcar como não concluído' : 'Marcar como concluído'}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-xs font-semibold ${
                                      isCompleted
                                        ? 'text-zinc-400 line-through'
                                        : 'text-zinc-900 dark:text-zinc-100'
                                    }`}
                                  >
                                    {topic.title}
                                  </span>

                                  {topic.totalMinutesStudied > 0 && (
                                    <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                                      <Clock className="w-3 h-3" />
                                      {Math.round(topic.totalMinutesStudied)}m
                                    </span>
                                  )}

                                  {topic.questionsTotal > 0 && (
                                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-md">
                                      {topic.questionsCorrect}/{topic.questionsTotal} questões ({Math.round((topic.questionsCorrect / topic.questionsTotal) * 100)}%)
                                    </span>
                                  )}
                                </div>

                                {topic.notes && (
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 italic">
                                    {topic.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions toolbar */}
                            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 w-full sm:w-auto justify-end">
                              {/* Attachments Button */}
                              <button
                                onClick={() => setAttachmentModalState({
                                  isOpen: true,
                                  subject,
                                  topic
                                })}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                                  hasAttachments
                                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40'
                                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700/60'
                                }`}
                                title="Anexos e Materiais"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>{topic.attachments?.length || 0}</span>
                              </button>

                              {/* Start Focus Timer on this topic */}
                              <button
                                onClick={() => startTimer('pomodoro', subject.id, topic.id)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-xl text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                                title="Iniciar foco neste assunto"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Estudar</span>
                              </button>

                              {/* Edit Topic */}
                              <button
                                onClick={() => {
                                  setActiveSubjectForTopic(subject);
                                  setEditingTopic(topic);
                                  setIsTopicModalOpen(true);
                                }}
                                className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                                title="Editar Assunto"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Topic */}
                              <button
                                onClick={() => setDeleteConfirmation({
                                  isOpen: true,
                                  type: 'topic',
                                  subjectId: subject.id,
                                  topicId: topic.id,
                                  name: topic.title
                                })}
                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Assunto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Subject Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        subjectToEdit={editingSubject}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
      />

      {/* Topic Modal */}
      {activeSubjectForTopic && (
        <TopicModal
          isOpen={isTopicModalOpen}
          subject={activeSubjectForTopic}
          topicToEdit={editingTopic}
          onClose={() => {
            setIsTopicModalOpen(false);
            setEditingTopic(null);
            setActiveSubjectForTopic(null);
          }}
        />
      )}

      {/* Attachment Modal */}
      {attachmentModalState.isOpen && attachmentModalState.subject && attachmentModalState.topic && (
        <AttachmentModal
          isOpen={attachmentModalState.isOpen}
          subject={attachmentModalState.subject}
          topic={attachmentModalState.topic}
          onClose={() => setAttachmentModalState({ isOpen: false })}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title={deleteConfirmation.type === 'subject' ? 'Excluir Disciplina?' : 'Excluir Assunto?'}
        description={`Tem certeza que deseja remover "${deleteConfirmation.name}"? Todo o histórico de tópicos e revisões associadas será excluído.`}
        isDestructive={true}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteAction}
        onCancel={() => setDeleteConfirmation({ isOpen: false, type: 'subject', subjectId: '', name: '' })}
      />
    </div>
  );
};
