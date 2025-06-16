import { toaster } from "@/components/ui/toaster";
import { createArrangement, CreateArrangementData, updateArrangementFilePath, updateArrangementPreviewPath } from "@/lib/services/arrangement-service";
import { generateArrangementFilePath, uploadFileToStorage } from "@/lib/services/storage-service";
import { generateAndUploadArrangementThumbnail } from "@/lib/services/thumbnail-service";
import { mergePDFFiles } from "./pdf-client";

const BUCKET_NAME = "arrangements";

export type UploadArrangementData = CreateArrangementData & {
  files: File[];
};

export type UploadProgress = {
  step: "creating" | "merging" | "uploading" | "updating" | "generating_thumbnail" | "completed";
  message: string;
  progress: number;
};

export type UploadResult = {
  arrangementId: string;
  filePath: string;
  previewPath?: string;
};

/**
 * Uploads an arrangement with multiple PDF files, merging them into a single document
 * @param data - Upload data including arrangement details and PDF files to merge
 * @param onProgress - Optional callback function to track upload progress
 * @returns Promise<UploadResult> - Returns the arrangement ID, file path, and optional preview path
 * @throws {Error} When any step of the upload process fails
 * @description Handles the complete upload workflow: creates arrangement record, merges PDFs, uploads to storage, updates file path, and generates thumbnail
 */
export async function uploadArrangement(data: UploadArrangementData, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
  try {
    onProgress?.({
      step: "creating",
      message: "創建編曲記錄中...",
      progress: 15
    });

    const arrangementId = await createArrangement({
      title: data.title,
      composers: data.composers,
      ensembleType: data.ensembleType,
      ownerId: data.ownerId
    });

    onProgress?.({
      step: "merging",
      message: "合併 PDF 檔案中...",
      progress: 30
    });

    const mergedPdfBytes = await mergePDFFiles(data.files);

    onProgress?.({
      step: "uploading",
      message: "上傳檔案到伺服器中...",
      progress: 50
    });

    const filePath = generateArrangementFilePath(arrangementId);
    await uploadFileToStorage(BUCKET_NAME, filePath, mergedPdfBytes);

    onProgress?.({
      step: "updating",
      message: "更新編曲檔案路徑中...",
      progress: 65
    });

    await updateArrangementFilePath(arrangementId, filePath);

    onProgress?.({
      step: "generating_thumbnail",
      message: "生成縮圖中...",
      progress: 80
    });

    let previewPath: string | undefined;
    try {
      const thumbnailResult = await generateAndUploadArrangementThumbnail(arrangementId, filePath);
      previewPath = thumbnailResult.previewPath;

      await updateArrangementPreviewPath(arrangementId, previewPath);
    } catch (thumbnailError) {
      console.error("縮圖生成失敗:", thumbnailError);
    }

    onProgress?.({
      step: "completed",
      message: "上傳完成！",
      progress: 100
    });

    return {
      arrangementId,
      filePath,
      previewPath
    };
  } catch (error) {
    toaster.error({
      title: "上傳失敗",
      description: error instanceof Error ? error.message : "未知錯誤，請稍後再試。"
    });
    throw error;
  }
}
