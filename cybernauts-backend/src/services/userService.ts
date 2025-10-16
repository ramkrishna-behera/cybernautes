import { supabase } from "../config/db";

export interface User {
  id?: string;
  username: string;
  age: number;
  hobbies: string[];
  friends?: string[];
  created_at?: string;
  popularity_score?: number;
}

/**
 * Compute popularity score:
 * popularityScore = number of unique friends + (total hobbies shared with friends × 0.5)
 */
export async function computePopularityScore(userId: string, hobbies: string[], friends: string[] = []): Promise<number> {
  if (friends.length === 0) return 0;

  const { data: friendData, error } = await supabase
    .from("users")
    .select("hobbies")
    .in("id", friends);

  if (error) throw error;

  let totalSharedHobbies = 0;
  friendData?.forEach(friend => {
    const shared = hobbies.filter(hobby => friend.hobbies.includes(hobby));
    totalSharedHobbies += shared.length;
  });

  return friends.length + totalSharedHobbies * 0.5;
}

/**
 * Create a new user in Supabase with computed popularity score
 */
export async function createUser(user: User) {
  const popularity_score = await computePopularityScore("", user.hobbies, []); // no friends on creation

  const { data, error } = await supabase
    .from("users")
    .insert([{ 
      username: user.username,
      age: user.age,
      hobbies: user.hobbies,
      friends: [],
      popularity_score
    }])
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Update user info and recompute popularity score
 */
export async function updateUser(id: string, updates: Partial<User>) {
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existingUser) throw new Error("User not found");

  const newHobbies = updates.hobbies ?? existingUser.hobbies;
  const newFriends = updates.friends ?? existingUser.friends;

  const popularity_score = await computePopularityScore(id, newHobbies, newFriends);

  const { data, error } = await supabase
    .from("users")
    .update({
      username: updates.username ?? existingUser.username,
      age: updates.age ?? existingUser.age,
      hobbies: newHobbies,
      friends: newFriends,
      popularity_score,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add a friend relationship between two users
 */
export async function addFriend(userId: string, friendId: string) {
  if (userId === friendId) throw new Error("Cannot friend yourself");

  // Fetch both users
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (userError || !user) throw new Error("User not found");

  const { data: friend, error: friendError } = await supabase
    .from("users")
    .select("*")
    .eq("id", friendId)
    .single();
  if (friendError || !friend) throw new Error("Friend not found");

  // Prevent duplicate/circular friendship
  if (user.friends.includes(friendId) || friend.friends.includes(userId)) {
    throw new Error("Friendship already exists");
  }

  // Update friends arrays
  const updatedUserFriends = [...user.friends, friendId];
  const updatedFriendFriends = [...friend.friends, userId];

  // Recalculate popularity scores
  const userPopularity = await computePopularityScore(userId, user.hobbies, updatedUserFriends);
  const friendPopularity = await computePopularityScore(friendId, friend.hobbies, updatedFriendFriends);

  // Update both users in DB
  await supabase.from("users").update({
    friends: updatedUserFriends,
    popularity_score: userPopularity,
  }).eq("id", userId);

  await supabase.from("users").update({
    friends: updatedFriendFriends,
    popularity_score: friendPopularity,
  }).eq("id", friendId);

  return { message: "Friendship created successfully" };
}

/**
 * Remove a friend relationship between two users
 */
export async function removeFriend(userId: string, friendId: string) {
  // Fetch both users
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (userError || !user) throw new Error("User not found");

  const { data: friend, error: friendError } = await supabase
    .from("users")
    .select("*")
    .eq("id", friendId)
    .single();
  if (friendError || !friend) throw new Error("Friend not found");

  // Remove friend IDs
  const updatedUserFriends = user.friends.filter((id: string) => id !== friendId);
  const updatedFriendFriends = friend.friends.filter((id: string) => id !== userId);

  // Recalculate popularity scores
  const userPopularity = await computePopularityScore(userId, user.hobbies, updatedUserFriends);
  const friendPopularity = await computePopularityScore(friendId, friend.hobbies, updatedFriendFriends);

  // Update both users in DB
  await supabase.from("users").update({
    friends: updatedUserFriends,
    popularity_score: userPopularity,
  }).eq("id", userId);

  await supabase.from("users").update({
    friends: updatedFriendFriends,
    popularity_score: friendPopularity,
  }).eq("id", friendId);

  return { message: "Friendship removed successfully" };
}

/**
 * Delete a user only if they have no friends
 */
export async function deleteUser(userId: string) {
  // Fetch the user
  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError || !user) throw new Error("User not found");

  // Check if user still has friends
  if (user.friends && user.friends.length > 0) {
    throw new Error("Cannot delete user while still connected to friends. Unlink first.");
  }

  // Delete user
  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

