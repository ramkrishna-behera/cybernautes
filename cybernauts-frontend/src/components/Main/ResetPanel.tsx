import React from "react";
import { useAppState } from "../../context/useAppState";

interface ResetPanelProps {
  graphRef: React.RefObject<{ refreshGraph: () => void } | null>;
}

export default function ResetPanel({ graphRef }: ResetPanelProps) {
  const { undo, redo, canUndo, canRedo } = useAppState();

  const handleRefresh = () => {
    graphRef.current?.refreshGraph();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#1e293b",
        padding: "8px 12px",
        borderRadius: 6,
      }}
    >
      <div>
        <button
          onClick={undo}
          disabled={!canUndo}
          style={{
            background: canUndo ? "#2563eb" : "#334155",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            marginRight: 8,
            cursor: canUndo ? "pointer" : "not-allowed",
          }}
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          style={{
            background: canRedo ? "#2563eb" : "#334155",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: canRedo ? "pointer" : "not-allowed",
          }}
        >
          Redo
        </button>
      </div>

      <button
        onClick={handleRefresh}
        style={{
          background: "#059669",
          color: "#fff",
          border: "none",
          padding: "6px 12px",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Refresh Graph
      </button>
    </div>
  );
}
