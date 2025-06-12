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

export async function getUserArrangements(userId: string): Promise<ArrangementWithDetails[]> {
  const supabase = createClient();

  const { data: arrangements, error } = await supabase.from("arrangements").select("*").eq("owner_id", userId).order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user arrangements: ${error.message}`);
  }

  return arrangements || [];
}

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

export async function deleteArrangement(arrangementId: string, userId: string): Promise<void> {
  const supabase = createClient();

  // First get the arrangement to get file paths for cleanup
  const { data: arrangement, error: fetchError } = await supabase.from("arrangements").select("file_path, preview_path").eq("id", arrangementId).eq("owner_id", userId).single();

  if (fetchError) {
    throw new Error(`Failed to fetch arrangement for deletion: ${fetchError.message}`);
  }

  // Delete the arrangement record
  const { error: deleteError } = await supabase.from("arrangements").delete().eq("id", arrangementId).eq("owner_id", userId);

  if (deleteError) {
    throw new Error(`Failed to delete arrangement: ${deleteError.message}`);
  }

  // Clean up files in storage (ignore errors as the main record is already deleted)
  if (arrangement.file_path) {
    await supabase.storage.from("arrangements").remove([arrangement.file_path]);
  }
  if (arrangement.preview_path) {
    await supabase.storage.from("thumbnails").remove([arrangement.preview_path]);
  }
}

export async function updateArrangementFilePath(arrangementId: string, filePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("arrangements").update({ file_path: filePath }).eq("id", arrangementId);

  if (error) {
    throw new Error(`Failed to update arrangement file path: ${error.message}`);
  }
}

export async function updateArrangementPreviewPath(arrangementId: string, previewPath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("arrangements").update({ preview_path: previewPath }).eq("id", arrangementId);

  if (error) {
    throw new Error(`Failed to update arrangement preview path: ${error.message}`);
  }
}
