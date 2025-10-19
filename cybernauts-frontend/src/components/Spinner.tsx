// src/components/Spinner.tsx
import React from "react";

interface SpinnerProps {
  size?: number;          // diameter in px
  color?: string;         // spinner color
  thickness?: number;     // border thickness
}

const Spinner: React.FC<SpinnerProps> = ({ size = 24, color = "#2563eb", thickness = 4 }) => (
  <div style={{ textAlign: "center", padding: 16 }}>
    <div
      style={{
        border: `${thickness}px solid #f3f3f3`,
        borderTop: `${thickness}px solid ${color}`,
        borderRadius: "50%",
        width: size,
        height: size,
        animation: "spin 1s linear infinite",
        margin: "auto",
      }}
    />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Spinner;
