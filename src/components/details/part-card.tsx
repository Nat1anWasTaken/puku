"use client";

import { usePartDownload } from "@/hooks/use-part-download";
import { Tables } from "@/lib/supabase/types";
import { Box, Button, Card, Heading, Text, VStack } from "@chakra-ui/react";
import { Download } from "lucide-react";
import { useState } from "react";
import { PartThumbnailImage } from "../edit/part-editor/part-thumbnail-image";

type Arrangement = Tables<"arrangements">;
type Part = Tables<"parts">;

interface PartCardProps {
  arrangement: Arrangement;
  part: Part;
  onClick?: (part: Part) => void;
}

export function PartCard({ arrangement, part, onClick }: PartCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const { downloadPart, isDownloading, canDownload } = usePartDownload({
    arrangement,
    part
  });

  const handleClick = () => {
    if (onClick) {
      onClick(part);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    downloadPart();
  };

  return (
    <Card.Root
      size="sm"
      cursor="pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{
        bg: "bg.emphasized"
      }}
      transition="all 0.2s"
      position="relative"
    >
      <Card.Body p={4}>
        <VStack align="stretch" gap={3}>
          {/* 縮圖區域 - 1:1.4142 比例 */}
          <Box w="full" borderRadius="md" overflow="hidden" position="relative">
            <PartThumbnailImage title={part.label} partId={part.id} aspectRatio={1 / 1.4142} />

            {/* 懸停時顯示下載按鈕 */}
            {canDownload && (
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="blackAlpha.600"
                display="flex"
                alignItems="center"
                justifyContent="center"
                opacity={isHovered ? 1 : 0}
                visibility={isHovered ? "visible" : "hidden"}
                transition="all 0.2s ease-in-out"
              >
                <Button size="sm" colorScheme="blue" onClick={handleDownload} loading={isDownloading} loadingText="下載中...">
                  <Download size={16} />
                  點擊下載
                </Button>
              </Box>
            )}
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
    </Card.Root>
  );
}
