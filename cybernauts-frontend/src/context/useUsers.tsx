// src/hooks/useUsers.tsx
import { useContext } from "react";
import { UserContext } from "./UserContext";
import type { UserContextType } from "./types";

export const useUsers = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUsers must be used within a UserProvider");
  return context;
};
