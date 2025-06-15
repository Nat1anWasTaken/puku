"use client";

import { downloadFile, extractPDFPages } from "@/lib/services/pdf-client";
import { downloadPDFBuffer } from "@/lib/services/thumbnail-client";
import { Tables } from "@/lib/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

type Arrangement = Tables<"arrangements">;
type Part = Tables<"parts">;

interface UsePartDownloadProps {
  arrangement: Arrangement;
  part: Part;
}

export function usePartDownload({ arrangement, part }: UsePartDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 使用 React Query 緩存 PDF buffer
  const { data: pdfBuffer, isLoading: isLoadingPDF } = useQuery({
    queryKey: ["pdf-buffer", arrangement.file_path],
    queryFn: () => (arrangement.file_path ? downloadPDFBuffer(arrangement.file_path) : Promise.resolve(null)),
    enabled: !!arrangement.file_path,
    staleTime: 5 * 60 * 1000, // 5 分鐘內不重新獲取
    gcTime: 10 * 60 * 1000 // 10 分鐘後清理緩存
  });

  const downloadPart = useCallback(async () => {
    if (!pdfBuffer || !part.start_page || !part.end_page) {
      console.error("缺少必要的下載數據");
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      // 生成文件名：聲部標籤 + 頁面範圍
      const sanitizedLabel = part.label.replace(/[^a-zA-Z0-9\u4e00-\u9fff\s-_]/g, "").trim();
      const fileName = `${arrangement.title} - ${sanitizedLabel}.pdf`;

      // 提取指定頁面
      const { pdfBytes } = await extractPDFPages(pdfBuffer, part.start_page, part.end_page, fileName);

      // 下載文件
      downloadFile(pdfBytes, fileName);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("下載失敗");
      setError(error);
      console.error("下載聲部失敗:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [pdfBuffer, part]);

  return {
    downloadPart,
    isDownloading,
    isLoadingPDF,
    canDownload: !!pdfBuffer && !!part.start_page && !!part.end_page,
    error
  };
}
