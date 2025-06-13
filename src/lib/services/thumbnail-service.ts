"use server";

import { createClient } from "@/lib/supabase/server";
import pdf from "pdf-thumbnail";

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
 * Generates a JPEG preview image from a PDF buffer for a specific page
 * @param pdfBuffer - The PDF file as ArrayBuffer
 * @param pageNumber - The page number to generate thumbnail for (1-based)
 * @returns Promise<Buffer> - Returns the generated JPEG image as a Buffer
 * @throws {Error} When PDF processing or image generation fails
 * @description Extracts a specific page from PDF and generates thumbnail using pdf-lib and pdf-thumbnail
 */
export async function generatePreviewImageFromPage(pdfBuffer: ArrayBuffer, pageNumber: number): Promise<Buffer> {
  // 動態導入 pdf-lib 來提取特定頁面
  const { PDFDocument } = await import("pdf-lib");

  // 載入 PDF 文檔
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  // 檢查頁碼是否有效
  if (pageNumber < 1 || pageNumber > pdfDoc.getPageCount()) {
    throw new Error(`無效的頁碼: ${pageNumber}. PDF 共有 ${pdfDoc.getPageCount()} 頁`);
  }

  // 創建新的 PDF 文檔，只包含指定頁面
  const newPdfDoc = await PDFDocument.create();
  const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]); // pdf-lib 使用 0-based 索引
  newPdfDoc.addPage(copiedPage);

  // 將單頁 PDF 轉換為 Buffer
  const singlePagePdfBytes = await newPdfDoc.save();
  const singlePagePdfBuffer = Buffer.from(singlePagePdfBytes);

  // 使用現有的 generatePreviewImage 函數生成縮圖
  return await generatePreviewImage(singlePagePdfBuffer);
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

/**
 * Generates and uploads a thumbnail for a part using PDF buffer from React Query cache
 * @param partId - The part ID to generate thumbnail for
 * @param pdfBuffer - The PDF file as ArrayBuffer (from React Query cache)
 * @param startPage - The start page of the part (1-based)
 * @returns Promise<{thumbnailBuffer: Buffer, previewPath: string}> - Returns the thumbnail buffer and storage path
 * @throws {Error} When thumbnail generation or upload fails
 * @description Generates thumbnail from the start page of a part and uploads to thumbnails bucket
 */
export async function generatePartThumbnail(partId: number, pdfBuffer: ArrayBuffer, startPage: number): Promise<{ thumbnailBuffer: Buffer; previewPath: string }> {
  const supabase = await createClient();

  // 生成縮圖
  const thumbnailBuffer = await generatePreviewImageFromPage(pdfBuffer, startPage);

  // 定義縮圖路徑
  const previewPath = `thumbnails/${partId}.jpg`;

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
