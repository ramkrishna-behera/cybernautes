import React, { useState, useRef, useEffect } from "react";
import { useUsers } from "../../context/useUsers";
import toast from "react-hot-toast";

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

interface UserManagementPanelProps {
  onGraphRefresh: (users?: User[]) => void;
}

export default function UserManagementPanel({ onGraphRefresh }: UserManagementPanelProps) {
  const { users, fetchUsers, createUser, updateUser, deleteUser } = useUsers();
  const [form, setForm] = useState({ username: "", age: "", hobbies: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [highlight, setHighlight] = useState(false);

  // Generic input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    if (editId && !window.confirm("Discard changes?")) return;
    setForm({ username: "", age: "", hobbies: "" });
    setEditId(null);
  };

  // Add or Update user
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim()) return toast.error("Username required");
    if (!form.age || Number.isNaN(Number(form.age))) return toast.error("Valid age required");

    const payload = {
      username: form.username.trim(),
      age: Number(form.age),
      hobbies: form.hobbies.split(",").map(s => s.trim()).filter(Boolean),
    };

    try {
      setLocalLoading(true);

      if (editId) {
        await updateUser(editId, payload);
        toast.success("User updated!");
      } else {
        await createUser(payload);
        toast.success("User added!");
      }

      resetForm();
      await fetchUsers(); // refresh users in the hook/state
      onGraphRefresh(users); // update graph with latest users from context
    } catch (err: unknown) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Edit user
  const onEdit = (u: User) => {
    setEditId(u.id);
    setForm({
      username: u.username,
      age: String(u.age),
      hobbies: Array.isArray(u.hobbies) ? u.hobbies.join(", ") : "",
    });

    // 👇 Scroll the form into view smoothly
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlight(true); // briefly highlight form
      setTimeout(() => setHighlight(false), 800);
    }, 100);
  };

  // Delete user
  const onDelete = async (id: string) => {
    if (!confirm("Delete this user? This is permanent.")) return;

    try {
      setLocalLoading(true);
      await deleteUser(id);
      if (editId === id) resetForm();

      await fetchUsers();
      onGraphRefresh(users);
      toast.success("User deleted!");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete user");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div
      ref={formRef}
      style={{
        padding: 12,
        transition: "background-color 0.4s ease",
        backgroundColor: highlight ? "#1f4cc933" : "transparent",
        borderRadius: 8,
      }}
    >
      <h4 style={{ marginBottom: 8 }}>{editId ? "Edit User" : "Add User"}</h4>

      <form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          disabled={localLoading}
          style={{ width: "100%", marginBottom: 8, padding: 6 }}
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          disabled={localLoading}
          style={{ width: "100%", marginBottom: 8, padding: 6 }}
        />
        <input
          type="text"
          name="hobbies"
          placeholder="Hobbies (comma separated)"
          value={form.hobbies}
          onChange={handleChange}
          disabled={localLoading}
          style={{ width: "100%", marginBottom: 8, padding: 6 }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            disabled={localLoading}
            style={{
              background: editId ? "#f59e0b" : "#2563eb",
              color: "white",
              border: "none",
              padding: "8px 12px",
              cursor: localLoading ? "not-allowed" : "pointer",
              borderRadius: 6,
              flex: 1,
            }}
          >
            {editId ? "Update" : "Add"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={localLoading}
              style={{
                background: "#374151",
                color: "white",
                border: "none",
                padding: "8px 12px",
                cursor: localLoading ? "not-allowed" : "pointer",
                borderRadius: 6,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h4 style={{ marginTop: 8 }}>Users</h4>

      {users.length === 0 ? (
        <p>No users found. Click "Add" to create one.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map(u => (
            <li
              key={u.id}
              style={{
                background: editId === u.id ? "#1e293b" : "#11203a",
                padding: "8px",
                marginBottom: 8,
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{u.username}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  {u.age} years • {Array.isArray(u.hobbies) ? u.hobbies.join(", ") : ""}
                </div>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => onEdit(u)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#60a5fa",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                  title="Edit"
                >
                  ✏️
                </button>

                <button
                  onClick={() => onDelete(u.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    fontSize: 16,
                  }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
