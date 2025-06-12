import { createClient } from "@/lib/supabase/client";
import { Database, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type CreateArrangementData = {
  title: string;
  composers: string[];
  ensembleType: string;
  ownerId: string;
};

export type UpdateArrangementData = {
  title?: string;
  composers?: string[];
  ensembleType?: string;
  visibility?: Database["public"]["Enums"]["visibility"];
};

export type ArrangementWithDetails = Database["public"]["Tables"]["arrangements"]["Row"];

/**
 * Creates a new arrangement record in the database
 * @param data - Arrangement data including title, composers, ensemble type, and owner ID
 * @returns Promise<string> - Returns the ID of the newly created arrangement
 * @throws {Error} When arrangement creation fails
 */
export async function createArrangement(data: CreateArrangementData): Promise<string> {
  const supabase = createClient();

  const arrangementData: TablesInsert<"arrangements"> = {
    title: data.title,
    composers: data.composers,
    ensemble_type: data.ensembleType as Database["public"]["Enums"]["ensemble_type"],
    owner_id: data.ownerId,
    file_path: null // Initialize as null, will be updated later
  };

  const { data: arrangement, error } = await supabase.from("arrangements").insert(arrangementData).select("id").single();

  if (error) {
    throw new Error(`Failed to create arrangement: ${error.message}`);
  }

  return arrangement.id;
}

/**
 * Retrieves all arrangements owned by a specific user
 * @param userId - The user ID to fetch arrangements for
 * @returns Promise<ArrangementWithDetails[]> - Returns a list of user's arrangements ordered by creation date (newest first)
 * @throws {Error} When fetching arrangements fails
 */
export async function getUserArrangements(userId: string): Promise<ArrangementWithDetails[]> {
  const supabase = createClient();

  const { data: arrangements, error } = await supabase.from("arrangements").select("*").eq("owner_id", userId).order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user arrangements: ${error.message}`);
  }

  return arrangements || [];
}

/**
 * Retrieves a specific arrangement by its ID
 * @param arrangementId - The arrangement ID to fetch
 * @param userId - Optional user ID for additional ownership verification
 * @returns Promise<ArrangementWithDetails> - Returns the arrangement details
 * @throws {Error} When arrangement doesn't exist or fetch fails
 */
export async function getArrangementById(arrangementId: string, userId?: string): Promise<ArrangementWithDetails> {
  const supabase = createClient();

  let query = supabase.from("arrangements").select("*").eq("id", arrangementId);

  if (userId) {
    query = query.eq("owner_id", userId);
  }

  const { data: arrangement, error } = await query.single();

  if (error) {
    throw new Error(`Failed to fetch arrangement: ${error.message}`);
  }

  return arrangement;
}

/**
 * Updates an existing arrangement record
 * @param arrangementId - The arrangement ID to update
 * @param userId - User ID for ownership verification
 * @param data - Partial arrangement data to update
 * @throws {Error} When update fails or user lacks permission
 */
export async function updateArrangement(arrangementId: string, userId: string, data: UpdateArrangementData): Promise<void> {
  const supabase = createClient();

  const updateData: TablesUpdate<"arrangements"> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.composers !== undefined) updateData.composers = data.composers;
  if (data.ensembleType !== undefined) updateData.ensemble_type = data.ensembleType as Database["public"]["Enums"]["ensemble_type"];
  if (data.visibility !== undefined) updateData.visibility = data.visibility;

  const { error } = await supabase.from("arrangements").update(updateData).eq("id", arrangementId).eq("owner_id", userId);

  if (error) {
    throw new Error(`Failed to update arrangement: ${error.message}`);
  }
}

/**
 * Deletes an arrangement record and its associated files
 * @param arrangementId - The arrangement ID to delete
 * @param userId - User ID for ownership verification
 * @throws {Error} When deletion fails or user lacks permission
 * @description Also cleans up associated files from storage (arrangement PDF and thumbnail)
 */
export async function deleteArrangement(arrangementId: string, userId: string): Promise<void> {
  const supabase = createClient();

  // First get the arrangement to get file paths for cleanup
  const { error: fetchError } = await supabase.from("arrangements").select("file_path, preview_path").eq("id", arrangementId).eq("owner_id", userId).single();

  if (fetchError) {
    throw new Error(`Failed to fetch arrangement for deletion: ${fetchError.message}`);
  }

  // Delete the arrangement record
  const { error: deleteError } = await supabase.from("arrangements").delete().eq("id", arrangementId).eq("owner_id", userId);

  if (deleteError) {
    throw new Error(`Failed to delete arrangement: ${deleteError.message}`);
  }

  // We don't have to delete the arrangement and thumbnail files here, the deletion will be handled by the database functions.
}

/**
 * Updates the file path for an arrangement
 * @param arrangementId - The arrangement ID to update
 * @param filePath - The new file path to set
 * @throws {Error} When update fails
 * @description Typically called after file upload completion to link arrangement record with actual file
 */
export async function updateArrangementFilePath(arrangementId: string, filePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("arrangements").update({ file_path: filePath }).eq("id", arrangementId);

  if (error) {
    throw new Error(`Failed to update arrangement file path: ${error.message}`);
  }
}

/**
 * Updates the preview/thumbnail path for an arrangement
 * @param arrangementId - The arrangement ID to update
 * @param previewPath - The new preview/thumbnail path to set
 * @throws {Error} When update fails
 * @description Typically called after thumbnail generation to link arrangement record with thumbnail file
 */
export async function updateArrangementPreviewPath(arrangementId: string, previewPath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("arrangements").update({ preview_path: previewPath }).eq("id", arrangementId);

  if (error) {
    throw new Error(`Failed to update arrangement preview path: ${error.message}`);
  }
}
