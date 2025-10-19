import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import type { Node, Edge, Connection } from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import dagre from "dagre";

interface GraphResponse {
  nodes: { id: string; label: string; age: number; popularity: number }[];
  edges: { id: string; source: string; target: string }[];
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 120;
const nodeHeight = 80;

// Function to layout nodes using Dagre
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

// 🔹 forwardRef to expose refreshGraph to parent
const GraphView = forwardRef((_, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const baseURL = import.meta.env.VITE_API_URL;

  // 🔹 Fetch Graph from Backend
  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<GraphResponse>(`${baseURL}/api/graph`);
      const { nodes, edges } = res.data;

      const styledNodes: Node[] = nodes.map((user) => {
        const baseColor = user.popularity > 5 ? "#34d399" : "#3b82f6";
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

      const styledEdges: Edge[] = edges.map((edge) => ({
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
  }, [setNodes, setEdges]);

  // 🔹 Expose fetchGraph to parent via ref
  useImperativeHandle(ref, () => ({
    refreshGraph: fetchGraph,
  }));

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // 🔹 Handle Connection (Create New Edge)
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
    [fetchGraph, setEdges]
  );

  // 🔹 Handle Edge Click (Delete Connection)
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
    [fetchGraph]
  );

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "20px" }}>Loading graph...</p>;

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
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
