import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, ClipboardList } from 'lucide-react';
import { auth, db } from '../../services/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'goldsucher_todos';

export const TodoDrawer: React.FC<TodoDrawerProps> = ({ isOpen, onClose }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse todos");
      }
    } else {
        setTodos([
            { id: '1', text: 'Schaufel & Pfanne', completed: false },
            { id: '2', text: 'Gummistiefel', completed: false },
        ]);
    }
  }, []);

  // 2. Firebase Sync Listener
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const setupSync = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, 'users', user.uid, 'data', 'todos');
        
        // Listen for remote changes
        unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const remoteTodos = docSnap.data().items as Todo[];
                if (remoteTodos) {
                    setTodos(remoteTodos);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteTodos));
                }
            }
        });
    };

    setupSync();
    return () => unsubscribe();
  }, [auth.currentUser]);

  // 3. Save to LocalStorage & Firebase on change
  const saveTodos = async (updatedTodos: Todo[]) => {
    setTodos(updatedTodos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));

    const user = auth.currentUser;
    if (user) {
        try {
            await setDoc(doc(db, 'users', user.uid, 'data', 'todos'), {
                items: updatedTodos,
                updatedAt: Date.now()
            });
        } catch (e) {
            console.error("Firebase Todo Sync failed", e);
        }
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const updated = [...todos, { id: crypto.randomUUID(), text: newTodo.trim(), completed: false }];
      saveTodos(updated);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    saveTodos(updated);
  };

  const confirmDelete = () => {
    if (todoToDelete) {
      const updated = todos.filter(t => t.id !== todoToDelete);
      saveTodos(updated);
      setTodoToDelete(null);
    }
  };

  // Sort: Incomplete first, then completed
  const sortedTodos = [...todos].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
  });

  return (
    <>
      {/* Invisible Backdrop to close on click outside */}
      <div 
        className={`fixed inset-0 z-[1050] ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel - Slides from Left */}
      <div 
        className={`fixed inset-y-0 left-0 w-full max-w-md bg-brand-bg shadow-2xl z-[1100] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 bg-white flex items-center justify-between px-4 shrink-0 border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-brand-text font-bold text-xl">
                <ClipboardList className="w-6 h-6 text-brand-gold" />
                <span className="text-brand-accent">To Do Liste</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-brand-bg p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            <div className="flex flex-col gap-4">
                {sortedTodos.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                        <ClipboardList size={48} className="mb-4 opacity-20" />
                        <p>Keine Aufgaben vorhanden.</p>
                    </div>
                )}
                
                {sortedTodos.map((todo) => (
                    <div 
                        key={todo.id}
                        className={`group flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border transition-all duration-200 ${
                            todo.completed ? 'opacity-60 border-transparent' : 'border-gray-100 hover:shadow-md hover:border-brand-gold/30'
                        }`}
                    >
                        <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                todo.completed 
                                ? 'bg-brand-gold border-brand-gold text-white' 
                                : 'bg-white border-gray-300 hover:border-brand-gold'
                            }`}
                        >
                            {todo.completed && <Check size={16} strokeWidth={4} />}
                        </button>

                        <span 
                            className={`flex-1 text-lg transition-colors break-words ${
                                todo.completed ? 'text-gray-400 line-through' : 'text-brand-text'
                            }`}
                        >
                            {todo.text}
                        </span>

                        <button 
                            onClick={() => setTodoToDelete(todo.id)}
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 -mt-1 -mr-1"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
            <form onSubmit={handleAdd} className="flex gap-3">
                <input 
                    type="text" 
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Neue Aufgabe hinzufügen..."
                    className="flex-1 p-4 rounded-xl border border-gray-200 bg-brand-bg focus:bg-white text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all text-base"
                />
                <button 
                    type="submit"
                    disabled={!newTodo.trim()}
                    className="bg-brand-gold hover:bg-yellow-600 disabled:opacity-50 text-white p-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center"
                >
                    <Plus size={24} />
                </button>
            </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {todoToDelete && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setTodoToDelete(null)} />
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs relative z-10 shadow-2xl animate-fade-in">
                <h3 className="text-lg font-bold text-brand-text mb-2">Aufgabe löschen</h3>
                <p className="text-gray-600 mb-6 text-sm">Möchtest du diese Aufgabe wirklich löschen?</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setTodoToDelete(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                        Löschen
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};