import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

export type Part = Database["public"]["Tables"]["parts"]["Row"];

/**
 * 伺服器端版本：獲取特定編曲的所有聲部
 * @param arrangementId - 編曲ID
 * @returns Promise<Part[]> - 返回聲部列表，按開始頁面排序
 * @throws {Error} 當獲取聲部失敗時
 */
export async function getPartsByArrangementIdServer(arrangementId: string): Promise<Part[]> {
  const supabase = await createClient();

  const { data: parts, error } = await supabase.from("parts").select("*").eq("arrangement_id", arrangementId).order("start_page", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch parts: ${error.message}`);
  }

  return parts || [];
}

export async function updatePartPreviewPath(partId: string, previewPath: string): Promise<void> {
  const supabase = await createServiceRoleClient();

  const { error } = await supabase.from("parts").update({ preview_path: previewPath }).eq("id", partId);

  if (error) {
    throw new Error(`Failed to update part preview path: ${error.message}`);
  }
}
