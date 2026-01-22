import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Desktop } from './os/Desktop';
import { Taskbar } from './os/Taskbar';
import { StartMenu } from './os/StartMenu';
import { BootScreen } from './os/BootScreen';
import { Window } from './os/Window';
import { useOSStore } from '@/stores/osStore';
import { initializeDatabase } from '@/lib/db';

// Apps
import { FileExplorer } from './apps/FileExplorer';
import { Terminal } from './apps/Terminal';
import { Calculator } from './apps/Calculator';
import { Notes } from './apps/Notes';
import { Settings } from './apps/Settings';
import { TextEditor } from './apps/TextEditor';
import { Browser } from './apps/Browser';
import { ImageViewer } from './apps/ImageViewer';

const appComponents: Record<string, React.ComponentType<{ windowId: string; [key: string]: any }>> = {
  'file-explorer': FileExplorer,
  'terminal': Terminal,
  'calculator': Calculator,
  'notes': Notes,
  'settings': Settings,
  'text-editor': TextEditor,
  'browser': Browser,
  'image-viewer': ImageViewer,
  'calendar': () => <div className="h-full flex items-center justify-center text-muted-foreground">Calendar App - Coming Soon</div>,
  'media-player': () => <div className="h-full flex items-center justify-center text-muted-foreground">Media Player - Coming Soon</div>,
  'paint': () => <div className="h-full flex items-center justify-center text-muted-foreground">Paint App - Coming Soon</div>,
  'weather': () => <div className="h-full flex items-center justify-center text-muted-foreground">Weather App - Coming Soon</div>,
  'task-manager': () => <div className="h-full flex items-center justify-center text-muted-foreground">Task Manager - Coming Soon</div>,
};

export const WebOS: React.FC = () => {
  const { windows, isBooting, finishBooting, setStartMenuOpen, setContextMenu } = useOSStore();

  // Initialize database on mount
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  // Close menus when clicking anywhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [setContextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || (e.key === 'Escape' && !e.altKey)) {
        e.preventDefault();
        setStartMenuOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStartMenuOpen]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {isBooting ? (
          <BootScreen key="boot" onComplete={finishBooting} />
        ) : (
          <>
            <Desktop />
            <AnimatePresence>
              {windows.map((win) => {
                const AppComponent = appComponents[win.appId];
                if (!AppComponent) return null;
                return (
                  <Window key={win.id} window={win}>
                    <AppComponent windowId={win.id} {...(win.props || {})} />
                  </Window>
                );
              })}
            </AnimatePresence>
            <StartMenu />
            <Taskbar />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
