import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppProps } from '@/types/os';
import { db, fileOperations, FileItem } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface CommandOutput {
  type: 'input' | 'output' | 'error';
  content: string;
}

export const Terminal: React.FC<AppProps> = () => {
  const [history, setHistory] = useState<CommandOutput[]>([
    { type: 'output', content: 'WebOS Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.\n' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPath, setCurrentPath] = useState<number | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentFiles = useLiveQuery(() => fileOperations.getChildren(currentPath), [currentPath]);
  const pathBreadcrumb = useLiveQuery(
    () => currentPath ? fileOperations.getPath(currentPath) : Promise.resolve([]),
    [currentPath]
  );

  const getPathString = useCallback(() => {
    if (!pathBreadcrumb || pathBreadcrumb.length === 0) return '/home';
    return '/home/' + pathBreadcrumb.map(p => p.name).join('/');
  }, [pathBreadcrumb]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const addOutput = (content: string, type: 'output' | 'error' = 'output') => {
    setHistory(prev => [...prev, { type, content }]);
  };

  const executeCommand = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setHistory(prev => [...prev, { type: 'input', content: `${getPathString()} $ ${trimmed}` }]);
    setCommandHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const [cmd, ...args] = trimmed.split(' ');
    const arg = args.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        addOutput(`Available commands:
  help        - Show this help message
  ls          - List files in current directory
  cd [dir]    - Change directory (use ".." for parent)
  pwd         - Print working directory
  mkdir [name]- Create a new folder
  touch [name]- Create a new file
  rm [name]   - Remove a file or folder
  cat [file]  - View file contents
  clear       - Clear terminal
  echo [text] - Print text
  date        - Show current date/time
  whoami      - Show current user
  neofetch    - Show system info`);
        break;

      case 'ls':
        if (!currentFiles || currentFiles.length === 0) {
          addOutput('(empty directory)');
        } else {
          addOutput(currentFiles.map(item => 
            item.type === 'folder' ? `📁 ${item.name}/` : `📄 ${item.name}`
          ).join('\n'));
        }
        break;

      case 'cd':
        if (!arg || arg === '~') {
          setCurrentPath(null);
        } else if (arg === '..') {
          if (pathBreadcrumb && pathBreadcrumb.length > 0) {
            const parent = pathBreadcrumb[pathBreadcrumb.length - 1];
            setCurrentPath(parent.parentId);
          }
        } else {
          const target = currentFiles?.find(i => i.type === 'folder' && i.name.toLowerCase() === arg.toLowerCase());
          if (target) {
            setCurrentPath(target.id!);
          } else {
            addOutput(`cd: no such directory: ${arg}`, 'error');
          }
        }
        break;

      case 'pwd':
        addOutput(getPathString());
        break;

      case 'mkdir':
        if (!arg) addOutput('mkdir: missing operand', 'error');
        else {
          await fileOperations.createFolder(arg, currentPath);
          addOutput(`Created folder: ${arg}`);
        }
        break;

      case 'touch':
        if (!arg) addOutput('touch: missing operand', 'error');
        else {
          await fileOperations.createFile(arg, currentPath);
          addOutput(`Created file: ${arg}`);
        }
        break;

      case 'rm':
        if (!arg) addOutput('rm: missing operand', 'error');
        else {
          const target = currentFiles?.find(i => i.name.toLowerCase() === arg.toLowerCase());
          if (target) {
            await fileOperations.deleteFile(target.id!);
            addOutput(`Removed: ${arg}`);
          } else {
            addOutput(`rm: cannot remove '${arg}': No such file`, 'error');
          }
        }
        break;

      case 'cat':
        if (!arg) addOutput('cat: missing operand', 'error');
        else {
          const file = currentFiles?.find(i => i.type === 'file' && i.name.toLowerCase() === arg.toLowerCase());
          if (file) {
            const fullFile = await fileOperations.getFile(file.id!);
            addOutput(fullFile?.content?.toString() || '(empty file)');
          } else {
            addOutput(`cat: ${arg}: No such file`, 'error');
          }
        }
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'echo':
        addOutput(arg || '');
        break;

      case 'date':
        addOutput(new Date().toString());
        break;

      case 'whoami':
        addOutput('user');
        break;

      case 'neofetch':
        addOutput(`
       ╭─────────────────────╮
       │       WebOS         │
       ╰─────────────────────╯
       
       OS: WebOS 1.0.0
       Host: Browser
       Kernel: JavaScript
       Shell: WebOS Terminal
       Resolution: ${window.innerWidth}x${window.innerHeight}
       DE: WebOS Desktop
       Theme: Cosmic Dark
       `);
        break;

      default:
        addOutput(`${cmd}: command not found`, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  return (
    <div className="h-full bg-zinc-900 text-green-400 font-mono text-sm p-3 flex flex-col" onClick={() => inputRef.current?.focus()}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto os-scrollbar">
        {history.map((entry, i) => (
          <div key={i} className={`whitespace-pre-wrap ${entry.type === 'error' ? 'text-red-400' : entry.type === 'input' ? 'text-blue-400' : 'text-green-400'}`}>
            {entry.content}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-blue-400 shrink-0">{getPathString()} $</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
