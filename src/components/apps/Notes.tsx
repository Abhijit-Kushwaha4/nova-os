import React, { useState } from 'react';
import { Plus, Search, Pin, PinOff, Trash2 } from 'lucide-react';
import { db, noteOperations, NoteItem } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppProps } from '@/types/os';
import { cn } from '@/lib/utils';

export const Notes: React.FC<AppProps> = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const notes = useLiveQuery(() => noteOperations.getAllNotes(), []);

  const filteredNotes = notes?.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
  }) || [];

  const selectedNote = notes?.find(n => n.id === selectedNoteId);

  const handleNewNote = async () => {
    const id = await noteOperations.createNote();
    setSelectedNoteId(id);
  };

  const handleDeleteNote = async (id: number) => {
    await noteOperations.deleteNote(id);
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const handleUpdateNote = async (id: number, updates: Partial<NoteItem>) => {
    await noteOperations.updateNote(id, updates);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <div className="h-full flex bg-card">
      <div className="w-64 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Notes</h2>
            <button onClick={handleNewNote} className="p-1.5 rounded-lg hover:bg-secondary"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="os-input w-full pl-8 text-sm h-8" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto os-scrollbar p-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">No notes</div>
          ) : (
            filteredNotes.map(note => (
              <button key={note.id} onClick={() => setSelectedNoteId(note.id!)} className={cn("w-full text-left p-3 rounded-lg mb-1", selectedNoteId === note.id ? "bg-primary/20" : "hover:bg-secondary/50")}>
                <div className="flex items-start gap-2">
                  {note.isPinned && <Pin className="w-3 h-3 text-primary shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{note.title || 'Untitled'}</h3>
                    <p className="text-xs text-muted-foreground truncate">{note.content || 'Empty'}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="flex items-center justify-between p-2 border-b border-border">
              <div />
              <div className="flex items-center gap-1">
                <button onClick={() => handleUpdateNote(selectedNote.id!, { isPinned: !selectedNote.isPinned })} className="p-1.5 rounded hover:bg-secondary/50">
                  {selectedNote.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDeleteNote(selectedNote.id!)} className="p-1.5 rounded hover:bg-destructive/20 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input type="text" value={selectedNote.title} onChange={(e) => handleUpdateNote(selectedNote.id!, { title: e.target.value })} placeholder="Title" className="px-4 py-3 text-xl font-semibold bg-transparent border-none outline-none" />
            <textarea value={selectedNote.content} onChange={(e) => handleUpdateNote(selectedNote.id!, { content: e.target.value })} placeholder="Start typing..." className="flex-1 px-4 py-2 bg-transparent border-none outline-none resize-none os-scrollbar" />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <p className="mb-2">Select or create a note</p>
            <button onClick={handleNewNote} className="os-button-primary">Create Note</button>
          </div>
        )}
      </div>
    </div>
  );
};
