import { Router, Request, Response } from "express";
import { supabase } from "../config/db";
import { createUser, updateUser } from "../services/userService";
import { addFriend, removeFriend } from "../services/userService";
import { deleteUser } from "../services/userService";

const router = Router();

// GET all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    res.json({ users: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, age, hobbies } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username is required and must be a string." });
    }
    if (!age || typeof age !== "number" || age <= 0) {
      return res.status(400).json({ error: "Age is required and must be a positive number." });
    }
    if (!Array.isArray(hobbies)) {
      return res.status(400).json({ error: "Hobbies must be an array of strings." });
    }

    const user = await createUser({ username, age, hobbies });
    res.status(201).json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 🆕 PUT update user
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validation for updates
    if (updates.username && typeof updates.username !== "string") {
      return res.status(400).json({ error: "Username must be a string." });
    }
    if (updates.age && (typeof updates.age !== "number" || updates.age <= 0)) {
      return res.status(400).json({ error: "Age must be a positive number." });
    }
    if (updates.hobbies && !Array.isArray(updates.hobbies)) {
      return res.status(400).json({ error: "Hobbies must be an array of strings." });
    }

    const user = await updateUser(id, updates);
    res.status(200).json({ user });
  } catch (err: any) {
    if (err.message.includes("not found")) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});



// POST /api/users/:id/link
router.post("/:id/link", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ error: "friendId is required" });

    const result = await addFriend(id, friendId);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes("already exists")) {
      res.status(409).json({ error: err.message });
    } else if (err.message.includes("not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE /api/users/:id/unlink
router.delete("/:id/unlink", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ error: "friendId is required" });

    const result = await removeFriend(id, friendId);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes("not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUser(id);
    res.status(200).json({ message: "User deleted successfully", user: deletedUser });
  } catch (err: any) {
    if (err.message.includes("still connected")) {
      res.status(409).json({ error: err.message });
    } else if (err.message.includes("not found")) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});



// 🆕 POST /api/users/:id/hobbies — add a hobby to a user
router.post("/:id/hobbies", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hobby } = req.body;

    if (!hobby || typeof hobby !== "string") {
      return res.status(400).json({ error: "Hobby must be a non-empty string." });
    }

    // Fetch existing user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("hobbies")
      .eq("id", id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Merge hobby (avoid duplicates)
    const existingHobbies: string[] = userData.hobbies || [];
    const updatedHobbies = Array.from(new Set([...existingHobbies, hobby]));

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ hobbies: updatedHobbies })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      message: `Hobby "${hobby}" added successfully.`,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("Error adding hobby:", err);
    res.status(500).json({ error: err.message });
  }
});




export default router;
