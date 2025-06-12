"use client";

import { Box, Image, Skeleton } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

interface ThumbnailImageProps {
  arrangementId: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

interface ThumbnailResponse {
  thumbnailUrl: string;
  previewPath: string;
}

async function fetchThumbnail(arrangementId: string): Promise<ThumbnailResponse> {
  const response = await fetch(`/api/thumbnails/${arrangementId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "獲取縮圖失敗");
  }

  return response.json();
}

export function ThumbnailImage({ arrangementId, alt = "編曲縮圖", width = "200px", height = "auto" }: ThumbnailImageProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["thumbnail", arrangementId],
    queryFn: () => fetchThumbnail(arrangementId),
    enabled: !!arrangementId,
    staleTime: 10 * 60 * 1000, // 縮圖很少變更，可以快取久一點
    gcTime: 30 * 60 * 1000 // 30 分鐘
  });

  if (isLoading) {
    return <Skeleton width={width} height={height || "280px"} borderRadius="md" />;
  }

  if (error || !data?.thumbnailUrl) {
    return (
      <Box width={width} height={height || "280px"} bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center" color="gray.500" fontSize="sm">
        {error?.message || "無法載入縮圖"}
      </Box>
    );
  }

  return <Image src={data.thumbnailUrl} alt={alt} width={width} height={height} objectFit="cover" borderRadius="md" />;
}
