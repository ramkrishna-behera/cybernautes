// src/components/Sidebar/SidebarHobbies.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../Spinner"; 
import type { User } from "../../context/types";

interface Props {
  className?: string;
}

export default function SidebarHobbies({ className }: Props) {
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/users`);
        const users = res.data.users || [];
        const setUnique = new Set<string>();

        users.forEach((u: User) => {
          (u.hobbies || []).forEach((h: string) => setUnique.add(h));
        });

        setHobbies(Array.from(setUnique).sort());
      } catch (err) {
        console.error("Failed to load hobbies:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <aside
      className={className}
      style={{
        width: 220,
        padding: 12,
        borderRight: "1px solid rgba(255,255,255,0.04)",
        background: "#071029",
        color: "#e6eef8",
        overflow: "auto",
      }}
    >
      <h4 style={{ margin: "6px 0 12px" }}>Hobbies</h4>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80px",
          }}
        >
          <Spinner /> {/* ✅ Show spinner while loading */}
        </div>
      ) : hobbies.length === 0 ? (
        <p style={{ color: "#9ca3af", fontSize: 14 }}>No hobbies found</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {hobbies.map((h) => (
            <div
              key={h}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/x-hobby", h);
                e.dataTransfer.effectAllowed = "copy";
              }}
              style={{
                padding: "6px 10px",
                background: "#11203a",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 8,
                cursor: "grab",
                fontSize: 13,
                userSelect: "none",
              }}
              title={`Drag "${h}" onto a user`}
            >
              {h}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
