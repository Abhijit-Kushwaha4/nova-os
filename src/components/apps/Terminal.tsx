import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppProps } from '@/types/os';
import { useOSStore } from '@/stores/osStore';

interface CommandOutput {
  type: 'input' | 'output' | 'error';
  content: string;
}

export const Terminal: React.FC<AppProps> = () => {
  const { fileSystem, getChildren, createFolder, createFile, deleteItem } = useOSStore();
  const [history, setHistory] = useState<CommandOutput[]>([
    { type: 'output', content: 'WebOS Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.\n' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPath, setCurrentPath] = useState('root');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentFolder = fileSystem.find(f => f.id === currentPath);
  
  const getPathString = useCallback(() => {
    const parts: string[] = [];
    let current = fileSystem.find(f => f.id === currentPath);
    while (current) {
      parts.unshift(current.name);
      current = fileSystem.find(f => f.id === current?.parentId);
    }
    return '/' + parts.join('/');
  }, [currentPath, fileSystem]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const addOutput = (content: string, type: 'output' | 'error' = 'output') => {
    setHistory(prev => [...prev, { type, content }]);
  };

  const executeCommand = (input: string) => {
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
        const items = getChildren(currentPath);
        if (items.length === 0) {
          addOutput('(empty directory)');
        } else {
          const output = items.map(item => 
            item.type === 'folder' ? `\x1b[34m${item.name}/\x1b[0m` : item.name
          ).join('  ');
          addOutput(items.map(item => 
            item.type === 'folder' ? `📁 ${item.name}/` : `📄 ${item.name}`
          ).join('\n'));
        }
        break;

      case 'cd':
        if (!arg || arg === '~') {
          setCurrentPath('root');
        } else if (arg === '..') {
          if (currentFolder?.parentId) {
            setCurrentPath(currentFolder.parentId);
          }
        } else {
          const target = getChildren(currentPath).find(
            i => i.type === 'folder' && i.name.toLowerCase() === arg.toLowerCase()
          );
          if (target) {
            setCurrentPath(target.id);
          } else {
            addOutput(`cd: no such directory: ${arg}`, 'error');
          }
        }
        break;

      case 'pwd':
        addOutput(getPathString());
        break;

      case 'mkdir':
        if (!arg) {
          addOutput('mkdir: missing operand', 'error');
        } else {
          createFolder(arg, currentPath);
          addOutput(`Created folder: ${arg}`);
        }
        break;

      case 'touch':
        if (!arg) {
          addOutput('touch: missing operand', 'error');
        } else {
          createFile(arg, currentPath);
          addOutput(`Created file: ${arg}`);
        }
        break;

      case 'rm':
        if (!arg) {
          addOutput('rm: missing operand', 'error');
        } else {
          const target = getChildren(currentPath).find(i => i.name.toLowerCase() === arg.toLowerCase());
          if (target) {
            deleteItem(target.id);
            addOutput(`Removed: ${arg}`);
          } else {
            addOutput(`rm: cannot remove '${arg}': No such file or directory`, 'error');
          }
        }
        break;

      case 'cat':
        if (!arg) {
          addOutput('cat: missing operand', 'error');
        } else {
          const file = getChildren(currentPath).find(
            i => i.type === 'file' && i.name.toLowerCase() === arg.toLowerCase()
          );
          if (file && file.content !== undefined) {
            addOutput(file.content || '(empty file)');
          } else if (file) {
            addOutput('(empty file)');
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
        │      WebOS          │
        ╰─────────────────────╯
        
        OS: WebOS 1.0.0
        Host: Browser
        Kernel: JavaScript
        Shell: WebOS Terminal
        Resolution: ${window.innerWidth}x${window.innerHeight}
        DE: WebOS Desktop
        Theme: Cosmic Dark
        Terminal: WebOS Terminal
        CPU: ${navigator.hardwareConcurrency || 'Unknown'} cores
        Memory: ${(navigator as any).deviceMemory || 'Unknown'} GB
        `);
        break;

      default:
        addOutput(`${cmd}: command not found. Type 'help' for available commands.`, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete
      const items = getChildren(currentPath);
      const matches = items.filter(i => i.name.toLowerCase().startsWith(currentInput.toLowerCase()));
      if (matches.length === 1) {
        const words = currentInput.split(' ');
        words[words.length - 1] = matches[0].name;
        setCurrentInput(words.join(' '));
      }
    }
  };

  return (
    <div 
      className="h-full bg-zinc-900 text-green-400 font-mono text-sm p-3 overflow-hidden flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto os-scrollbar">
        {history.map((entry, i) => (
          <div 
            key={i} 
            className={`whitespace-pre-wrap ${
              entry.type === 'error' ? 'text-red-400' : 
              entry.type === 'input' ? 'text-blue-400' : 'text-green-400'
            }`}
          >
            {entry.content}
          </div>
        ))}
        
        {/* Current Input Line */}
        <div className="flex items-center gap-2">
          <span className="text-blue-400 shrink-0">{getPathString()} $</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
