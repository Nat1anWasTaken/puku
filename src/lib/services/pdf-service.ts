import { PDFDocument } from "pdf-lib";

/**
 * Merges multiple PDF files into a single PDF document
 * @param files - Array of PDF File objects to merge
 * @returns Promise<Uint8Array> - Returns the merged PDF as a Uint8Array
 * @throws {Error} When no files are provided or PDF merging fails
 * @description Combines multiple PDF files in the order provided, copying all pages from each file
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
 * Creates a File object from byte array data
 * @param bytes - The file data as Uint8Array
 * @param filename - The name for the created file
 * @param mimeType - The MIME type for the file (defaults to "application/pdf")
 * @returns File - Returns a new File object with the provided data
 * @description Utility function to create File objects from byte data, commonly used for PDF files
 */
export function createFileFromBytes(bytes: Uint8Array, filename: string, mimeType: string = "application/pdf"): File {
  return new File([bytes], filename, { type: mimeType });
}
