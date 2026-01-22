import React, { useState } from 'react';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Home,
  Upload,
  Download,
  Trash2,
  FolderPlus,
  FilePlus,
  Grid,
  List,
  Search,
  ArrowLeft,
  ArrowRight,
  ArrowUp
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { FileSystemItem } from '@/types/os';
import { cn } from '@/lib/utils';
import { AppProps } from '@/types/os';

export const FileExplorer: React.FC<AppProps> = () => {
  const { fileSystem, getChildren, createFolder, createFile, deleteItem, renameItem } = useOSStore();
  const [currentPath, setCurrentPath] = useState<string | null>('root');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [searchQuery, setSearchQuery] = useState('');
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const currentFolder = fileSystem.find(f => f.id === currentPath);
  const currentItems = getChildren(currentPath).filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pathParts = React.useMemo(() => {
    const parts: FileSystemItem[] = [];
    let current = currentFolder;
    while (current) {
      parts.unshift(current);
      current = fileSystem.find(f => f.id === current?.parentId);
    }
    return parts;
  }, [currentFolder, fileSystem]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleItemClick = (item: FileSystemItem) => {
    setSelectedItem(item.id);
  };

  const handleItemDoubleClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setCurrentPath(item.id);
      setExpandedFolders(prev => new Set([...prev, item.id]));
    }
  };

  const handleNewFolder = () => {
    const newFolder = createFolder('New Folder', currentPath);
    setIsRenaming(newFolder.id);
    setRenameValue('New Folder');
  };

  const handleNewFile = () => {
    const newFile = createFile('New File.txt', currentPath);
    setIsRenaming(newFile.id);
    setRenameValue('New File.txt');
  };

  const handleDelete = () => {
    if (selectedItem && selectedItem !== 'root') {
      deleteItem(selectedItem);
      setSelectedItem(null);
    }
  };

  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      renameItem(id, renameValue.trim());
    }
    setIsRenaming(null);
    setRenameValue('');
  };

  const navigateUp = () => {
    if (currentFolder?.parentId) {
      setCurrentPath(currentFolder.parentId);
    }
  };

  const renderTreeItem = (item: FileSystemItem, depth: number = 0) => {
    const children = getChildren(item.id);
    const isExpanded = expandedFolders.has(item.id);
    const isFolder = item.type === 'folder';
    const isSelected = currentPath === item.id;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (isFolder) {
              toggleFolder(item.id);
              setCurrentPath(item.id);
            }
          }}
          className={cn(
            "w-full flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-secondary/50 transition-colors",
            isSelected && "bg-primary/20"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isFolder && children.length > 0 && (
            isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          )}
          {isFolder && children.length === 0 && <span className="w-3" />}
          <Folder className="w-4 h-4 text-amber-500" />
          <span className="truncate">{item.name}</span>
        </button>
        {isFolder && isExpanded && children.filter(c => c.type === 'folder').map(child => 
          renderTreeItem(child, depth + 1)
        )}
      </div>
    );
  };

  const rootFolder = fileSystem.find(f => f.id === 'root');

  return (
    <div className="flex h-full bg-card">
      {/* Sidebar */}
      <div className="w-48 border-r border-border p-2 overflow-y-auto os-scrollbar shrink-0">
        <div className="flex items-center gap-2 px-2 py-1 mb-2">
          <Home className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Quick Access</span>
        </div>
        {rootFolder && renderTreeItem(rootFolder)}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b border-border">
          <button
            onClick={navigateUp}
            disabled={!currentFolder?.parentId}
            className="p-1.5 rounded hover:bg-secondary/50 disabled:opacity-50 transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          
          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-1 text-sm overflow-x-auto">
            {pathParts.map((part, i) => (
              <React.Fragment key={part.id}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                <button
                  onClick={() => setCurrentPath(part.id)}
                  className="hover:text-primary transition-colors truncate"
                >
                  {part.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleNewFolder}
              className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
              title="New Folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            <button
              onClick={handleNewFile}
              className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
              title="New File"
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={!selectedItem || selectedItem === 'root'}
              className="p-1.5 rounded hover:bg-destructive/20 disabled:opacity-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded transition-colors", viewMode === 'grid' ? 'bg-primary/20' : 'hover:bg-secondary/50')}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded transition-colors", viewMode === 'list' ? 'bg-primary/20' : 'hover:bg-secondary/50')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="os-input w-full pl-8 text-sm h-8"
            />
          </div>
        </div>

        {/* Files */}
        <div className="flex-1 p-3 overflow-y-auto os-scrollbar">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Folder className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">This folder is empty</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-6 gap-2">
              {currentItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg transition-colors",
                    selectedItem === item.id ? "bg-primary/20" : "hover:bg-secondary/50"
                  )}
                >
                  {item.type === 'folder' ? (
                    <Folder className="w-10 h-10 text-amber-500" />
                  ) : (
                    <File className="w-10 h-10 text-blue-400" />
                  )}
                  {isRenaming === item.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(item.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(item.id)}
                      className="os-input text-xs w-full text-center h-6"
                      autoFocus
                    />
                  ) : (
                    <span className="text-xs text-center truncate w-full">{item.name}</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {currentItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                    selectedItem === item.id ? "bg-primary/20" : "hover:bg-secondary/50"
                  )}
                >
                  {item.type === 'folder' ? (
                    <Folder className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <File className="w-5 h-5 text-blue-400 shrink-0" />
                  )}
                  {isRenaming === item.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(item.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(item.id)}
                      className="os-input text-sm flex-1 h-6"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="flex-1 text-sm truncate">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.modifiedAt.toLocaleDateString()}
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-3 py-1.5 border-t border-border text-xs text-muted-foreground">
          {currentItems.length} items
        </div>
      </div>
    </div>
  );
};
