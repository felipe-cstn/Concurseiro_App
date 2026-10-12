import React, { useState } from 'react';
import { Download, Upload, RefreshCw, X, Check, AlertCircle, Copy } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportData, importData, resetData } = useStudy();
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const dataStr = exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `foco-concurso-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Backup exportado com sucesso!' });
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Falha ao exportar dados.' });
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const dataStr = exportData();
      await navigator.clipboard.writeText(dataStr);
      setStatusMessage({ type: 'success', text: 'JSON copiado para a área de transferência!' });
    } catch (e) {
      setStatusMessage({ type: 'error', text: 'Não foi possível copiar.' });
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importData(content);
        if (ok) {
          setStatusMessage({ type: 'success', text: 'Dados restaurados com sucesso!' });
          setTimeout(() => onClose(), 1200);
        } else {
          setStatusMessage({ type: 'error', text: 'Arquivo de backup inválido.' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleImportText = () => {
    if (!importText.trim()) return;
    const ok = importData(importText.trim());
    if (ok) {
      setStatusMessage({ type: 'success', text: 'Dados importados com sucesso!' });
      setImportText('');
      setTimeout(() => onClose(), 1200);
    } else {
      setStatusMessage({ type: 'error', text: 'Formato JSON inválido.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Sincronização & Backup Local
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Transfira seus estudos entre celular, tablet e computador sem perder nada
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {statusMessage.text}
          </div>
        )}

        {/* Export Section */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Exportar Dados
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-500" />
              Baixar Arquivo JSON
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center justify-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <Copy className="w-4 h-4 text-emerald-500" />
              Copiar Texto JSON
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="mt-6 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Importar / Restaurar
          </h4>
          <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30 transition-colors">
            <Upload className="w-6 h-6 text-zinc-400 mb-1" />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Carregar arquivo .json do seu dispositivo
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <div className="space-y-2">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Ou cole o código JSON aqui para importar..."
              rows={3}
              className="w-full p-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            {importText.trim() && (
              <button
                onClick={handleImportText}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-xl text-xs font-medium transition-colors"
              >
                Confirmar Importação de Texto
              </button>
            )}
          </div>
        </div>

        {/* Reset Section */}
        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Deseja restaurar as matérias de exemplo padrão?
          </div>
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetData();
                  setShowResetConfirm(false);
                  setStatusMessage({ type: 'success', text: 'Dados padrão restaurados!' });
                }}
                className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmar Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-700"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar Exemplo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
