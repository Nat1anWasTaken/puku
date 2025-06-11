import { PDFDocument } from "pdf-lib";

export async function mergePDFFiles(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error("No PDF files provided");
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await PDFDocument.load(arrayBuffer);

      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (error) {
      throw new Error(`Failed to merge PDF files: ${file.name} - ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  const pdfBytes = await mergedPdf.save();
  return pdfBytes;
}

export function createFileFromBytes(bytes: Uint8Array, filename: string, mimeType: string = "application/pdf"): File {
  return new File([bytes], filename, { type: mimeType });
}
