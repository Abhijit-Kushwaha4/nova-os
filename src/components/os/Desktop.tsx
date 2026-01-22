import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  Terminal, 
  FileText, 
  Calculator, 
  StickyNote, 
  Settings,
  Globe,
  Image,
  FolderPlus,
  FilePlus,
  Clipboard,
  Info,
  Paintbrush
} from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { cn } from '@/lib/utils';

const iconComponents: Record<string, React.ComponentType<any>> = {
  'folder': Folder,
  'terminal': Terminal,
  'file-text': FileText,
  'calculator': Calculator,
  'sticky-note': StickyNote,
  'settings': Settings,
  'globe': Globe,
  'image': Image,
};

const wallpapers = {
  cosmic: 'linear-gradient(135deg, hsl(222 47% 6%) 0%, hsl(260 50% 12%) 30%, hsl(280 40% 8%) 60%, hsl(222 47% 8%) 100%)',
  ocean: 'linear-gradient(135deg, hsl(200 80% 15%) 0%, hsl(210 70% 20%) 50%, hsl(220 60% 10%) 100%)',
  sunset: 'linear-gradient(135deg, hsl(20 80% 20%) 0%, hsl(340 60% 15%) 50%, hsl(280 50% 10%) 100%)',
  forest: 'linear-gradient(135deg, hsl(120 40% 10%) 0%, hsl(140 50% 15%) 50%, hsl(160 40% 8%) 100%)',
  aurora: 'linear-gradient(135deg, hsl(180 60% 10%) 0%, hsl(280 50% 15%) 50%, hsl(320 40% 12%) 100%)',
};

export const Desktop: React.FC = () => {
  const { 
    desktopIcons, 
    selectedIconIds, 
    selectIcon, 
    clearSelection, 
    updateIconPosition,
    openWindow,
    contextMenu,
    setContextMenu,
    settings,
    createFolder
  } = useOSStore();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const desktopRef = useRef<HTMLDivElement>(null);

  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
      setContextMenu(null);
    }
  }, [clearSelection, setContextMenu]);

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'desktop' });
  }, [setContextMenu]);

  const handleIconClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    selectIcon(id, e.ctrlKey || e.metaKey);
    setContextMenu(null);
  }, [selectIcon, setContextMenu]);

  const handleIconDoubleClick = useCallback((appId: string, name: string) => {
    const appNames: Record<string, string> = {
      'file-explorer': 'File Explorer',
      'terminal': 'Terminal',
      'text-editor': 'Text Editor',
      'calculator': 'Calculator',
      'notes': 'Notes',
      'settings': 'Settings',
      'browser': 'Browser',
      'image-viewer': 'Image Viewer',
    };
    openWindow(appId, appNames[appId] || name, appId);
  }, [openWindow]);

  const handleIconDragStart = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const icon = desktopIcons.find(i => i.id === id);
    if (!icon) return;

    setDraggingId(id);
    dragOffset.current = {
      x: e.clientX - icon.x,
      y: e.clientY - icon.y,
    };
  }, [desktopIcons]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId) return;

      const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 80));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 130));
      
      // Snap to grid
      const snappedX = Math.round(newX / 100) * 100 || 20;
      const snappedY = Math.round(newY / 100) * 100 || 20;
      
      updateIconPosition(draggingId, snappedX, snappedY);
    };

    const handleMouseUp = () => {
      setDraggingId(null);
    };

    if (draggingId) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingId, updateIconPosition]);

  const handleContextMenuAction = (action: string) => {
    switch (action) {
      case 'new-folder':
        createFolder('New Folder', 'root');
        break;
      case 'personalize':
        openWindow('settings', 'Settings', 'settings');
        break;
    }
    setContextMenu(null);
  };

  const wallpaper = wallpapers[settings.wallpaper as keyof typeof wallpapers] || wallpapers.cosmic;

  return (
    <div
      ref={desktopRef}
      className="fixed inset-0 overflow-hidden select-none"
      style={{ 
        background: wallpaper,
        paddingBottom: '48px'
      }}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Animated stars overlay for cosmic theme */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '10%', left: '20%' }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: '30%', left: '70%', animationDelay: '0.5s' }} />
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '60%', left: '40%', animationDelay: '1s' }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: '80%', left: '85%', animationDelay: '1.5s' }} />
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '45%', left: '15%', animationDelay: '2s' }} />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: '25%', left: '55%', animationDelay: '2.5s' }} />
      </div>

      {/* Desktop Icons */}
      {desktopIcons.map((icon) => {
        const IconComponent = iconComponents[icon.icon] || Folder;
        const isSelected = selectedIconIds.includes(icon.id);
        const isDragging = draggingId === icon.id;

        return (
          <motion.div
            key={icon.id}
            className={cn(
              "desktop-icon absolute",
              isSelected && "selected",
              isDragging && "opacity-70"
            )}
            style={{ left: icon.x, top: icon.y }}
            onClick={(e) => handleIconClick(icon.id, e)}
            onDoubleClick={() => handleIconDoubleClick(icon.appId, icon.name)}
            onMouseDown={(e) => handleIconDragStart(icon.id, e)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="desktop-icon-image flex items-center justify-center">
              <IconComponent className="w-10 h-10 text-foreground drop-shadow-lg" />
            </div>
            <span className="desktop-icon-label">{icon.name}</span>
          </motion.div>
        );
      })}

      {/* Context Menu */}
      {contextMenu && contextMenu.type === 'desktop' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="context-menu fixed"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="context-menu-item w-full" onClick={() => handleContextMenuAction('new-folder')}>
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
          <button className="context-menu-item w-full" onClick={() => handleContextMenuAction('new-file')}>
            <FilePlus className="w-4 h-4" />
            <span>New File</span>
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button className="context-menu-item w-full" onClick={() => handleContextMenuAction('paste')}>
            <Clipboard className="w-4 h-4" />
            <span>Paste</span>
          </button>
          <div className="h-px bg-border/50 my-1" />
          <button className="context-menu-item w-full" onClick={() => handleContextMenuAction('personalize')}>
            <Paintbrush className="w-4 h-4" />
            <span>Personalize</span>
          </button>
          <button className="context-menu-item w-full" onClick={() => handleContextMenuAction('properties')}>
            <Info className="w-4 h-4" />
            <span>Properties</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
