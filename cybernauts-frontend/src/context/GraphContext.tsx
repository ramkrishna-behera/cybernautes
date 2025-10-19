import React, { createContext, useState } from "react";
import type { ReactNode } from "react";

type UserNode = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  popularityScore: number;
};

type GraphData = {
  nodes: UserNode[];
  edges: { id: string; source: string; target: string }[];
};

type GraphContextType = {
  graph: GraphData;
  setGraph: React.Dispatch<React.SetStateAction<GraphData>>;
  fetchGraph: () => void;
};

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [graph, setGraph] = useState<GraphData>({ nodes: [], edges: [] });

  const fetchGraph = () => {
    // ✅ Dummy static data for now
    setGraph({
      nodes: [
        {
          id: "1",
          username: "Alice",
          age: 25,
          hobbies: ["reading", "gaming"],
          friends: ["2"],
          popularityScore: 4,
        },
        {
          id: "2",
          username: "Bob",
          age: 27,
          hobbies: ["music"],
          friends: ["1"],
          popularityScore: 3,
        },
      ],
      edges: [{ id: "e1-2", source: "1", target: "2" }],
    });
  };

  return (
    <GraphContext.Provider value={{ graph, setGraph, fetchGraph }}>
      {children}
    </GraphContext.Provider>
  );
};

export { GraphContext };

