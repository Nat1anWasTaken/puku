import { updateArrangementPreviewPathWithServiceRole } from "@/lib/services/arrangement-service-server";
import { generateThumbnail } from "@/lib/services/thumbnail-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    arrangement_id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { arrangement_id } = await context.params;

    if (!arrangement_id) {
      return NextResponse.json({ error: "缺少編曲 ID" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: arrangement, error: fetchError } = await supabase.from("arrangements").select("id, file_path, preview_path, owner_id").eq("id", arrangement_id).single();

    if (fetchError || !arrangement) {
      return NextResponse.json({ error: "找不到編曲" }, { status: 404 });
    }

    // 如果已經有縮圖，返回簽名 URL
    if (arrangement.preview_path) {
      const { data, error } = await supabase.storage.from("thumbnails").createSignedUrl(arrangement.preview_path, 60 * 60); // 1 hour expiry

      if (error) {
        console.error("創建簽名 URL 失敗:", error);
        return NextResponse.json({ error: "獲取縮圖失敗" }, { status: 500 });
      }

      return NextResponse.json({
        thumbnailUrl: data.signedUrl,
        previewPath: arrangement.preview_path
      });
    }

    // 如果沒有縮圖但有檔案，生成縮圖
    if (arrangement.file_path && !arrangement.preview_path) {
      try {
        const { previewPath } = await generateThumbnail(arrangement_id, arrangement.file_path);

        // 更新編曲記錄
        await updateArrangementPreviewPathWithServiceRole(arrangement_id, previewPath);

        // 返回新生成的縮圖簽名 URL
        const { data, error } = await supabase.storage.from("thumbnails").createSignedUrl(previewPath, 60 * 60); // 1 hour expiry

        if (error) {
          console.error("創建簽名 URL 失敗:", error);
          return NextResponse.json({ error: "獲取縮圖失敗" }, { status: 500 });
        }

        return NextResponse.json({
          thumbnailUrl: data.signedUrl,
          previewPath: previewPath
        });
      } catch (thumbnailError) {
        console.error("縮圖生成失敗:", thumbnailError);
        return NextResponse.json({ error: "縮圖生成失敗" }, { status: 500 });
      }
    }

    // 沒有檔案
    return NextResponse.json({ error: "沒有可用的檔案" }, { status: 404 });
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
