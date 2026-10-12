import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Subject } from '../../types/study';
import { useStudy } from '../../context/StudyContext';

interface SubjectModalProps {
  isOpen: boolean;
  subjectToEdit?: Subject | null;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  subjectToEdit,
  onClose
}) => {
  const { addSubject, updateSubject } = useStudy();

  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [weight, setWeight] = useState(2);
  const [weeklyHours, setWeeklyHours] = useState(4);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setColor(subjectToEdit.color);
      setWeight(subjectToEdit.weight || 2);
      setWeeklyHours(Math.round((subjectToEdit.weeklyTargetMinutes || 240) / 60));
    } else {
      setName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setWeight(2);
      setWeeklyHours(4);
    }
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name: name.trim(),
        color,
        weight,
        weeklyTargetMinutes: weeklyHours * 60
      });
    } else {
      addSubject({
        name: name.trim(),
        color,
        weight,
        weeklyTargetMinutes: weeklyHours * 60
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {subjectToEdit ? 'Editar Matéria' : 'Nova Matéria do Edital'}
          </h3>
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
              Nome da Disciplina
            </label>
            <input
              type="text"
              required
              placeholder="ex: Direito Tributário, Raciocínio Lógico, Contabilidade"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Cor de Destaque
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Peso no Concurso
              </label>
              <select
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              >
                <option value={1}>Peso 1 (Básico)</option>
                <option value={2}>Peso 2 (Intermediário)</option>
                <option value={3}>Peso 3 (Alta Relevância)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Meta Semanal (Horas)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
              />
            </div>
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
              {subjectToEdit ? 'Salvar Alterações' : 'Criar Matéria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
