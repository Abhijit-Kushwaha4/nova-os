import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Desktop } from './os/Desktop';
import { Taskbar } from './os/Taskbar';
import { StartMenu } from './os/StartMenu';
import { BootScreen } from './os/BootScreen';
import { Window } from './os/Window';
import { useOSStore } from '@/stores/osStore';

// Apps
import { FileExplorer } from './apps/FileExplorer';
import { Terminal } from './apps/Terminal';
import { Calculator } from './apps/Calculator';
import { Notes } from './apps/Notes';
import { Settings } from './apps/Settings';
import { TextEditor } from './apps/TextEditor';
import { Browser } from './apps/Browser';
import { ImageViewer } from './apps/ImageViewer';

const appComponents: Record<string, React.ComponentType<{ windowId: string }>> = {
  'file-explorer': FileExplorer,
  'terminal': Terminal,
  'calculator': Calculator,
  'notes': Notes,
  'settings': Settings,
  'text-editor': TextEditor,
  'browser': Browser,
  'image-viewer': ImageViewer,
};

export const WebOS: React.FC = () => {
  const { windows, isBooting, finishBooting, setStartMenuOpen, setContextMenu } = useOSStore();

  // Close menus when clicking anywhere
  React.useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [setContextMenu]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Win key or Cmd key opens start menu
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
            {/* Desktop Background */}
            <Desktop />

            {/* Windows */}
            <AnimatePresence>
              {windows.map((win) => {
                const AppComponent = appComponents[win.appId];
                if (!AppComponent) return null;
                
                return (
                  <Window key={win.id} window={win}>
                    <AppComponent windowId={win.id} />
                  </Window>
                );
              })}
            </AnimatePresence>

            {/* Start Menu */}
            <StartMenu />

            {/* Taskbar */}
            <Taskbar />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
