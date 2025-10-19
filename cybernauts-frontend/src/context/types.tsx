// src/context/types.ts
export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends?: string[];
  created_at?: string;
  popularity_score?: number | null;
}

export interface UserContextType {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  createUser: (payload: { username: string; age: number; hobbies: string[] }) => Promise<void>;
  updateUser: (id: string, payload: { username?: string; age?: number; hobbies?: string[] }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}
