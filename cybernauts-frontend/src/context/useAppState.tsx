import { useContext } from "react";
import { AppStateContext } from "./AppStateContext";

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
};
