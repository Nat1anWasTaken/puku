"use client";

import { getThumbnailForPart } from "@/lib/services/thumbnail-client";
import { Box, BoxProps, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";

interface PartThumbnailImageProps extends Omit<BoxProps, "title" | "direction"> {
  title: string;
  partId?: string;
}

export function PartThumbnailImage({ title, partId, ...styleProps }: PartThumbnailImageProps) {
  const { data: thumbnailResult, isLoading } = useQuery({
    queryKey: ["part-thumbnail", partId],
    queryFn: async () => {
      if (!partId) return null;
      return await getThumbnailForPart(partId);
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: !!partId
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

  if (!partId && !thumbnailResult?.thumbnailUrl) {
    <Box {...styleProps}>
      <Flex bg="bg.muted" align="center" justify="center" direction="column" gap={2}>
        <Icon size="xl" color="fg.muted">
          <Music />
        </Icon>
        <Text color="fg.muted" fontSize="sm">
          {partId ? "生成縮圖中..." : "聲部不存在"}
        </Text>
      </Flex>
    </Box>;
  }

  if (thumbnailResult?.thumbnailUrl) {
    return <Image src={thumbnailResult.thumbnailUrl} alt={title} {...styleProps} w="full" h="full" objectFit="cover" />;
  }
}
