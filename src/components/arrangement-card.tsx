"use client";

import { Tables } from "@/lib/supabase/types";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { Badge, Box, Card, Heading, HStack, LinkOverlay, Text, VStack } from "@chakra-ui/react";
import { ArrangementThumbnailImage } from "./library/arrangement-thumbnail-image";

type Arrangement = Tables<"arrangements">;

interface ArrangementCardProps {
  arrangement: Arrangement;
  onClick?: (arrangement: Arrangement) => void;
}

export function ArrangementCard({ arrangement, onClick }: ArrangementCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(arrangement);
    }
  };

  return (
    <Card.Root
      size="sm"
      cursor={onClick ? "pointer" : "default"}
      onClick={handleClick}
      _hover={{
        bg: "bg.emphasized"
      }}
      transition="all 0.2s"
    >
      <LinkOverlay href={`/arrangements/${arrangement.id}`}>
        <Card.Body>
          <VStack align="stretch" gap={3}>
            {/* 縮圖區域 - 1:1.4142 比例 */}
            <Box w="full" aspectRatio={1 / 1.4142} overflow="hidden" borderRadius="md">
              <ArrangementThumbnailImage title={arrangement.title} filePath={arrangement.file_path} arrangementId={arrangement.id} w="250px" aspectRatio={1 / 1.4142} />
            </Box>

            {/* 編曲資訊 */}
            <VStack align="stretch" gap={2}>
              <Heading size="md" lineHeight="1.2" lineClamp={2}>
                {arrangement.title}
              </Heading>

              <Text color="fg.muted" fontSize="sm" lineClamp={1}>
                {arrangement.composers.join(", ")}
              </Text>

              <HStack justify="space-between" align="center">
                <Badge variant="subtle" size="sm">
                  {snakeCaseToTitleCase(arrangement.ensemble_type)}
                </Badge>

                <Badge variant={arrangement.visibility === "public" ? "solid" : "outline"} colorPalette={arrangement.visibility === "public" ? "green" : "gray"} size="sm">
                  {arrangement.visibility === "public" ? "公開" : arrangement.visibility === "unlisted" ? "不公開" : "私人"}
                </Badge>
              </HStack>

              <Text color="fg.muted" fontSize="xs">
                建立於 {new Date(arrangement.created_at).toLocaleDateString("zh-TW")}
              </Text>
            </VStack>
          </VStack>
        </Card.Body>
      </LinkOverlay>
    </Card.Root>
  );
}
