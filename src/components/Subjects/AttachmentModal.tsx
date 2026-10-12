import React, { useState } from 'react';
import { FileText, Link2, Upload, Trash2, Download, ExternalLink, X, Plus, AlertCircle } from 'lucide-react';
import { Topic, Attachment, Subject } from '../../types/study';
import { useStudy } from '../../context/StudyContext';
import { StorageService } from '../../services/storage';

interface AttachmentModalProps {
  isOpen: boolean;
  subject: Subject;
  topic: Topic;
  onClose: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  subject,
  topic,
  onClose
}) => {
  const { addAttachmentToTopic, removeAttachmentFromTopic } = useStudy();
  const [activeTab, setActiveTab] = useState<'files' | 'link' | 'note'>('files');

  // Link state
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNotes, setLinkNotes] = useState('');

  // Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Error message
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('O arquivo não pode exceder 25 MB.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const dataUrl = evt.target?.result as string;
        const attachmentId = `att-${Date.now()}`;

        // Save data in IndexedDB for robust offline access
        await StorageService.saveAttachmentBlob(attachmentId, file.name, file.type, dataUrl);

        const newAttachment: Attachment = {
          id: attachmentId,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
          dataUrl: file.size < 500000 ? dataUrl : undefined // keep in-memory dataUrl only for small files
        };

        addAttachmentToTopic(subject.id, topic.id, newAttachment);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setErrorMsg('Falha ao processar arquivo.');
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    let validUrl = linkUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    const newAttachment: Attachment = {
      id: `att-link-${Date.now()}`,
      name: linkTitle.trim(),
      size: 0,
      type: 'link',
      url: validUrl,
      notes: linkNotes.trim() || undefined,
      uploadedAt: new Date().toISOString()
    };

    addAttachmentToTopic(subject.id, topic.id, newAttachment);
    setLinkTitle('');
    setLinkUrl('');
    setLinkNotes('');
    setErrorMsg('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newAttachment: Attachment = {
      id: `att-note-${Date.now()}`,
      name: noteTitle.trim(),
      size: noteContent.length,
      type: 'note',
      notes: noteContent.trim(),
      uploadedAt: new Date().toISOString()
    };

    addAttachmentToTopic(subject.id, topic.id, newAttachment);
    setNoteTitle('');
    setNoteContent('');
    setErrorMsg('');
  };

  const handleDownloadAttachment = async (att: Attachment) => {
    let downloadUrl = att.dataUrl;

    if (!downloadUrl) {
      const blobData = await StorageService.getAttachmentBlob(att.id);
      if (blobData) {
        downloadUrl = blobData.dataUrl;
      }
    }

    if (!downloadUrl) {
      alert('Arquivo não encontrado no armazenamento offline.');
      return;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {subject.name}
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              Material de Apoio & Anexos
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-md">
              {topic.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Existing Attachments List */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Arquivos & Anotações Salvas ({topic.attachments.length})
            </h4>
          </div>

          {topic.attachments.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20">
              <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Nenhum arquivo ou resumo anexado a este assunto ainda.
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Faça upload de PDFs, apostilas, mnemônicos ou links de questões abaixo.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {topic.attachments.map(att => (
                <div
                  key={att.id}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-700/60 shadow-2xs text-zinc-600 dark:text-zinc-300 shrink-0">
                      {att.type === 'link' ? (
                        <Link2 className="w-4 h-4 text-blue-500" />
                      ) : att.type === 'note' ? (
                        <FileText className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {att.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        {att.size > 0 && <span>{formatFileSize(att.size)}</span>}
                        <span>{new Date(att.uploadedAt).toLocaleDateString('pt-BR')}</span>
                        {att.notes && <span className="truncate max-w-[200px]">"{att.notes}"</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {att.type === 'link' && att.url && (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Abrir Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {att.type !== 'link' && att.type !== 'note' && (
                      <button
                        onClick={() => handleDownloadAttachment(att)}
                        className="p-1.5 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                        title="Baixar Arquivo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeAttachmentFromTopic(subject.id, topic.id, att.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs for Adding new attachments */}
        <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Anexar Arquivo
            </button>
            <button
              onClick={() => setActiveTab('link')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Link Web
            </button>
            <button
              onClick={() => setActiveTab('note')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                activeTab === 'note'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Resumo / Flashcard
            </button>
          </div>

          {activeTab === 'files' && (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-2xl cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30 transition-colors">
              <Upload className="w-8 h-8 text-zinc-400 mb-2" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Selecione um PDF, imagem ou resumo
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Salvo 100% offline no navegador (até 25 MB)
              </span>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
              />
            </label>
          )}

          {activeTab === 'link' && (
            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Nome do Link (ex: Lei Seca no Planalto, Caderno de Questões)"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="URL (ex: https://planalto.gov.br/...)"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Link
                </button>
              </div>
            </form>
          )}

          {activeTab === 'note' && (
            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Título do Resumo (ex: Mnemônico LIMPE e Exceções)"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <textarea
                  placeholder="Escreva pontos-chave, jurisprudência relevante, macetes de memorização..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Salvar Resumo
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
