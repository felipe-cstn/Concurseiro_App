import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Topic, Subject } from '../../types/study';
import { useStudy } from '../../context/StudyContext';

interface TopicModalProps {
  isOpen: boolean;
  subject: Subject;
  topicToEdit?: Topic | null;
  onClose: () => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  subject,
  topicToEdit,
  onClose
}) => {
  const { addTopic, updateTopic } = useStudy();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (topicToEdit) {
      setTitle(topicToEdit.title);
      setNotes(topicToEdit.notes || '');
    } else {
      setTitle('');
      setNotes('');
    }
  }, [topicToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (topicToEdit) {
      updateTopic(subject.id, topicToEdit.id, {
        title: title.trim(),
        notes: notes.trim() || undefined
      });
    } else {
      addTopic(subject.id, title.trim(), notes.trim() || undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
            >
              {subject.name}
            </span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {topicToEdit ? 'Editar Assunto' : 'Novo Assunto do Edital'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Título do Assunto / Tópico
            </label>
            <input
              type="text"
              required
              placeholder="ex: Inviolabilidade de Domicílio e Sigilos (Art. 5º)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Observações / Artigos Relevantes (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="ex: Atenção à jurisprudência do Tema 280 STF..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {topicToEdit ? 'Salvar Assunto' : 'Adicionar Assunto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
