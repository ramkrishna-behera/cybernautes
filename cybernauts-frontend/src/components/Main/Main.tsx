import { useRef } from "react";
import GraphView from "./GraphView";
import ResetPanel from "./ResetPanel";

export default function Main() {
  // Ref to access GraphView’s exposed refreshGraph method
  const graphRef = useRef<{ refreshGraph: () => void } | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Control buttons */}
      <ResetPanel graphRef={graphRef} />

      {/* Graph display */}
      <div style={{ flexGrow: 1, marginTop: 8 }}>
        <GraphView ref={graphRef} />
      </div>
    </div>
  );
}
