"use client";

import { createClient } from "@/lib/supabase/client";

export interface ThumbnailResult {
  thumbnailUrl: string | null;
  previewPath: string | null;
}

/**
 * Generates a thumbnail for a specific page of a PDF
 * @param pdfBuffer - The PDF file as ArrayBuffer
 * @param pageNumber - The page number to generate thumbnail for (1-based)
 * @returns Promise<string> - Returns the thumbnail as a data URL
 * @throws {Error} When PDF processing or thumbnail generation fails
 * @description Converts a specific page of a PDF to a canvas and returns as data URL
 */
export async function generatePageThumbnail(pdfBuffer: ArrayBuffer, pageNumber: number): Promise<string> {
  // 確保只在客戶端運行
  if (typeof window === "undefined") {
    throw new Error("此功能只能在客戶端運行");
  }

  try {
    // 動態導入 PDF.js 以避免服務器端渲染問題
    const pdfjsLib = await import("pdfjs-dist");

    // 設置 PDF.js worker（只在客戶端）
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    }

    // 創建 ArrayBuffer 的副本以避免被 PDF.js 分離
    const pdfBufferCopy = pdfBuffer.slice();

    // 載入 PDF 文件
    const pdf = await pdfjsLib.getDocument({ data: pdfBufferCopy }).promise;

    // 檢查頁碼是否有效
    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      throw new Error(`無效的頁碼: ${pageNumber}. PDF 共有 ${pdf.numPages} 頁`);
    }

    // 獲取指定頁面
    const page = await pdf.getPage(pageNumber);

    // 設置縮圖尺寸
    const viewport = page.getViewport({ scale: 0.5 });

    // 創建 canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("無法創建 canvas context");
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 渲染頁面到 canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    // 轉換為 data URL
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch (error) {
    console.error("生成頁面縮圖失敗:", error);
    throw error;
  }
}

/**
 * Downloads a PDF file from Supabase storage and returns it as ArrayBuffer
 * @param filePath - The storage path of the PDF file
 * @returns Promise<ArrayBuffer> - Returns the PDF file as ArrayBuffer
 * @throws {Error} When PDF download fails
 * @description Downloads PDF from storage and returns as ArrayBuffer for reuse
 */
export async function downloadPDFBuffer(filePath: string): Promise<ArrayBuffer> {
  // 確保只在客戶端運行
  if (typeof window === "undefined") {
    throw new Error("此功能只能在客戶端運行");
  }

  const supabase = createClient();

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

/**
 * Generates thumbnails for specified pages using a pre-downloaded PDF buffer
 * @param pdfBuffer - The PDF file as ArrayBuffer
 * @param pageNumbers - Array of page numbers to generate thumbnails for (1-based)
 * @returns Promise<Map<number, string>> - Returns a map of page numbers to thumbnail data URLs
 * @throws {Error} When thumbnail generation fails
 * @description Generates thumbnails for multiple pages from a PDF buffer
 */
export async function generatePageThumbnailsFromBuffer(pdfBuffer: ArrayBuffer, pageNumbers: number[]): Promise<Map<number, string>> {
  // 確保只在客戶端運行
  if (typeof window === "undefined") {
    throw new Error("此功能只能在客戶端運行");
  }

  try {
    // 生成所有頁面的縮圖
    const thumbnailMap = new Map<number, string>();

    for (const pageNumber of pageNumbers) {
      try {
        const thumbnailDataUrl = await generatePageThumbnail(pdfBuffer, pageNumber);
        thumbnailMap.set(pageNumber, thumbnailDataUrl);
      } catch (error) {
        console.error(`生成第 ${pageNumber} 頁縮圖失敗:`, error);
        // 繼續處理其他頁面，不中斷整個流程
      }
    }

    return thumbnailMap;
  } catch (error) {
    console.error("生成頁面縮圖失敗:", error);
    throw error;
  }
}

/**
 * Downloads a PDF file from Supabase storage and generates thumbnails for specified pages
 * @param arrangementId - The arrangement ID
 * @param filePath - The storage path of the PDF file
 * @param pageNumbers - Array of page numbers to generate thumbnails for (1-based)
 * @returns Promise<Map<number, string>> - Returns a map of page numbers to thumbnail data URLs
 * @throws {Error} When PDF download or thumbnail generation fails
 * @description Downloads PDF from storage and generates thumbnails for multiple pages
 * @deprecated Use downloadPDFBuffer and generatePageThumbnailsFromBuffer for better performance when generating multiple thumbnails
 */
export async function generatePageThumbnails(arrangementId: string, filePath: string, pageNumbers: number[]): Promise<Map<number, string>> {
  // 確保只在客戶端運行
  if (typeof window === "undefined") {
    throw new Error("此功能只能在客戶端運行");
  }

  try {
    const arrayBuffer = await downloadPDFBuffer(filePath);
    return await generatePageThumbnailsFromBuffer(arrayBuffer, pageNumbers);
  } catch (error) {
    console.error("生成頁面縮圖失敗:", error);
    throw error;
  }
}

/**
 * Fetches thumbnail data for a specific arrangement from the API.
 * @param arrangementId - The arrangement ID to fetch thumbnail for
 * @returns Promise<ThumbnailResult> - Returns thumbnail URL and preview path, or null values if not found
 * @description Makes a client-side API call to retrieve thumbnail information. Returns null values on error or when thumbnail doesn't exist.
 */
export async function getThumbnailForArrangement(arrangementId: string): Promise<ThumbnailResult> {
  try {
    const response = await fetch(`/api/thumbnails/arrangements/${arrangementId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          thumbnailUrl: null,
          previewPath: null
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      thumbnailUrl: data.thumbnailUrl || null,
      previewPath: data.previewPath || null
    };
  } catch (error) {
    console.error("獲取縮圖失敗:", error);
    return {
      thumbnailUrl: null,
      previewPath: null
    };
  }
}

/**
 * Fetches thumbnail data for a specific part from the API.
 * @param partId - The part ID to fetch thumbnail for
 * @returns Promise<ThumbnailResult> - Returns thumbnail URL and preview path, or null values if not found
 * @description Makes a client-side API call to retrieve part thumbnail information. Returns null values on error or when thumbnail doesn't exist.
 */
export async function getThumbnailForPart(partId: string): Promise<ThumbnailResult> {
  try {
    const response = await fetch(`/api/thumbnails/parts/${partId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          thumbnailUrl: null,
          previewPath: null
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      thumbnailUrl: data.thumbnailUrl || null,
      previewPath: data.previewPath || null
    };
  } catch (error) {
    console.error("獲取聲部縮圖失敗:", error);
    return {
      thumbnailUrl: null,
      previewPath: null
    };
  }
}
