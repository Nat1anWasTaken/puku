import { downloadPDFBuffer } from "@/lib/services/thumbnail-client";
import { generatePartThumbnail } from "@/lib/services/thumbnail-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    part_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { part_id } = await context.params;

    if (!part_id) {
      return NextResponse.json({ error: "缺少聲部 ID" }, { status: 400 });
    }

    const partId = parseInt(part_id, 10);
    if (isNaN(partId)) {
      return NextResponse.json({ error: "無效的聲部 ID" }, { status: 400 });
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

    // 獲取聲部資訊和相關編曲資訊
    const { data: part, error: fetchError } = await supabase
      .from("parts")
      .select(
        `
        id,
        start_page,
        end_page,
        label,
        arrangement_id,
        arrangements!inner (
          id,
          file_path,
          owner_id
        )
      `
      )
      .eq("id", partId)
      .single();

    if (fetchError || !part) {
      return NextResponse.json({ error: "找不到聲部" }, { status: 404 });
    }

    // 類型斷言以修復 TypeScript 錯誤 - arrangements 是數組，取第一個元素
    const arrangement = (part.arrangements as unknown[])[0] as { id: string; file_path: string; owner_id: string };

    // 檢查用戶權限
    if (arrangement.owner_id !== user.id) {
      return NextResponse.json({ error: "沒有權限存取此聲部" }, { status: 403 });
    }

    // 檢查是否有 PDF 文件
    if (!arrangement.file_path) {
      return NextResponse.json({ error: "編曲沒有 PDF 文件" }, { status: 404 });
    }

    // 檢查是否已經有縮圖
    const previewPath = `thumbnails/${partId}.jpg`;
    const { data: existingThumbnail } = await supabase.storage.from("thumbnails").createSignedUrl(previewPath, 60 * 60); // 1 hour expiry

    if (existingThumbnail?.signedUrl) {
      // 驗證文件是否真的存在
      try {
        const response = await fetch(existingThumbnail.signedUrl, { method: "HEAD" });
        if (response.ok) {
          return NextResponse.json({
            thumbnailUrl: existingThumbnail.signedUrl,
            previewPath: previewPath
          });
        }
      } catch {
        // 文件不存在，繼續生成新的縮圖
        console.log("縮圖文件不存在，將生成新的縮圖");
      }
    }

    // 生成新的縮圖
    try {
      // 從 React Query 緩存或直接下載 PDF buffer
      const pdfBuffer = await downloadPDFBuffer(arrangement.file_path);

      // 生成聲部縮圖
      const { previewPath: newPreviewPath } = await generatePartThumbnail(partId, pdfBuffer, part.start_page);

      // 返回新生成的縮圖簽名 URL
      const { data, error } = await supabase.storage.from("thumbnails").createSignedUrl(newPreviewPath, 60 * 60); // 1 hour expiry

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
