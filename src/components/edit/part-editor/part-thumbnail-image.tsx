"use client";

import { getThumbnailForPart } from "@/lib/services/thumbnail-client";
import { Flex, Icon, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";

interface PartThumbnailImageProps {
  partId: string;
  partLabel: string;
}

export function PartThumbnailImage({ partId, partLabel }: PartThumbnailImageProps) {
  // 使用 React Query 獲取聲部縮圖
  const { data: thumbnailResult, isLoading } = useQuery({
    queryKey: ["part-thumbnail", partId],
    queryFn: async () => {
      return await getThumbnailForPart(partId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  if (isLoading) {
    return (
      <Flex w="full" h="120px" bg="bg.muted" align="center" justify="center" direction="column" gap={2} borderRadius="md">
        <Icon size="lg" color="fg.muted">
          <Music />
        </Icon>
        <Text color="fg.muted" fontSize="xs">
          載入縮圖中...
        </Text>
      </Flex>
    );
  }

  if (thumbnailResult?.thumbnailUrl) {
    return <Image src={thumbnailResult.thumbnailUrl} alt={partLabel} w="full" h="120px" objectFit="cover" borderRadius="md" />;
  }

  return (
    <Flex w="full" h="120px" bg="bg.muted" align="center" justify="center" direction="column" gap={2} borderRadius="md">
      <Icon size="lg" color="fg.muted">
        <Music />
      </Icon>
      <Text color="fg.muted" fontSize="xs">
        生成縮圖中...
      </Text>
    </Flex>
  );
}
