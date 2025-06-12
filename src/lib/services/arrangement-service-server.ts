import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/types";

export type ArrangementWithDetails = Database["public"]["Tables"]["arrangements"]["Row"];

/**
 * 伺服器端版本：根據ID獲取特定的樂曲
 * @param arrangementId - 樂曲ID
 * @param userId - 可選的用戶ID，用於額外的擁有權驗證
 * @returns Promise<ArrangementWithDetails> - 返回樂曲詳細資訊
 * @throws {Error} 當樂曲不存在或獲取失敗時
 */
export async function getArrangementByIdServer(arrangementId: string, userId?: string): Promise<ArrangementWithDetails> {
  const supabase = await createClient();

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
 * 伺服器端版本：獲取特定用戶的所有樂曲
 * @param userId - 用戶ID
 * @returns Promise<ArrangementWithDetails[]> - 返回用戶的樂曲列表，按創建日期排序（最新在前）
 * @throws {Error} 當獲取樂曲失敗時
 */
export async function getUserArrangementsServer(userId: string): Promise<ArrangementWithDetails[]> {
  const supabase = await createClient();

  const { data: arrangements, error } = await supabase.from("arrangements").select("*").eq("owner_id", userId).order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user arrangements: ${error.message}`);
  }

  return arrangements || [];
}
