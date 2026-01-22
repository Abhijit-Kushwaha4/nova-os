import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { useOSStore } from '@/stores/osStore';
import { WindowState } from '@/types/os';
import { cn } from '@/lib/utils';

interface WindowProps {
  window: WindowState;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ window: win, children }) => {
  const { 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    restoreWindow, 
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    activeWindowId 
  } = useOSStore();

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string>('');
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, winX: 0, winY: 0 });

  const isActive = activeWindowId === win.id;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    focusWindow(win.id);
    
    if (win.isMaximized) return;
    
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    };
  }, [win.id, win.x, win.y, win.isMaximized, focusWindow]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    if (win.isMaximized) return;
    
    setIsResizing(true);
    setResizeDir(direction);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: win.width,
      height: win.height,
      winX: win.x,
      winY: win.y,
    };
    focusWindow(win.id);
  }, [win.isMaximized, win.width, win.height, win.x, win.y, win.id, focusWindow]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 100));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 100));
        updateWindowPosition(win.id, newX, newY);
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;

        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;
        let newX = resizeStart.current.winX;
        let newY = resizeStart.current.winY;

        if (resizeDir.includes('e')) newWidth = Math.max(300, resizeStart.current.width + deltaX);
        if (resizeDir.includes('s')) newHeight = Math.max(200, resizeStart.current.height + deltaY);
        if (resizeDir.includes('w')) {
          newWidth = Math.max(300, resizeStart.current.width - deltaX);
          newX = resizeStart.current.winX + (resizeStart.current.width - newWidth);
        }
        if (resizeDir.includes('n')) {
          newHeight = Math.max(200, resizeStart.current.height - deltaY);
          newY = resizeStart.current.winY + (resizeStart.current.height - newHeight);
        }

        updateWindowSize(win.id, newWidth, newHeight);
        updateWindowPosition(win.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDir('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, resizeDir, win.id, updateWindowPosition, updateWindowSize]);

  if (win.isMinimized) return null;

  const windowWidth = win.isMaximized ? window.innerWidth : win.width;
  const windowHeight = win.isMaximized ? window.innerHeight - 48 : win.height;

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ 
        opacity: win.isClosing ? 0 : 1, 
        scale: win.isClosing ? 0.95 : 1, 
        y: win.isClosing ? 10 : 0 
      }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "os-window fixed flex flex-col overflow-hidden",
        isActive ? "ring-1 ring-primary/30" : "opacity-95",
        isDragging || isResizing ? "transition-none" : "transition-shadow"
      )}
      style={{
        left: win.isMaximized ? 0 : win.x,
        top: win.isMaximized ? 0 : win.y,
        width: windowWidth,
        height: windowHeight,
        zIndex: win.zIndex,
      }}
      onClick={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between h-10 px-3 bg-os-window-header select-none cursor-move shrink-0"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{win.title}</span>
        </div>
        
        <div className="window-controls flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="window-control-minimize flex items-center justify-center"
            title="Minimize"
          >
            <Minus className="w-2 h-2 text-black/70" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); win.isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id); }}
            className="window-control-maximize flex items-center justify-center"
            title={win.isMaximized ? "Restore" : "Maximize"}
          >
            {win.isMaximized ? (
              <Square className="w-2 h-2 text-black/70" />
            ) : (
              <Maximize2 className="w-2 h-2 text-black/70" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            className="window-control-close flex items-center justify-center"
            title="Close"
          >
            <X className="w-2 h-2 text-white/90" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-card/50">
        {children}
      </div>

      {/* Resize Handles */}
      {!win.isMaximized && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} />
          <div className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} />
          <div className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} />
          <div className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'se')} />
          <div className="absolute top-0 left-2 right-2 h-1 cursor-n-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'n')} />
          <div className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize" onMouseDown={(e) => handleResizeMouseDown(e, 's')} />
          <div className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'w')} />
          <div className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'e')} />
        </>
      )}
    </motion.div>
  );
};
