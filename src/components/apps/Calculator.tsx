import React, { useState, useCallback } from 'react';
import { Delete, Divide, X, Minus, Plus, Equal, Percent } from 'lucide-react';
import { AppProps } from '@/types/os';
import { cn } from '@/lib/utils';

export const Calculator: React.FC<AppProps> = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState(0);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = currentValue / inputValue;
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
      setHistory(prev => [...prev, `${currentValue} ${operation} ${inputValue} = ${result}`].slice(-5));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = previousValue + inputValue;
        break;
      case '-':
        result = previousValue - inputValue;
        break;
      case '×':
        result = previousValue * inputValue;
        break;
      case '÷':
        result = previousValue / inputValue;
        break;
      default:
        return;
    }

    setHistory(prev => [...prev, `${previousValue} ${operation} ${inputValue} = ${result}`].slice(-5));
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
    else if (e.key === '.') inputDecimal();
    else if (e.key === '+') performOperation('+');
    else if (e.key === '-') performOperation('-');
    else if (e.key === '*') performOperation('×');
    else if (e.key === '/') performOperation('÷');
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Escape') clear();
    else if (e.key === 'Backspace') setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  }, [display, previousValue, operation]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const Button = ({ 
    children, 
    onClick, 
    variant = 'default',
    span = 1
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    variant?: 'default' | 'operator' | 'equals' | 'function';
    span?: number;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg font-medium text-lg transition-all active:scale-95 flex items-center justify-center",
        variant === 'default' && "bg-secondary hover:bg-secondary/80 text-foreground",
        variant === 'operator' && "bg-primary/20 hover:bg-primary/30 text-primary",
        variant === 'equals' && "bg-primary hover:bg-primary/90 text-primary-foreground",
        variant === 'function' && "bg-muted hover:bg-muted/80 text-muted-foreground",
        span === 2 && "col-span-2"
      )}
      style={{ height: '56px' }}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-card p-4">
      {/* History */}
      <div className="mb-2 h-16 overflow-y-auto os-scrollbar">
        {history.map((entry, i) => (
          <div key={i} className="text-xs text-muted-foreground text-right">{entry}</div>
        ))}
      </div>

      {/* Display */}
      <div className="mb-4 p-4 rounded-xl bg-secondary/50">
        <div className="text-sm text-muted-foreground text-right h-5">
          {previousValue !== null && `${previousValue} ${operation || ''}`}
        </div>
        <div className="text-4xl font-light text-right text-foreground truncate">
          {display}
        </div>
      </div>

      {/* Memory buttons */}
      <div className="grid grid-cols-4 gap-1 mb-2">
        <button onClick={() => setMemory(0)} className="text-xs text-muted-foreground hover:text-foreground py-1">MC</button>
        <button onClick={() => setDisplay(String(memory))} className="text-xs text-muted-foreground hover:text-foreground py-1">MR</button>
        <button onClick={() => setMemory(memory + parseFloat(display))} className="text-xs text-muted-foreground hover:text-foreground py-1">M+</button>
        <button onClick={() => setMemory(memory - parseFloat(display))} className="text-xs text-muted-foreground hover:text-foreground py-1">M-</button>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        <Button onClick={clear} variant="function">AC</Button>
        <Button onClick={toggleSign} variant="function">±</Button>
        <Button onClick={percentage} variant="function">%</Button>
        <Button onClick={() => performOperation('÷')} variant="operator">÷</Button>

        <Button onClick={() => inputDigit('7')}>7</Button>
        <Button onClick={() => inputDigit('8')}>8</Button>
        <Button onClick={() => inputDigit('9')}>9</Button>
        <Button onClick={() => performOperation('×')} variant="operator">×</Button>

        <Button onClick={() => inputDigit('4')}>4</Button>
        <Button onClick={() => inputDigit('5')}>5</Button>
        <Button onClick={() => inputDigit('6')}>6</Button>
        <Button onClick={() => performOperation('-')} variant="operator">−</Button>

        <Button onClick={() => inputDigit('1')}>1</Button>
        <Button onClick={() => inputDigit('2')}>2</Button>
        <Button onClick={() => inputDigit('3')}>3</Button>
        <Button onClick={() => performOperation('+')} variant="operator">+</Button>

        <Button onClick={() => inputDigit('0')} span={2}>0</Button>
        <Button onClick={inputDecimal}>.</Button>
        <Button onClick={calculate} variant="equals">=</Button>
      </div>
    </div>
  );
};
