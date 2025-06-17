import { createClient } from "@/lib/supabase/client";
import { Database, TablesInsert, TablesUpdate } from "@/lib/supabase/types";

export type Part = Database["public"]["Tables"]["parts"]["Row"];
export type CreatePartData = {
  arrangementId: string;
  startPage: number;
  endPage: number;
  label: string;
  category?: string;
};

export type UpdatePartData = {
  startPage?: number;
  endPage?: number;
  category?: string;
};

/**
 * 獲取特定編曲的所有聲部
 * @param arrangementId - 編曲ID
 * @returns Promise<Part[]> - 返回聲部列表，按開始頁面排序
 * @throws {Error} 當獲取聲部失敗時
 */
export async function getPartsByArrangementId(arrangementId: string): Promise<Part[]> {
  const supabase = createClient();

  const { data: parts, error } = await supabase.from("parts").select("*").eq("arrangement_id", arrangementId).order("start_page", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch parts: ${error.message}`);
  }

  return parts || [];
}

/**
 * 獲取特定編曲的所有可用分類
 * @param arrangementId - 編曲ID
 * @returns Promise<string[]> - 返回分類列表，去重並排序
 * @throws {Error} 當獲取分類失敗時
 */
export async function getAvailableCategoriesByArrangementId(arrangementId: string): Promise<string[]> {
  const supabase = createClient();

  const { data: parts, error } = await supabase.from("parts").select("category").eq("arrangement_id", arrangementId).not("category", "is", null);

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  // 提取唯一的分類並排序
  const categories = Array.from(new Set(parts?.map((part) => part.category).filter(Boolean) || []));
  return categories.sort();
}

/**
 * 創建新的聲部
 * @param data - 聲部數據
 * @returns Promise<Part> - 返回創建的聲部
 * @throws {Error} 當創建聲部失敗時
 */
export async function createPart(data: CreatePartData): Promise<Part> {
  const supabase = createClient();

  const partData: TablesInsert<"parts"> = {
    arrangement_id: data.arrangementId,
    start_page: data.startPage,
    end_page: data.endPage,
    label: data.label,
    category: data.category || null
  };

  const { data: part, error } = await supabase.from("parts").insert(partData).select().single();

  if (error) {
    throw new Error(`Failed to create part: ${error.message}`);
  }

  return part;
}

/**
 * 更新聲部
 * @param partId - 聲部ID
 * @param data - 要更新的聲部數據
 * @throws {Error} 當更新聲部失敗時
 */
export async function updatePart(partId: string, data: UpdatePartData): Promise<void> {
  const supabase = createClient();

  const updateData: TablesUpdate<"parts"> = {};

  if (data.startPage !== undefined) updateData.start_page = data.startPage;
  if (data.endPage !== undefined) updateData.end_page = data.endPage;
  if (data.category !== undefined) updateData.category = data.category || null;

  const { error } = await supabase.from("parts").update(updateData).eq("id", partId);

  if (error) {
    throw new Error(`Failed to update part: ${error.message}`);
  }
}

/**
 * 更新聲部分類
 * @param partId - 聲部ID
 * @param category - 新的分類（可為空字符串或null）
 * @throws {Error} 當更新分類失敗時
 */
export async function updatePartCategory(partId: string, category: string | null): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("parts").update({ category }).eq("id", partId);

  if (error) {
    throw new Error(`Failed to update part category: ${error.message}`);
  }
}

/**
 * 刪除聲部
 * @param partId - 聲部ID
 * @throws {Error} 當刪除聲部失敗時
 */
export async function deletePart(partId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("parts").delete().eq("id", partId);

  if (error) {
    throw new Error(`Failed to delete part: ${error.message}`);
  }
}

/**
 * 獲取 PDF 的總頁數
 * @param filePath - PDF 文件路徑
 * @returns Promise<number> - 返回總頁數
 * @throws {Error} 當獲取頁數失敗時
 */
export async function getPDFPageCount(filePath: string): Promise<number> {
  const supabase = createClient();

  try {
    // 從儲存空間下載 PDF 文件
    const { data: pdfData, error: downloadError } = await supabase.storage.from("arrangements").download(filePath);

    if (downloadError || !pdfData) {
      throw new Error(`下載 PDF 文件失敗: ${downloadError?.message}`);
    }

    // 動態導入 pdf-lib 以避免服務端渲染問題
    const { PDFDocument } = await import("pdf-lib");

    // 將 Blob 轉換為 ArrayBuffer
    const arrayBuffer = await pdfData.arrayBuffer();

    // 載入 PDF 文檔
    const pdf = await PDFDocument.load(arrayBuffer);

    // 返回頁數
    return pdf.getPageCount();
  } catch (error) {
    throw new Error(`獲取 PDF 頁數失敗: ${error instanceof Error ? error.message : "未知錯誤"}`);
  }
}
