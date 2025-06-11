import { uploadArrangement, UploadArrangementData, UploadProgress, UploadResult } from "@/lib/services/upload-service";
import { useState } from "react";

export function useUploadArrangement() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (data: UploadArrangementData): Promise<UploadResult | null> => {
    setIsLoading(true);
    setError(null);
    setProgress(null);

    try {
      const result = await uploadArrangement(data, (progressInfo) => {
        setProgress(progressInfo);
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setProgress(null);
    setError(null);
  };

  return {
    upload,
    isLoading,
    progress,
    error,
    reset
  };
}
