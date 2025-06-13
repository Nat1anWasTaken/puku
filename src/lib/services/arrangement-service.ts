import { createClient } from "@/lib/supabase/client";
import { Database, Tables, TablesInsert } from "@/lib/supabase/types";

export type CreateArrangementData = {
  title: string;
  composers: string[];
  ensembleType: string;
  ownerId: string;
};

export type UpdateArrangementData = {
  title?: string;
  composers?: string[];
  ensemble_type?: Database["public"]["Enums"]["ensemble_type"];
  file_path?: string;
  preview_path?: string;
  visibility?: Database["public"]["Enums"]["visibility"];
};

export async function createArrangement(data: CreateArrangementData): Promise<string> {
  const supabase = createClient();

  // Debug: 記錄輸入資料
  console.log("createArrangement called with data:", data);

  // 驗證必要欄位
  if (!data.title || !data.ownerId) {
    throw new Error("標題和擁有者 ID 為必填項目");
  }

  // 驗證 ownerId 是否為有效的 UUID 格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(data.ownerId)) {
    console.error("無效的擁有者 ID 格式：", data.ownerId);
    throw new Error(`無效的擁有者 ID 格式：${data.ownerId}。預期為 UUID 格式。`);
  }

  const arrangementData: TablesInsert<"arrangements"> = {
    title: data.title,
    composers: data.composers,
    ensemble_type: data.ensembleType as Database["public"]["Enums"]["ensemble_type"],
    owner_id: data.ownerId,
    file_path: null // Initialize as null, will be updated later
  };

  console.log("Inserting arrangement data:", arrangementData);

  // 嘗試更明確的插入方式
  const { data: arrangement, error } = await supabase
    .from("arrangements")
    .insert({
      title: data.title,
      composers: data.composers,
      ensemble_type: data.ensembleType as Database["public"]["Enums"]["ensemble_type"],
      owner_id: data.ownerId,
      file_path: null
    })
    .select("id")
    .single();

  if (error) {
    console.error("Database error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    console.error("Attempted to insert data:", arrangementData);
    throw new Error(`Failed to create arrangement: ${error.message}`);
  }

  console.log("Arrangement created successfully:", arrangement);
  return arrangement.id;
}

export async function updateArrangement(arrangementId: string, data: UpdateArrangementData): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("arrangements").update(data).eq("id", arrangementId);

  if (error) {
    throw new Error(`Failed to update arrangement: ${error.message}`);
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

export async function deleteArrangement(arrangementId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("arrangements").delete().eq("id", arrangementId);

  if (error) {
    throw new Error(`Failed to delete arrangement: ${error.message}`);
  }
}

export async function getUserArrangements(ownerId: string): Promise<Tables<"arrangements">[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("arrangements").select("*").eq("owner_id", ownerId);

  if (error) {
    throw new Error(`Failed to get user arrangements: ${error.message}`);
  }

  return data;
}

export async function checkTableSchema(): Promise<void> {
  const supabase = createClient();

  console.log("Checking arrangements table schema...");

  // 嘗試查詢表的結構信息
  const { error } = await supabase.from("arrangements").select("*").limit(0);

  if (error) {
    console.error("Schema check error:", error);
  } else {
    console.log("Schema check successful - table exists");
  }

  // 嘗試一個最小的查詢來看看表是否可訪問
  const { data: countData, error: countError } = await supabase.from("arrangements").select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Count query error:", countError);
  } else {
    console.log("Table accessible, current record count:", countData);
  }
}
