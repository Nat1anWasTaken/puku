"use server";

import pdf from "pdf-thumbnail";
import { createClient } from "@/lib/supabase/server";

/**
 * Generates a JPEG preview image from a PDF buffer
 * @param pdfBuffer - The PDF file as a Buffer
 * @returns Promise<Buffer> - Returns the generated JPEG image as a Buffer
 * @throws {Error} When PDF processing or image generation fails
 * @description Converts the first page of a PDF to a compressed JPEG image with 70% quality
 */
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

/**
 * Converts a readable stream to a Buffer
 * @param stream - The readable stream to convert
 * @returns Promise<Buffer> - Returns the stream data as a Buffer
 * @throws {Error} When stream reading fails
 * @description Utility function to convert stream data to Buffer for processing
 */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (error) => reject(error));
  });
}

/**
 * Generates and uploads a thumbnail for an arrangement
 * @param arrangementId - The arrangement ID to generate thumbnail for
 * @param filePath - The storage path of the PDF file
 * @returns Promise<{thumbnailBuffer: Buffer, previewPath: string}> - Returns the thumbnail buffer and storage path
 * @throws {Error} When PDF download, thumbnail generation, or upload fails
 * @description Downloads PDF from storage, generates thumbnail from first page, and uploads to thumbnails bucket
 */
export async function generateThumbnail(arrangementId: string, filePath: string): Promise<{ thumbnailBuffer: Buffer; previewPath: string }> {
  const supabase = await createClient();

  // 從儲存空間下載 PDF 文件
  const { data: pdfData, error: downloadError } = await supabase.storage.from("arrangements").download(filePath);

  if (downloadError || !pdfData) {
    throw new Error(`下載 PDF 文件失敗: ${downloadError}`);
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
