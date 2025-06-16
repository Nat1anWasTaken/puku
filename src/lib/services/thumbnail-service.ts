"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Generates a JPEG preview image from a PDF file stored in Supabase Storage.
 *
 * This function creates a signed URL for the specified PDF file, then calls an external
 * API to generate a JPEG thumbnail of the specified page (default is the first page).
 * The pageNumber parameter is zero-based (0-indexed), meaning page 0 is the first page of the PDF.
 * The resulting image is returned as a Buffer.
 *
 * @param filePath - The storage path of the PDF file in the "arrangements" bucket.
 * @param pageNumber - The zero-based (0-indexed) page number to generate the preview from (default: 0).
 * @returns Promise<Buffer> - The generated JPEG image as a Buffer.
 * @throws {Error} If the signed URL cannot be generated, the external API call fails, or the resulting buffer is empty.
 */
export async function generatePreviewImage(filePath: string, pageNumber: number = 0): Promise<Buffer> {
  const supabase = await createServiceRoleClient();

  const { data, error } = await supabase.storage.from("arrangements").createSignedUrl(filePath, 60 * 60);

  if (error) {
    throw new Error(`生成簽名 URL 失敗: ${error.message}`);
  }

  const response = await fetch("https://api.kremilly.com/pdfthumb?pdf=" + encodeURIComponent(data.signedUrl) + "&page=" + pageNumber);

  if (!response.ok) {
    throw new Error(`MyApis PDFThumb API error: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (!buffer || buffer.length === 0) {
    throw new Error("Generated thumbnail buffer is empty");
  }

  return buffer;
}

/**
 * Generates and uploads a thumbnail for an arrangement
 * @param arrangementId - The arrangement ID to generate thumbnail for
 * @param filePath - The storage path of the PDF file
 * @returns Promise<{thumbnailBuffer: Buffer, previewPath: string}> - Returns the thumbnail buffer and storage path
 * @throws {Error} When PDF download, thumbnail generation, or upload fails
 * @description Downloads PDF from storage, generates thumbnail from first page, and uploads to thumbnails bucket
 */
export async function generateAndUploadArrangementThumbnail(arrangementId: string, filePath: string): Promise<{ thumbnailBuffer: Buffer; previewPath: string }> {
  const supabase = await createServiceRoleClient();

  // 生成縮圖
  const thumbnailBuffer = await generatePreviewImage(filePath);

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

/**
 * Generates and uploads a thumbnail for a part using PDF buffer from React Query cache
 * @param partId - The part ID to generate thumbnail for
 * @param pdfBuffer - The PDF file as ArrayBuffer (from React Query cache)
 * @param startPage - The start page of the part (1-based)
 * @returns Promise<{thumbnailBuffer: Buffer, previewPath: string}> - Returns the thumbnail buffer and storage path
 * @throws {Error} When thumbnail generation or upload fails
 * @description Generates thumbnail from the start page of a part and uploads to thumbnails bucket
 */
export async function generateAndUploadPartThumbnail(partId: string, filePath: string, startPage: number): Promise<{ thumbnailBuffer: Buffer; previewPath: string }> {
  const supabase = await createServiceRoleClient();

  const thumbnailBuffer = await generatePreviewImage(filePath, startPage - 1);

  const previewPath = `thumbnails/${partId}.jpg`;

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
