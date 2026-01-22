import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  FolderOpen,
  File,
  X,
  Plus,
  ChevronDown
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { AppProps, FileSystemItem } from '@/types/os';
import { cn } from '@/lib/utils';

interface OpenFile {
  id: string;
  name: string;
  content: string;
  isModified: boolean;
  fileId?: string; // Reference to file system
}

export const TextEditor: React.FC<AppProps> = () => {
  const { fileSystem, getChildren, createFile, updateFileContent } = useOSStore();
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([
    { id: 'untitled-1', name: 'Untitled', content: '', isModified: false }
  ]);
  const [activeFileId, setActiveFileId] = useState('untitled-1');
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = openFiles.find(f => f.id === activeFileId);

  const handleContentChange = (content: string) => {
    setOpenFiles(files => files.map(f => 
      f.id === activeFileId ? { ...f, content, isModified: true } : f
    ));
  };

  const handleSave = () => {
    if (!activeFile) return;

    if (activeFile.fileId) {
      // Update existing file
      updateFileContent(activeFile.fileId, activeFile.content);
      setOpenFiles(files => files.map(f => 
        f.id === activeFileId ? { ...f, isModified: false } : f
      ));
    } else {
      // Create new file
      const name = prompt('Enter file name:', activeFile.name);
      if (name) {
        const newFile = createFile(name, 'documents', activeFile.content);
        setOpenFiles(files => files.map(f => 
          f.id === activeFileId ? { ...f, name, fileId: newFile.id, isModified: false } : f
        ));
      }
    }
  };

  const handleOpenFile = (file: FileSystemItem) => {
    const existingTab = openFiles.find(f => f.fileId === file.id);
    if (existingTab) {
      setActiveFileId(existingTab.id);
    } else {
      const newTab: OpenFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        content: file.content || '',
        isModified: false,
        fileId: file.id,
      };
      setOpenFiles([...openFiles, newTab]);
      setActiveFileId(newTab.id);
    }
    setShowOpenDialog(false);
  };

  const handleNewFile = () => {
    const newFile: OpenFile = {
      id: `untitled-${Date.now()}`,
      name: 'Untitled',
      content: '',
      isModified: false,
    };
    setOpenFiles([...openFiles, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleCloseFile = (fileId: string) => {
    const file = openFiles.find(f => f.id === fileId);
    if (file?.isModified) {
      if (!confirm('Discard unsaved changes?')) return;
    }

    const newFiles = openFiles.filter(f => f.id !== fileId);
    if (newFiles.length === 0) {
      handleNewFile();
    } else if (activeFileId === fileId) {
      setActiveFileId(newFiles[0].id);
    }
    setOpenFiles(newFiles.length > 0 ? newFiles : openFiles);
  };

  const getLineNumbers = () => {
    const lines = (activeFile?.content || '').split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  };

  // Simple syntax highlighting
  const getHighlightedContent = (content: string) => {
    // This is a simplified version - real syntax highlighting would use a library
    return content;
  };

  const files = getChildren(currentFolder).filter(f => f.type === 'file');
  const folders = getChildren(currentFolder).filter(f => f.type === 'folder');

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-zinc-800 border-b border-zinc-700">
        <button
          onClick={handleNewFile}
          className="p-1.5 rounded hover:bg-zinc-700 transition-colors"
          title="New File"
        >
          <Plus className="w-4 h-4 text-zinc-400" />
        </button>
        <button
          onClick={() => setShowOpenDialog(true)}
          className="p-1.5 rounded hover:bg-zinc-700 transition-colors"
          title="Open File"
        >
          <FolderOpen className="w-4 h-4 text-zinc-400" />
        </button>
        <button
          onClick={handleSave}
          disabled={!activeFile?.isModified}
          className="p-1.5 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
          title="Save"
        >
          <Save className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-zinc-800 border-b border-zinc-700 overflow-x-auto">
        {openFiles.map(file => (
          <div
            key={file.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border-r border-zinc-700 cursor-pointer group",
              activeFileId === file.id ? "bg-zinc-900" : "hover:bg-zinc-700/50"
            )}
            onClick={() => setActiveFileId(file.id)}
          >
            <File className="w-3 h-3 text-zinc-500" />
            <span className="text-sm text-zinc-300 whitespace-nowrap">
              {file.name}
              {file.isModified && <span className="text-primary ml-1">●</span>}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleCloseFile(file.id); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-600 transition-opacity"
            >
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="w-12 bg-zinc-800/50 border-r border-zinc-700 py-2 text-right pr-3 overflow-hidden">
          {getLineNumbers().map(num => (
            <div key={num} className="text-xs text-zinc-500 h-5 leading-5">
              {num}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={activeFile?.content || ''}
          onChange={(e) => handleContentChange(e.target.value)}
          className="flex-1 bg-transparent text-zinc-200 font-mono text-sm p-2 resize-none outline-none leading-5"
          spellCheck={false}
          placeholder="Start typing..."
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-primary text-primary-foreground text-xs">
        <span>{activeFile?.name}</span>
        <span>
          {activeFile?.content.split('\n').length} lines, {activeFile?.content.length} characters
        </span>
      </div>

      {/* Open File Dialog */}
      {showOpenDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-card rounded-xl w-[400px] max-h-[400px] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-medium">Open File</h3>
              <button 
                onClick={() => setShowOpenDialog(false)}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 max-h-[300px] overflow-y-auto os-scrollbar">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id)}
                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-secondary/50 text-left"
                >
                  <FolderOpen className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">{folder.name}</span>
                </button>
              ))}
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleOpenFile(file)}
                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-secondary/50 text-left"
                >
                  <File className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{file.name}</span>
                </button>
              ))}
              {files.length === 0 && folders.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No files found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
