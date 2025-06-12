import { createClient } from "@/lib/supabase/client";
import { Database, TablesInsert } from "@/lib/supabase/types";

export type CreateArrangementData = {
  title: string;
  composers: string[];
  ensembleType: string;
  ownerId: string;
};

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
