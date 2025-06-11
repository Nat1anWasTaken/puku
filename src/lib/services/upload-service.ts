import { toaster } from "@/components/ui/toaster";
import { createArrangement, CreateArrangementData, updateArrangementFilePath } from "@/lib/services/arrangement-service";
import { mergePDFFiles } from "@/lib/services/pdf-service";
import { generateArrangementFilePath, uploadFileToStorage } from "@/lib/services/storage-service";

const BUCKET_NAME = "arrangements";

export type UploadArrangementData = CreateArrangementData & {
  files: File[];
};

export type UploadProgress = {
  step: "creating" | "merging" | "uploading" | "updating" | "completed";
  message: string;
  progress: number;
};

export type UploadResult = {
  arrangementId: string;
  filePath: string;
};

export async function uploadArrangement(data: UploadArrangementData, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
  try {
    onProgress?.({
      step: "creating",
      message: "Creating arrangement...",
      progress: 20
    });

    const arrangementId = await createArrangement({
      title: data.title,
      composers: data.composers,
      ensembleType: data.ensembleType,
      ownerId: data.ownerId
    });

    onProgress?.({
      step: "merging",
      message: "Merging PDF files...",
      progress: 40
    });

    const mergedPdfBytes = await mergePDFFiles(data.files);

    onProgress?.({
      step: "uploading",
      message: "Uploading files to Supabase...",
      progress: 70
    });

    const filePath = generateArrangementFilePath(arrangementId);
    await uploadFileToStorage(BUCKET_NAME, filePath, mergedPdfBytes);

    onProgress?.({
      step: "updating",
      message: "Updating arrangement file path...",
      progress: 90
    });

    await updateArrangementFilePath(arrangementId, filePath);

    onProgress?.({
      step: "completed",
      message: "Upload completed!",
      progress: 100
    });

    return {
      arrangementId,
      filePath
    };
  } catch (error) {
    toaster.error({
      title: "Upload failed",
      description: error instanceof Error ? error.message : "Unknown error, please try again later. "
    });
    throw error;
  }
}
