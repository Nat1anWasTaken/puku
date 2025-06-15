"use client";

import { PDFDocument } from "pdf-lib";

/**
 * Merge multiple PDF files into a single PDF document
 * @param files - Array of PDF File objects to be merged
 * @returns Promise<Uint8Array> - Returns the merged PDF as a Uint8Array
 * @throws {Error} If no files are provided or merging fails
 */

export async function mergePDFFiles(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error("未提供 PDF 檔案");
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (error) {
      throw new Error(`合併 PDF 檔案失敗：${file.name} - ${error instanceof Error ? error.message : "未知錯誤"}`);
    }
  }

  const pdfBytes = await mergedPdf.save();
  return pdfBytes;
}

/**
 * Extract specific page range from PDF buffer and return as downloadable Uint8Array
 * @param pdfBuffer - The original PDF as ArrayBuffer
 * @param startPage - Start page (1-based)
 * @param endPage - End page (1-based, inclusive)
 * @param fileName - Optional filename for the extracted PDF
 * @returns Promise<{pdfBytes: Uint8Array, fileName: string}> - Returns the extracted PDF bytes and filename
 * @throws {Error} If the page range is invalid or processing fails
 */
export async function extractPDFPages(pdfBuffer: ArrayBuffer, startPage: number, endPage: number, fileName?: string): Promise<{ pdfBytes: Uint8Array; fileName: string }> {
  // 載入原始 PDF
  const pdfDoc = await PDFDocument.load(pdfBuffer);

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

  const pdfBytes = await newPdfDoc.save();

  // 生成文件名
  const defaultFileName = startPage === endPage ? `page-${startPage}.pdf` : `pages-${startPage}-${endPage}.pdf`;

  return {
    pdfBytes,
    fileName: fileName || defaultFileName
  };
}

/**
 * Download a file to the user's device
 * @param data - The file data as Uint8Array or Blob
 * @param fileName - The name of the file to download
 * @param mimeType - The MIME type of the file (default: application/pdf)
 */
export function downloadFile(data: Uint8Array | Blob, fileName: string, mimeType: string = "application/pdf"): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
