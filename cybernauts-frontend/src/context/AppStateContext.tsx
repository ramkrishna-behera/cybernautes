import React, { createContext, useState, useCallback } from "react";

// ---------------------------
// 🧠 Types
// ---------------------------
export interface AppUser {
  id: string;
  name: string;
  age: number;
  hobbies: string[];
}

export interface AppState {
  users: AppUser[];
  // later we’ll add: nodes, edges, etc.
}

interface AppStateContextType {
  state: AppState;
  setState: (fn: (prev: AppState) => AppState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// ---------------------------
// ⚙️ Context creation
// ---------------------------
const AppStateContext = createContext<AppStateContextType | null>(null);

export { AppStateContext };

// ---------------------------
// 💾 Provider
// ---------------------------
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<AppState[]>([
    { users: [] } // initial state
  ]);
  const [index, setIndex] = useState(0);

  const currentState = history[index];

  const setState = useCallback((fn: (prev: AppState) => AppState) => {
    setHistory(prev => {
      const newState = fn(prev[index]);
      const newHistory = prev.slice(0, index + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setIndex(i => i + 1);
  }, [index]);

  const undo = useCallback(() => {
    setIndex(i => (i > 0 ? i - 1 : i));
  }, []);

  const redo = useCallback(() => {
    setIndex(i => (i < history.length - 1 ? i + 1 : i));
  }, [history.length]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return (
    <AppStateContext.Provider value={{ state: currentState, setState, undo, redo, canUndo, canRedo }}>
      {children}
    </AppStateContext.Provider>
  );
};
