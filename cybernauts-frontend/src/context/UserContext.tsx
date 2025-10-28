// src/context/UserContext.tsx
import React, { createContext, useState, useCallback, type ReactNode } from "react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import type { UserContextType, User } from "./types";

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const baseURL = import.meta.env.VITE_API_URL;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ users: User[] } | User[]>(`${baseURL}/api/users`);
      const payload: User[] = Array.isArray(res.data) ? res.data : res.data.users ?? [];
      setUsers(payload);
    } catch (err: unknown) {
      console.error("fetchUsers error:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  const createUser = useCallback(
    async (payload: { username: string; age: number; hobbies: string[] }) => {
      try {
        setLoading(true);
        await axios.post(`${baseURL}/api/users`, payload); // ✅ fixed
        toast.success("User created");
        await fetchUsers();
        window.dispatchEvent(new Event("graph-refresh"));
      } catch (err: unknown) {
        console.error("createUser error:", err);
        const axiosErr = err as AxiosError<{ error: string }>;
        toast.error(axiosErr.response?.data?.error ?? "Failed to create user");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers, baseURL]
  );

  const updateUser = useCallback(
    async (id: string, payload: { username?: string; age?: number; hobbies?: string[] }) => {
      try {
        setLoading(true);
        try {
          await axios.put(`${baseURL}/api/users/${id}`, payload); // ✅ fixed
        } catch {
          await axios.post(`${baseURL}/api/users/${id}`, payload); // ✅ fixed fallback
        }
        toast.success("User updated");
        await fetchUsers();
        window.dispatchEvent(new Event("graph-refresh"));
      } catch (err: unknown) {
        console.error("updateUser error:", err);
        const axiosErr = err as AxiosError<{ error: string }>;
        toast.error(axiosErr.response?.data?.error ?? "Failed to update user");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers, baseURL]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await axios.delete(`${baseURL}/api/users/${id}`); // ✅ fixed
        toast.success("User deleted");
        await fetchUsers();
        window.dispatchEvent(new Event("graph-refresh"));
      } catch (err: unknown) {
        console.error("deleteUser error:", err);
        const axiosErr = err as AxiosError;
        if (axiosErr.response?.status === 409) {
          toast.error("Cannot delete: user still connected. Unlink first.");
        } else {
          toast.error("Failed to delete user");
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUsers, baseURL]
  );

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
