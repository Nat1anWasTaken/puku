"use client";

import { Flex, Icon, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";
import { getThumbnailForArrangement } from "@/lib/services/thumbnail-client";

interface ThumbnailImageProps {
  title: string;
  filePath: string | null;
  arrangementId?: string;
}

export function ThumbnailImage({ title, filePath, arrangementId }: ThumbnailImageProps) {
  // 如果有編曲 ID，使用新的 API 來獲取/生成縮圖
  const { data: thumbnailResult, isLoading } = useQuery({
    queryKey: ["thumbnail", arrangementId],
    queryFn: async () => {
      if (!arrangementId) return null;
      return await getThumbnailForArrangement(arrangementId);
    },
    enabled: !!arrangementId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  if (isLoading) {
    return (
      <Flex w="full" h="200px" bg="bg.muted" align="center" justify="center" direction="column" gap={2}>
        <Icon size="xl" color="fg.muted">
          <Music />
        </Icon>
        <Text color="fg.muted" fontSize="sm">
          載入縮圖中...
        </Text>
      </Flex>
    );
  }

  if (thumbnailResult?.thumbnailUrl) {
    return <Image src={thumbnailResult.thumbnailUrl} alt={title} w="full" h="200px" objectFit="cover" />;
  }

  return (
    <Flex w="full" h="200px" bg="bg.muted" align="center" justify="center" direction="column" gap={2}>
      <Icon size="xl" color="fg.muted">
        <Music />
      </Icon>
      <Text color="fg.muted" fontSize="sm">
        {filePath ? "生成縮圖中..." : "檔案不存在"}
      </Text>
    </Flex>
  );
}
