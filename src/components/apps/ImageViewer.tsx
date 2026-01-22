import React from 'react';
import { AppProps } from '@/types/os';
import { Image, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

export const ImageViewer: React.FC<AppProps> = () => {
  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-700">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-zinc-700 transition-colors">
            <ZoomIn className="w-4 h-4 text-zinc-400" />
          </button>
          <button className="p-1.5 rounded hover:bg-zinc-700 transition-colors">
            <ZoomOut className="w-4 h-4 text-zinc-400" />
          </button>
          <button className="p-1.5 rounded hover:bg-zinc-700 transition-colors">
            <RotateCw className="w-4 h-4 text-zinc-400" />
          </button>
          <button className="p-1.5 rounded hover:bg-zinc-700 transition-colors">
            <Maximize2 className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-sm mb-2">No image selected</p>
          <p className="text-xs">Open an image from the file explorer</p>
        </div>
      </div>
    </div>
  );
};
