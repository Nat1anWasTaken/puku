"use server";

import { PDFDocument } from "pdf-lib";
import { createClient } from "../supabase/server";

/**
 * Get a PDF buffer containing a specific page range
 * @param originalPdfBuffer - The original PDF as ArrayBuffer or Uint8Array
 * @param startPage - Start page (1-based)
 * @param endPage - End page (1-based, inclusive)
 * @returns Promise<Uint8Array> - A new PDF file as Uint8Array containing only the specified page range
 * @throws {Error} If the page range is invalid or processing fails
 */
export async function getPdfBufferByPageRange(originalPdfBuffer: ArrayBuffer | Uint8Array, startPage: number, endPage: number): Promise<Uint8Array> {
  // 載入原始 PDF
  const pdfDoc = await PDFDocument.load(originalPdfBuffer);

  const totalPages = pdfDoc.getPageCount();

  if (startPage < 1 || endPage < 1 || startPage > totalPages || endPage > totalPages || startPage > endPage) {
    throw new Error(`無效的頁碼範圍: startPage=${startPage}, endPage=${endPage}, 總頁數=${totalPages}`);
  }

  // 建立新 PDF，只包含指定頁碼
  const newPdfDoc = await PDFDocument.create();
  const pageIndices = [];
  for (let i = startPage - 1; i <= endPage - 1; i++) {
    pageIndices.push(i);
  }
  const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
  copiedPages.forEach((page) => newPdfDoc.addPage(page));

  const newPdfBytes = await newPdfDoc.save();
  return newPdfBytes;
} /**
 * Downloads a PDF file from Supabase storage and returns it as ArrayBuffer (Server-side)
 * @param filePath - The storage path of the PDF file
 * @returns Promise<ArrayBuffer> - Returns the PDF file as ArrayBuffer
 * @throws {Error} When PDF download fails
 * @description Downloads PDF from storage and returns as ArrayBuffer for server-side use
 */

export async function downloadPDFBufferServer(filePath: string): Promise<ArrayBuffer> {
  const supabase = await createClient();

  try {
    // 從儲存空間下載 PDF 文件
    const { data: pdfData, error: downloadError } = await supabase.storage.from("arrangements").download(filePath);

    if (downloadError || !pdfData) {
      throw new Error(`下載 PDF 文件失敗: ${downloadError?.message}`);
    }

    // 將 Blob 轉換為 ArrayBuffer
    const arrayBuffer = await pdfData.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("下載 PDF 文件失敗:", error);
    throw error;
  }
}
