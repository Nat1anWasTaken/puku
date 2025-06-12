"use server";

import pdf from "pdf-thumbnail";
import { createClient } from "@/lib/supabase/server";
export async function generatePreviewImage(pdfBuffer: Buffer): Promise<Buffer> {
  const previewImageBuffer = await pdf(pdfBuffer, {
    compress: {
      type: "jpeg",
      quality: 70
    }
  });

  const buffer = await streamToBuffer(previewImageBuffer);
  return buffer;
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (error) => reject(error));
  });
}

export async function generateThumbnail(arrangementId: string, filePath: string): Promise<{ thumbnailBuffer: Buffer; previewPath: string }> {
  const supabase = await createClient();

  // 從儲存空間下載 PDF 文件
  const { data: pdfData, error: downloadError } = await supabase.storage.from("arrangements").download(filePath);

  if (downloadError || !pdfData) {
    throw new Error(`下載 PDF 文件失敗: ${downloadError?.message}`);
  }

  // 將 Blob 轉換為 Buffer
  const arrayBuffer = await pdfData.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);

  // 生成縮圖
  const thumbnailBuffer = await generatePreviewImage(pdfBuffer);

  // 定義縮圖路徑
  const previewPath = `thumbnails/${arrangementId}.jpg`;

  // 上傳縮圖到儲存空間
  const { error: uploadError } = await supabase.storage.from("thumbnails").upload(previewPath, thumbnailBuffer, {
    contentType: "image/jpeg",
    cacheControl: "3600",
    upsert: true
  });

  if (uploadError) {
    throw new Error(`上傳縮圖失敗: ${uploadError.message}`);
  }

  return {
    thumbnailBuffer,
    previewPath
  };
}
