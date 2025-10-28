import React, {
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type ReactFlowInstance,
} from "reactflow";
import type { Node, Edge, Connection } from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import dagre from "dagre";
import Spinner from "../Spinner";

interface GraphResponse {
  nodes: { id: string; label: string; age: number; popularity: number }[];
  edges: { id: string; source: string; target: string }[];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 120;
const nodeHeight = 80;

// Popularity Heatmap Color
const getPopularityColor = (popularity: number) => {
  const min = 0;
  const max = 15;
  const clamped = Math.min(Math.max(popularity, min), max);
  const ratio = (clamped - min) / (max - min);
  const r = Math.floor(255 * ratio);
  const g = Math.floor(200 * (1 - Math.abs(ratio - 0.5) * 2));
  const b = Math.floor(255 * (1 - ratio));
  return `rgb(${r}, ${g}, ${b})`;
};

// Layout nodes with Dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({
    rankdir: "LR",
    align: "UL",
    nodesep: 50,
    ranksep: 100,
  });

  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const position = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: position.x - nodeWidth / 2,
        y: position.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const GraphView = forwardRef((_, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const baseURL = import.meta.env.VITE_API_URL;

  // Fetch graph data
  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<GraphResponse>(`${baseURL}/api/graph`);
      const { nodes: rawNodes, edges: rawEdges } = res.data;

      const styledNodes: Node[] = rawNodes.map((user) => {
        const baseColor = getPopularityColor(user.popularity);
        const nodeSize = 60 + user.popularity * 2;

        return {
          id: user.id,
          data: {
            label: (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600 }}>{user.label}</div>
                <small>Age: {user.age}</small>
              </div>
            ),
          },
          position: { x: 0, y: 0 },
          draggable: true,
          style: {
            width: nodeSize,
            height: nodeSize,
            borderRadius: "50%",
            background: baseColor,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            border: "1px solid #fff",
            cursor: "grab",
            fontSize: "13px",
            textAlign: "center",
          },
        };
      });

      const styledEdges: Edge[] = rawEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
        style: { stroke: "#9ca3af", strokeWidth: 2 },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        styledNodes,
        styledEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error("Failed to load graph:", error);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges, baseURL]);

  // Expose refreshGraph
  useImperativeHandle(ref, () => ({
    refreshGraph: fetchGraph,
  }));

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Create new link
  const onConnect = useCallback(
    async (connection: Connection) => {
      try {
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              animated: true,
              style: { stroke: "#6b7280", strokeWidth: 2 },
            },
            eds
          )
        );
        await axios.post(`${baseURL}/api/users/${connection.source}/link`, {
          friendId: connection.target,
        });
        await fetchGraph();
      } catch (error) {
        console.error("Failed to save connection:", error);
      }
    },
    [fetchGraph, setEdges, baseURL]
  );

  // Delete link
  const onEdgeClick = useCallback(
    async (_: React.MouseEvent, edge: Edge) => {
      const confirmDelete = window.confirm("Remove this connection?");
      if (!confirmDelete) return;

      try {
        await axios.delete(`${baseURL}/api/users/${edge.source}/unlink`, {
          data: { friendId: edge.target },
        });
        await fetchGraph();
      } catch (error) {
        console.error("Failed to delete connection:", error);
      }
    },
    [fetchGraph, baseURL]
  );

  // Handle hobby drop (nearest node)
  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const hobby = e.dataTransfer.getData("application/x-hobby");
      if (!hobby) return;

      // Ensure we have an instance to convert coords
      const rfInstance = rfInstanceRef.current;
      if (!rfInstance) {
        console.warn("React Flow instance not ready yet.");
        return;
      }

      const bounds = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const position = rfInstance.project({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      // Find nearest node (store the id as a string to avoid type narrowing issues)
      let nearestNodeId: string | null = null;
      let minDistance = Infinity;

      nodes.forEach((node) => {
        const pos = node.position as { x: number; y: number };
        const dx = pos.x - position.x;
        const dy = pos.y - position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          nearestNodeId = node.id as string;
        }
      });

      if (!nearestNodeId) {
        console.warn("No node found near drop location.");
        return;
      }

      try {
        await axios.post(`${baseURL}/api/users/${nearestNodeId}/hobbies`, {
          hobby,
        });
        await fetchGraph();
      } catch (error) {
        console.error("Failed to add hobby:", error);
      }
    },
    [nodes, fetchGraph, baseURL]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // onInit handler to capture instance safely (avoids useReactFlow hook issues)
  const onInit = useCallback((instance: ReactFlowInstance) => {
    rfInstanceRef.current = instance;
  }, []);

  if (loading) return <Spinner />;

  return (
    <div
      style={{
        width: "100%",
        height: "85vh",
        border: "1px solid #ccc",
        borderRadius: "12px",
        margin: "20px auto",
        overflow: "hidden",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={onInit}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        nodesDraggable
        nodesConnectable
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
});

export default GraphView;
