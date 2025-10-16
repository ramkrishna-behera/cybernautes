import { supabase } from "../config/db";
import { computePopularityScore } from "./userService";

/**
 * Returns a graph representation of users and friendships.
 * - Nodes represent users
 * - Edges represent mutual friendships
 */
export async function getGraph() {
  // Fetch all users with friends
  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, friends");

  if (error) throw error;

  if (!users) return { nodes: [], edges: [] };

  // Create nodes
  const nodes = users.map((user) => ({
    id: user.id,
    label: user.username,
  }));

  // Create edges (avoid circular duplicates)
  const edges: { id: string; source: string; target: string }[] = [];

  const seenPairs = new Set<string>();

  users.forEach((user) => {
    if (!user.friends || user.friends.length === 0) return;

    user.friends.forEach((friendId: string) => {
      // Generate a unique sorted pair key to prevent circular duplicates
      const pairKey =
        user.id < friendId
          ? `${user.id}-${friendId}`
          : `${friendId}-${user.id}`;

      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey);
        edges.push({
          id: `edge-${pairKey}`,
          source: user.id,
          target: friendId,
        });
      }
    });
  });

  return { nodes, edges };
}



export async function recomputeAllPopularityScores() {
  const { data: users, error } = await supabase.from("users").select("*");
  if (error) throw error;

  for (const user of users) {
    const newScore = await computePopularityScore(
      user.id,
      user.hobbies,
      user.friends || []
    );

    const { error: updateError } = await supabase
      .from("users")
      .update({ popularity_score: newScore })
      .eq("id", user.id);

    if (updateError) throw updateError;
  }

  return { message: `Recomputed popularity for ${users.length} users.` };
}
