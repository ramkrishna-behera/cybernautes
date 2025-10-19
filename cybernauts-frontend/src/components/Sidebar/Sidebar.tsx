import { useState } from "react";
import SidebarHobbies from "./SidebarHobbies";
import UserManagementPanel from "./UserManagementPanel";
import { useGraph } from "../../context/useGraph";
import { useCallback } from "react";

export default function Sidebar() {
  const [tab, setTab] = useState<"hobbies" | "users">("hobbies");
  const { fetchGraph } = useGraph();
  const handleGraphRefresh = useCallback(
    () => {
      fetchGraph(); // we just trigger the graph fetch
    },
    [fetchGraph]
  );

    

  return (
    <aside
      style={{
        width: 260,
        background: "#071029",
        color: "#e6eef8",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "12px 0",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <button
          onClick={() => setTab("hobbies")}
          style={{
            background: tab === "hobbies" ? "#1d3a6e" : "transparent",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: 6,
          }}
        >
          Hobbies
        </button>
        <button
          onClick={() => setTab("users")}
          style={{
            background: tab === "users" ? "#1d3a6e" : "transparent",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: 6,
          }}
        >
          Users
        </button>
      </div>

      <div style={{ flexGrow: 1, overflowY: "auto" }}>
        {tab === "hobbies" ? (
          <SidebarHobbies />
        ) : (
          <UserManagementPanel onGraphRefresh={handleGraphRefresh} />
        )}
      </div>
    </aside>
  );
}
