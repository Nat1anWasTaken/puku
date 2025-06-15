"use client";

import { getThumbnailForArrangement } from "@/lib/services/thumbnail-client";
import { Box, BoxProps, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";

interface ArrangementThumbnailImageProps extends Omit<BoxProps, "title" | "direction"> {
  title: string;
  filePath: string | null;
  arrangementId?: string;
}

export function ArrangementThumbnailImage({ title, filePath, arrangementId, ...styleProps }: ArrangementThumbnailImageProps) {
  const { data: thumbnailResult, isLoading } = useQuery({
    queryKey: ["thumbnail", arrangementId],
    queryFn: async () => {
      if (!arrangementId) return null;
      return await getThumbnailForArrangement(arrangementId);
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!arrangementId
  });

  if (isLoading) {
    return (
      <Box {...styleProps}>
        <Flex bg="bg.muted" align="center" justify="center" direction="column" gap={2} {...styleProps}>
          <Icon size="xl" color="fg.muted">
            <Music />
          </Icon>
          <Text color="fg.muted" fontSize="sm">
            載入縮圖中...
          </Text>
        </Flex>
      </Box>
    );
  }

  if (!filePath && !thumbnailResult?.thumbnailUrl) {
    <Box {...styleProps}>
      <Flex bg="bg.muted" align="center" justify="center" direction="column" gap={2}>
        <Icon size="xl" color="fg.muted">
          <Music />
        </Icon>
        <Text color="fg.muted" fontSize="sm">
          {filePath ? "生成縮圖中..." : "檔案不存在"}
        </Text>
      </Flex>
    </Box>;
  }

  if (thumbnailResult?.thumbnailUrl) {
    return <Image src={thumbnailResult.thumbnailUrl} alt={title} w="full" h="full" objectFit="cover" {...styleProps} />;
  }
}
