import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Folder, File, ChevronRight, ChevronDown, Home, Upload, Download, 
  Trash2, FolderPlus, FilePlus, Grid, List, Search, ArrowUp, Star,
  Copy, Scissors, Clipboard, RefreshCw, Info, MoreVertical, X,
  HardDrive, Image, Music, Video, FileText, Archive, Columns
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, fileOperations, FileItem } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useOSStore } from '@/stores/osStore';
import { cn } from '@/lib/utils';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface FileExplorerProps {
  windowId: string;
  initialPath?: number | null;
}

type ViewMode = 'grid' | 'list' | 'columns';
type SortBy = 'name' | 'date' | 'size' | 'type';

const getFileIcon = (file: FileItem) => {
  if (file.type === 'folder') return <Folder className="w-full h-full text-amber-500" />;
  
  const ext = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.mimeType || '';
  
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <Image className="w-full h-full text-purple-500" />;
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) {
    return <Music className="w-full h-full text-pink-500" />;
  }
  if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(ext || '')) {
    return <Video className="w-full h-full text-red-500" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
    return <Archive className="w-full h-full text-yellow-600" />;
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'xml'].includes(ext || '')) {
    return <FileText className="w-full h-full text-green-500" />;
  }
  
  return <File className="w-full h-full text-blue-400" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ windowId, initialPath }) => {
  const [currentPath, setCurrentPath] = useState<number | null>(initialPath ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showProperties, setShowProperties] = useState<FileItem | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clipboard, setClipboard, openWindow, addNotification, setContextMenu } = useOSStore();

  // Live queries
  const rootFolders = useLiveQuery(() => fileOperations.getRootFolders(), []);
  const currentFiles = useLiveQuery(
    () => showTrash ? fileOperations.getTrash() : fileOperations.getChildren(currentPath),
    [currentPath, showTrash]
  );
  const pathBreadcrumb = useLiveQuery(
    () => currentPath ? fileOperations.getPath(currentPath) : Promise.resolve([]),
    [currentPath]
  );
  const favorites = useLiveQuery(() => fileOperations.getFavorites(), []);
  const storageStats = useLiveQuery(() => fileOperations.getStorageStats(), []);

  // Sort files
  const sortedFiles = React.useMemo(() => {
    if (!currentFiles) return [];
    
    let filtered = currentFiles.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
      // Folders first
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
          break;
        case 'size':
          comparison = (b.size || 0) - (a.size || 0);
          break;
        case 'type':
          const extA = a.name.split('.').pop() || '';
          const extB = b.name.split('.').pop() || '';
          comparison = extA.localeCompare(extB);
          break;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [currentFiles, searchQuery, sortBy, sortAsc]);

  // Handlers
  const handleNavigate = useCallback((id: number | null) => {
    setCurrentPath(id);
    setSelectedIds(new Set());
    setShowTrash(false);
  }, []);

  const handleSelect = useCallback((id: number, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else if (event.shiftKey && selectedIds.size > 0) {
      const files = sortedFiles;
      const lastSelected = Array.from(selectedIds).pop()!;
      const lastIndex = files.findIndex(f => f.id === lastSelected);
      const currentIndex = files.findIndex(f => f.id === id);
      const [start, end] = [Math.min(lastIndex, currentIndex), Math.max(lastIndex, currentIndex)];
      const newSelection = new Set(files.slice(start, end + 1).map(f => f.id!));
      setSelectedIds(newSelection);
    } else {
      setSelectedIds(new Set([id]));
    }
  }, [selectedIds, sortedFiles]);

  const handleDoubleClick = useCallback(async (file: FileItem) => {
    if (file.type === 'folder') {
      handleNavigate(file.id!);
      setExpandedFolders(prev => new Set([...prev, file.id!]));
    } else {
      // Open file with appropriate app
      const ext = file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.mimeType || '';
      
      if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
        openWindow('image-viewer', file.name, 'image', 800, 600, { fileId: file.id });
      } else if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) {
        openWindow('media-player', file.name, 'music', 400, 500, { fileId: file.id });
      } else {
        openWindow('text-editor', file.name, 'file-code', 900, 600, { fileId: file.id });
      }
    }
  }, [handleNavigate, openWindow]);

  const handleCreateFolder = async () => {
    const id = await fileOperations.createFolder('New Folder', currentPath);
    setRenamingId(id);
    setRenameValue('New Folder');
  };

  const handleCreateFile = async () => {
    const id = await fileOperations.createFile('New File.txt', currentPath);
    setRenamingId(id);
    setRenameValue('New File.txt');
  };

  const handleRename = async (id: number) => {
    if (renameValue.trim() && renameValue !== '') {
      await fileOperations.updateFile(id, { name: renameValue.trim() });
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    
    for (const id of selectedIds) {
      await fileOperations.deleteFile(id, showTrash);
    }
    setSelectedIds(new Set());
    addNotification({
      title: showTrash ? 'Permanently Deleted' : 'Moved to Trash',
      message: `${selectedIds.size} item(s)`,
      type: 'success'
    });
  };

  const handleRestore = async () => {
    for (const id of selectedIds) {
      await fileOperations.restoreFile(id);
    }
    setSelectedIds(new Set());
    addNotification({
      title: 'Restored',
      message: `${selectedIds.size} item(s) restored`,
      type: 'success'
    });
  };

  const handleEmptyTrash = async () => {
    if (confirm('Permanently delete all items in Trash?')) {
      await fileOperations.emptyTrash();
      addNotification({
        title: 'Trash Emptied',
        message: 'All items permanently deleted',
        type: 'success'
      });
    }
  };

  const handleCopy = () => {
    setClipboard({ type: 'copy', fileIds: Array.from(selectedIds) });
    addNotification({ title: 'Copied', message: `${selectedIds.size} item(s)`, type: 'info' });
  };

  const handleCut = () => {
    setClipboard({ type: 'cut', fileIds: Array.from(selectedIds) });
    addNotification({ title: 'Cut', message: `${selectedIds.size} item(s)`, type: 'info' });
  };

  const handlePaste = async () => {
    if (!clipboard) return;
    
    setIsLoading(true);
    try {
      for (const fileId of clipboard.fileIds) {
        if (clipboard.type === 'copy') {
          await fileOperations.copyFile(fileId, currentPath);
        } else {
          await fileOperations.moveFile(fileId, currentPath);
        }
      }
      if (clipboard.type === 'cut') {
        setClipboard(null);
      }
      addNotification({ title: 'Pasted', message: `${clipboard.fileIds.length} item(s)`, type: 'success' });
    } catch (error) {
      addNotification({ title: 'Error', message: 'Failed to paste', type: 'error' });
    }
    setIsLoading(false);
  };

  const handleUpload = async (files: FileList) => {
    setIsLoading(true);
    
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        await db.files.add({
          name: file.name,
          type: 'file',
          parentId: currentPath,
          content: content as string | ArrayBuffer,
          mimeType: file.type,
          size: file.size,
          createdAt: new Date(),
          modifiedAt: new Date(),
          isDeleted: false,
          isFavorite: false
        });
      };
      
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
    
    setIsLoading(false);
    addNotification({ title: 'Uploaded', message: `${files.length} file(s)`, type: 'success' });
  };

  const handleDownload = async () => {
    if (selectedIds.size === 0) return;
    
    if (selectedIds.size === 1) {
      const file = sortedFiles.find(f => f.id === Array.from(selectedIds)[0]);
      if (file && file.type === 'file' && file.content) {
        const blob = new Blob([file.content], { type: file.mimeType || 'text/plain' });
        saveAs(blob, file.name);
      }
    } else {
      const zip = new JSZip();
      for (const id of selectedIds) {
        const file = sortedFiles.find(f => f.id === id);
        if (file && file.type === 'file' && file.content) {
          zip.file(file.name, file.content);
        }
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'download.zip');
    }
    
    addNotification({ title: 'Downloaded', message: `${selectedIds.size} item(s)`, type: 'success' });
  };

  const handleContextMenu = (e: React.MouseEvent, file?: FileItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'file-explorer',
      data: { file, selectedIds: Array.from(selectedIds), currentPath }
    });
  };

  const handleDragStart = (e: React.DragEvent, fileId: number) => {
    e.dataTransfer.setData('fileId', fileId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: number) => {
    e.preventDefault();
    setDragOverId(folderId);
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    setDragOverId(null);
    
    const fileId = parseInt(e.dataTransfer.getData('fileId'));
    if (fileId && fileId !== targetId) {
      await fileOperations.moveFile(fileId, targetId);
      addNotification({ title: 'Moved', message: 'File moved successfully', type: 'success' });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (renamingId) return;
      
      if (e.key === 'Delete') {
        handleDelete();
      } else if (e.key === 'F2' && selectedIds.size === 1) {
        const id = Array.from(selectedIds)[0];
        const file = sortedFiles.find(f => f.id === id);
        if (file) {
          setRenamingId(id);
          setRenameValue(file.name);
        }
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          e.preventDefault();
          handleCopy();
        } else if (e.key === 'x') {
          e.preventDefault();
          handleCut();
        } else if (e.key === 'v') {
          e.preventDefault();
          handlePaste();
        } else if (e.key === 'a') {
          e.preventDefault();
          setSelectedIds(new Set(sortedFiles.map(f => f.id!)));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, sortedFiles, renamingId]);

  const renderSidebarFolder = (folder: FileItem, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.id!);
    const isActive = currentPath === folder.id;
    const children = useLiveQuery(
      () => fileOperations.getChildren(folder.id!),
      [folder.id]
    );
    const subFolders = children?.filter(c => c.type === 'folder') || [];

    return (
      <div key={folder.id}>
        <button
          onClick={() => {
            handleNavigate(folder.id!);
            if (subFolders.length > 0) {
              setExpandedFolders(prev => {
                const next = new Set(prev);
                if (next.has(folder.id!)) next.delete(folder.id!);
                else next.add(folder.id!);
                return next;
              });
            }
          }}
          className={cn(
            "w-full flex items-center gap-1 px-2 py-1.5 text-sm rounded-lg transition-colors",
            isActive ? "bg-primary/20 text-primary" : "hover:bg-secondary/50 text-foreground"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {subFolders.length > 0 ? (
            isExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />
          ) : (
            <span className="w-3 shrink-0" />
          )}
          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">{folder.name}</span>
        </button>
        {isExpanded && subFolders.map(sub => renderSidebarFolder(sub, depth + 1))}
      </div>
    );
  };

  return (
    <div className="h-full flex bg-card">
      {/* Sidebar */}
      <div className="w-52 border-r border-border flex flex-col shrink-0">
        <div className="p-2 space-y-1 overflow-y-auto os-scrollbar flex-1">
          {/* Quick Access */}
          <div className="mb-3">
            <p className="text-xs text-muted-foreground px-2 mb-1 font-medium">Quick Access</p>
            <button
              onClick={() => handleNavigate(null)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors",
                currentPath === null && !showTrash ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
              )}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            {rootFolders?.map(folder => renderSidebarFolder(folder))}
          </div>

          {/* Favorites */}
          {favorites && favorites.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground px-2 mb-1 font-medium">Favorites</p>
              {favorites.filter(f => f.type === 'folder').map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleNavigate(folder.id!)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors",
                    currentPath === folder.id ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
                  )}
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trash */}
          <div>
            <button
              onClick={() => { setShowTrash(true); setCurrentPath(null); }}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors",
                showTrash ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
              )}
            >
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>
          </div>
        </div>

        {/* Storage Stats */}
        {storageStats && (
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Storage</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min((storageStats.used / (5 * 1024 * 1024)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {formatFileSize(storageStats.used)} • {storageStats.fileCount} files
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b border-border bg-secondary/20">
          <button
            onClick={() => currentPath && pathBreadcrumb && pathBreadcrumb.length > 1 
              ? handleNavigate(pathBreadcrumb[pathBreadcrumb.length - 2]?.parentId ?? null)
              : handleNavigate(null)}
            disabled={currentPath === null && !showTrash}
            className="p-1.5 rounded-lg hover:bg-secondary/50 disabled:opacity-50 transition-colors"
            title="Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-1 text-sm overflow-x-auto min-w-0">
            <button onClick={() => handleNavigate(null)} className="hover:text-primary shrink-0">
              Home
            </button>
            {pathBreadcrumb?.map((item, i) => (
              <React.Fragment key={item.id}>
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <button
                  onClick={() => handleNavigate(item.id!)}
                  className="hover:text-primary truncate"
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
            {showTrash && (
              <>
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-primary">Trash</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {showTrash ? (
              <>
                <button
                  onClick={handleRestore}
                  disabled={selectedIds.size === 0}
                  className="p-1.5 rounded-lg hover:bg-secondary/50 disabled:opacity-50 transition-colors"
                  title="Restore"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEmptyTrash}
                  className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                  title="Empty Trash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleCreateFolder} className="p-1.5 rounded-lg hover:bg-secondary/50" title="New Folder">
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button onClick={handleCreateFile} className="p-1.5 rounded-lg hover:bg-secondary/50" title="New File">
                  <FilePlus className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button onClick={handleCopy} disabled={selectedIds.size === 0} className="p-1.5 rounded-lg hover:bg-secondary/50 disabled:opacity-50" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={handleCut} disabled={selectedIds.size === 0} className="p-1.5 rounded-lg hover:bg-secondary/50 disabled:opacity-50" title="Cut">
                  <Scissors className="w-4 h-4" />
                </button>
                <button onClick={handlePaste} disabled={!clipboard} className="p-1.5 rounded-lg hover:bg-secondary/50 disabled:opacity-50" title="Paste">
                  <Clipboard className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg hover:bg-secondary/50" title="Upload">
                  <Upload className="w-4 h-4" />
                </button>
                <button onClick={handleDownload} disabled={selectedIds.size === 0} className="p-1.5 rounded-lg hover:bg-secondary/50 disabled:opacity-50" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={handleDelete} disabled={selectedIds.size === 0} className="p-1.5 rounded-lg hover:bg-destructive/20 disabled:opacity-50" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <div className="w-px h-4 bg-border mx-1" />
            <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50')}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-lg transition-colors", viewMode === 'list' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/50')}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border bg-secondary/10">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="os-input w-full pl-8 text-sm h-7"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="os-input text-xs h-7 px-2"
          >
            <option value="name">Name</option>
            <option value="date">Date</option>
            <option value="size">Size</option>
            <option value="type">Type</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1 rounded hover:bg-secondary/50 text-xs"
          >
            {sortAsc ? '↑' : '↓'}
          </button>
        </div>

        {/* Files Grid/List */}
        <div 
          className="flex-1 p-3 overflow-y-auto os-scrollbar"
          onClick={() => setSelectedIds(new Set())}
          onContextMenu={(e) => handleContextMenu(e)}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          
          {!isLoading && sortedFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Folder className="w-16 h-16 mb-3 opacity-30" />
              <p className="text-sm">{showTrash ? 'Trash is empty' : 'This folder is empty'}</p>
            </div>
          )}

          {!isLoading && viewMode === 'grid' && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-2">
              {sortedFiles.map(file => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  draggable={!showTrash}
                  onDragStart={(e) => handleDragStart(e as any, file.id!)}
                  onDragOver={(e) => file.type === 'folder' ? handleDragOver(e as any, file.id!) : undefined}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={(e) => file.type === 'folder' ? handleDrop(e as any, file.id!) : undefined}
                  onClick={(e) => { e.stopPropagation(); handleSelect(file.id!, e); }}
                  onDoubleClick={() => handleDoubleClick(file)}
                  onContextMenu={(e) => { e.stopPropagation(); handleSelect(file.id!, e); handleContextMenu(e, file); }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-colors",
                    selectedIds.has(file.id!) ? "bg-primary/20 ring-1 ring-primary/50" : "hover:bg-secondary/50",
                    dragOverId === file.id && "ring-2 ring-primary"
                  )}
                >
                  <div className="w-12 h-12">
                    {getFileIcon(file)}
                  </div>
                  {renamingId === file.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(file.id!)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(file.id!)}
                      onClick={(e) => e.stopPropagation()}
                      className="os-input text-xs w-full text-center h-5 px-1"
                      autoFocus
                    />
                  ) : (
                    <span className="text-xs text-center truncate w-full px-1">{file.name}</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && viewMode === 'list' && (
            <div className="space-y-0.5">
              <div className="flex items-center gap-3 px-2 py-1 text-xs text-muted-foreground border-b border-border">
                <span className="flex-1">Name</span>
                <span className="w-24 text-right">Size</span>
                <span className="w-36 text-right">Modified</span>
              </div>
              {sortedFiles.map(file => (
                <motion.div
                  key={file.id}
                  layout
                  draggable={!showTrash}
                  onDragStart={(e) => handleDragStart(e as any, file.id!)}
                  onDragOver={(e) => file.type === 'folder' ? handleDragOver(e as any, file.id!) : undefined}
                  onDragLeave={() => setDragOverId(null)}
                  onDrop={(e) => file.type === 'folder' ? handleDrop(e as any, file.id!) : undefined}
                  onClick={(e) => { e.stopPropagation(); handleSelect(file.id!, e); }}
                  onDoubleClick={() => handleDoubleClick(file)}
                  onContextMenu={(e) => { e.stopPropagation(); handleSelect(file.id!, e); handleContextMenu(e, file); }}
                  className={cn(
                    "flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
                    selectedIds.has(file.id!) ? "bg-primary/20" : "hover:bg-secondary/50",
                    dragOverId === file.id && "ring-2 ring-primary"
                  )}
                >
                  <div className="w-5 h-5 shrink-0">{getFileIcon(file)}</div>
                  <span className="flex-1 text-sm truncate">
                    {renamingId === file.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRename(file.id!)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename(file.id!)}
                        onClick={(e) => e.stopPropagation()}
                        className="os-input text-sm w-full h-6"
                        autoFocus
                      />
                    ) : (
                      file.name
                    )}
                  </span>
                  <span className="w-24 text-xs text-muted-foreground text-right">
                    {file.type === 'file' ? formatFileSize(file.size || 0) : '—'}
                  </span>
                  <span className="w-36 text-xs text-muted-foreground text-right">
                    {formatDate(file.modifiedAt)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-3 py-1.5 border-t border-border text-xs text-muted-foreground flex items-center justify-between bg-secondary/10">
          <span>{sortedFiles.length} items</span>
          {selectedIds.size > 0 && <span>{selectedIds.size} selected</span>}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />

      {/* Properties Dialog */}
      <AnimatePresence>
        {showProperties && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
            onClick={() => setShowProperties(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card rounded-xl p-4 w-80 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Properties</h3>
                <button onClick={() => setShowProperties(null)} className="p-1 rounded hover:bg-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12">{getFileIcon(showProperties)}</div>
                  <div>
                    <p className="font-medium">{showProperties.name}</p>
                    <p className="text-xs text-muted-foreground">{showProperties.type}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span>{formatFileSize(showProperties.size || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(showProperties.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modified</span>
                    <span>{formatDate(showProperties.modifiedAt)}</span>
                  </div>
                  {showProperties.mimeType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span>{showProperties.mimeType}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
