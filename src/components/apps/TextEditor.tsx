import React, { useState, useEffect, useRef } from 'react';
import { Save, FolderOpen, File, X, Plus } from 'lucide-react';
import { db, fileOperations, FileItem } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppProps } from '@/types/os';
import { cn } from '@/lib/utils';

interface OpenFile {
  id: string;
  name: string;
  content: string;
  isModified: boolean;
  fileId?: number;
}

interface TextEditorProps extends AppProps {
  fileId?: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({ windowId, fileId: initialFileId }) => {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([{ id: 'untitled-1', name: 'Untitled', content: '', isModified: false }]);
  const [activeFileId, setActiveFileId] = useState('untitled-1');
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const files = useLiveQuery(() => fileOperations.getChildren(currentFolder), [currentFolder]);
  const activeFile = openFiles.find(f => f.id === activeFileId);

  // Load initial file if provided
  useEffect(() => {
    if (initialFileId) {
      fileOperations.getFile(initialFileId).then(file => {
        if (file) {
          const newTab: OpenFile = {
            id: `file-${file.id}`,
            name: file.name,
            content: file.content?.toString() || '',
            isModified: false,
            fileId: file.id,
          };
          setOpenFiles([newTab]);
          setActiveFileId(newTab.id);
        }
      });
    }
  }, [initialFileId]);

  const handleContentChange = (content: string) => {
    setOpenFiles(files => files.map(f => f.id === activeFileId ? { ...f, content, isModified: true } : f));
  };

  const handleSave = async () => {
    if (!activeFile) return;
    if (activeFile.fileId) {
      await fileOperations.updateFile(activeFile.fileId, { content: activeFile.content, size: activeFile.content.length });
      setOpenFiles(files => files.map(f => f.id === activeFileId ? { ...f, isModified: false } : f));
    } else {
      const name = prompt('Enter file name:', activeFile.name);
      if (name) {
        const id = await fileOperations.createFile(name, null, activeFile.content);
        setOpenFiles(files => files.map(f => f.id === activeFileId ? { ...f, name, fileId: id, isModified: false } : f));
      }
    }
  };

  const handleOpenFile = async (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentFolder(file.id!);
      return;
    }
    const existingTab = openFiles.find(f => f.fileId === file.id);
    if (existingTab) {
      setActiveFileId(existingTab.id);
    } else {
      const fullFile = await fileOperations.getFile(file.id!);
      const newTab: OpenFile = { id: `file-${Date.now()}`, name: file.name, content: fullFile?.content?.toString() || '', isModified: false, fileId: file.id };
      setOpenFiles([...openFiles, newTab]);
      setActiveFileId(newTab.id);
    }
    setShowOpenDialog(false);
  };

  const handleNewFile = () => {
    const newFile: OpenFile = { id: `untitled-${Date.now()}`, name: 'Untitled', content: '', isModified: false };
    setOpenFiles([...openFiles, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleCloseFile = (id: string) => {
    const file = openFiles.find(f => f.id === id);
    if (file?.isModified && !confirm('Discard unsaved changes?')) return;
    const newFiles = openFiles.filter(f => f.id !== id);
    if (newFiles.length === 0) handleNewFile();
    else if (activeFileId === id) setActiveFileId(newFiles[0].id);
    setOpenFiles(newFiles.length > 0 ? newFiles : openFiles);
  };

  const getLineNumbers = () => Array.from({ length: (activeFile?.content || '').split('\n').length }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      <div className="flex items-center gap-1 p-2 bg-zinc-800 border-b border-zinc-700">
        <button onClick={handleNewFile} className="p-1.5 rounded hover:bg-zinc-700"><Plus className="w-4 h-4 text-zinc-400" /></button>
        <button onClick={() => setShowOpenDialog(true)} className="p-1.5 rounded hover:bg-zinc-700"><FolderOpen className="w-4 h-4 text-zinc-400" /></button>
        <button onClick={handleSave} disabled={!activeFile?.isModified} className="p-1.5 rounded hover:bg-zinc-700 disabled:opacity-50"><Save className="w-4 h-4 text-zinc-400" /></button>
      </div>
      <div className="flex bg-zinc-800 border-b border-zinc-700 overflow-x-auto">
        {openFiles.map(file => (
          <div key={file.id} className={cn("flex items-center gap-2 px-3 py-2 border-r border-zinc-700 cursor-pointer group", activeFileId === file.id ? "bg-zinc-900" : "hover:bg-zinc-700/50")} onClick={() => setActiveFileId(file.id)}>
            <File className="w-3 h-3 text-zinc-500" />
            <span className="text-sm text-zinc-300 whitespace-nowrap">{file.name}{file.isModified && <span className="text-primary ml-1">●</span>}</span>
            <button onClick={(e) => { e.stopPropagation(); handleCloseFile(file.id); }} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-600"><X className="w-3 h-3 text-zinc-400" /></button>
          </div>
        ))}
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-12 bg-zinc-800/50 border-r border-zinc-700 py-2 text-right pr-3 overflow-hidden">
          {getLineNumbers().map(num => (<div key={num} className="text-xs text-zinc-500 h-5 leading-5">{num}</div>))}
        </div>
        <textarea ref={textareaRef} value={activeFile?.content || ''} onChange={(e) => handleContentChange(e.target.value)} className="flex-1 bg-transparent text-zinc-200 font-mono text-sm p-2 resize-none outline-none leading-5" spellCheck={false} placeholder="Start typing..." />
      </div>
      <div className="flex items-center justify-between px-3 py-1 bg-primary text-primary-foreground text-xs">
        <span>{activeFile?.name}</span>
        <span>{activeFile?.content.split('\n').length} lines</span>
      </div>
      {showOpenDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-card rounded-xl w-[400px] max-h-[400px] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-medium">Open File</h3>
              <button onClick={() => setShowOpenDialog(false)} className="p-1 rounded hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 max-h-[300px] overflow-y-auto os-scrollbar">
              {files?.map(file => (
                <button key={file.id} onClick={() => handleOpenFile(file)} className="w-full flex items-center gap-2 p-2 rounded hover:bg-secondary/50 text-left">
                  {file.type === 'folder' ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <File className="w-4 h-4 text-blue-400" />}
                  <span className="text-sm">{file.name}</span>
                </button>
              ))}
              {(!files || files.length === 0) && <p className="text-center text-muted-foreground py-4">No files</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
