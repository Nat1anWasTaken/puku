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
