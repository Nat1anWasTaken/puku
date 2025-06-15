"use client";

import { Tables } from "@/lib/supabase/types";
import { Box, Card, Heading, LinkOverlay, Text, VStack } from "@chakra-ui/react";
import { PartThumbnailImage } from "../edit/part-editor/part-thumbnail-image";

type Part = Tables<"parts">;

interface PartCardProps {
  part: Part;
  onClick?: (part: Part) => void;
}

export function PartCard({ part, onClick }: PartCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(part);
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
      <LinkOverlay href={`/part/${part.id}`}>
        <Card.Body p={4}>
          <VStack align="stretch" gap={3}>
            {/* 縮圖區域 - 1:1.4142 比例 */}
            <Box w="full" borderRadius="md" overflow="hidden">
              <PartThumbnailImage title={part.label} partId={part.id} aspectRatio={1 / 1.4142} />
            </Box>

            {/* 聲部資訊 */}
            <VStack align="stretch" gap={2}>
              <Heading size="md" lineHeight="1.2" lineClamp={2}>
                {part.label}
              </Heading>

              <Text color="fg.muted" fontSize="xs">
                建立於 {new Date(part.created_at).toLocaleDateString("zh-TW")}
              </Text>
            </VStack>
          </VStack>
        </Card.Body>
      </LinkOverlay>
    </Card.Root>
  );
}
