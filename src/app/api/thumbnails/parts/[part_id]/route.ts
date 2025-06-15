import { updatePartPreviewPath } from "@/lib/services/part-service";
import { downloadPDFBufferServer } from "@/lib/services/pdf-service";
import { generateAndUploadPartThumbnail } from "@/lib/services/thumbnail-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    part_id: string; // 現在為 uuid
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { part_id } = await context.params;

    if (!part_id) {
      return NextResponse.json({ error: "缺少聲部 ID" }, { status: 400 });
    }

    // 驗證用戶權限
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "用戶未登入" }, { status: 401 });
    }

    // 以 uuid 查詢聲部資訊和相關編曲資訊
    const { data: part, error: fetchError } = await supabase
      .from("parts")
      .select(
        `
        id,
        start_page,
        end_page,
        label,
        preview_path,
        arrangement_id,
        arrangements(
          id,
          file_path,
          owner_id
        )
      `
      )
      .eq("id", part_id)
      .single();

    if (fetchError || !part) {
      return NextResponse.json({ error: "找不到聲部" }, { status: 404 });
    }

    // 類型斷言以修復 TypeScript 錯誤 - arrangements 是數組，取第一個元素
    const arrangement = part.arrangements as unknown as { id: string; file_path: string; owner_id: string };

    // 檢查用戶權限
    if (arrangement.owner_id !== user.id) {
      return NextResponse.json({ error: "沒有權限存取此聲部" }, { status: 403 });
    }

    // 檢查是否有 PDF 文件
    if (!arrangement.file_path) {
      return NextResponse.json({ error: "編曲沒有 PDF 文件" }, { status: 404 });
    }

    if (part.preview_path) {
      // 驗證文件是否真的存在
      try {
        const { data, error } = await supabase.storage.from("thumbnails").createSignedUrl(part.preview_path, 60 * 60); // 1 小時有效

        if (error) {
          console.error("創建簽名 URL 失敗:", error);
          return NextResponse.json({ error: "獲取縮圖失敗" }, { status: 500 });
        }

        return NextResponse.json({
          thumbnailUrl: data.signedUrl,
          previewPath: part.preview_path
        });
      } catch {}
    }

    // 生成新的縮圖
    try {
      // 從伺服器端下載 PDF buffer
      const pdfBuffer = await downloadPDFBufferServer(arrangement.file_path);

      // 生成聲部縮圖（part_id 現為 uuid）
      const { previewPath: newPreviewPath } = await generateAndUploadPartThumbnail(part_id, pdfBuffer, part.start_page);

      await updatePartPreviewPath(part_id, newPreviewPath);

      // 返回新生成的縮圖簽名 URL
      const { data, error } = await supabase.storage.from("thumbnails").createSignedUrl(newPreviewPath, 60 * 60); // 1 小時有效

      if (error) {
        console.error("創建簽名 URL 失敗:", error);
        return NextResponse.json({ error: "獲取縮圖失敗" }, { status: 500 });
      }

      return NextResponse.json({
        thumbnailUrl: data.signedUrl,
        previewPath: newPreviewPath
      });
    } catch (thumbnailError) {
      console.error("縮圖生成失敗:", thumbnailError);
      return NextResponse.json({ error: "縮圖生成失敗" }, { status: 500 });
    }
  } catch (error) {
    console.error("API 錯誤:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "內部伺服器錯誤"
      },
      { status: 500 }
    );
  }
}
