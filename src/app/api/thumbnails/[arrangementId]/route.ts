import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateThumbnail } from "@/lib/services/thumbnail-service";

export async function GET(request: NextRequest, { params }: { params: { arrangementId: string } }) {
  try {
    const { arrangementId } = params;

    if (!arrangementId) {
      return NextResponse.json({ error: "缺少編曲 ID" }, { status: 400 });
    }

    const supabase = await createClient();

    // 檢查用戶是否已登入
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    // 查詢編曲記錄
    const { data: arrangement, error: fetchError } = await supabase.from("arrangements").select("id, file_path, preview_path, owner_id").eq("id", arrangementId).single();

    if (fetchError || !arrangement) {
      return NextResponse.json({ error: "找不到編曲" }, { status: 404 });
    }

    // 檢查用戶權限（只有編曲所有者可以存取）
    if (arrangement.owner_id !== user.id) {
      return NextResponse.json({ error: "沒有權限存取此編曲" }, { status: 403 });
    }

    // 如果縮圖已存在，直接返回
    if (arrangement.preview_path) {
      const { data } = supabase.storage.from("thumbnails").getPublicUrl(arrangement.preview_path);

      return NextResponse.json({
        thumbnailUrl: data.publicUrl,
        previewPath: arrangement.preview_path
      });
    }

    // 檢查是否有 PDF 文件
    if (!arrangement.file_path) {
      return NextResponse.json({ error: "編曲尚未上傳 PDF 文件" }, { status: 400 });
    }

    // 生成縮圖
    const { previewPath } = await generateThumbnail(arrangementId, arrangement.file_path);

    // 更新資料庫中的 preview_path
    const { error: updateError } = await supabase.from("arrangements").update({ preview_path: previewPath }).eq("id", arrangementId);

    if (updateError) {
      console.error("更新 preview_path 失敗:", updateError);
      return NextResponse.json({ error: "更新資料庫失敗" }, { status: 500 });
    }

    // 返回縮圖 URL
    const { data } = supabase.storage.from("thumbnails").getPublicUrl(previewPath);

    return NextResponse.json({
      thumbnailUrl: data.publicUrl,
      previewPath
    });
  } catch (error) {
    console.error("縮圖生成失敗:", error);
    return NextResponse.json({ error: "縮圖生成失敗" }, { status: 500 });
  }
}
