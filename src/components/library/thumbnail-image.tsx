"use client";

import { Flex, Icon, Image, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Music } from "lucide-react";
import { getThumbnailUrl } from "@/lib/services/thumbnail-client";

interface ThumbnailImageProps {
  previewPath: string | null;
  title: string;
  filePath: string | null;
}

export function ThumbnailImage({ previewPath, title, filePath }: ThumbnailImageProps) {
  const { data: signedUrl, isLoading } = useQuery({
    queryKey: ["thumbnail", previewPath],
    queryFn: async () => {
      if (!previewPath) return null;
      return await getThumbnailUrl(previewPath);
    },
    enabled: !!previewPath,
    staleTime: 50 * 60 * 1000 // 50 minutes
  });

  if (previewPath && isLoading) {
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

  if (previewPath && signedUrl) {
    return <Image src={signedUrl} alt={title} w="full" h="200px" objectFit="cover" />;
  }

  return (
    <Flex w="full" h="200px" bg="bg.muted" align="center" justify="center" direction="column" gap={2}>
      <Icon size="xl" color="fg.muted">
        <Music />
      </Icon>
      <Text color="fg.muted" fontSize="sm">
        {filePath ? "縮圖生成中" : "檔案不存在"}
      </Text>
    </Flex>
  );
}
