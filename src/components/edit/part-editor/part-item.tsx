"use client";

import { generatePageThumbnails } from "@/lib/services/thumbnail-client";
import { Box, HStack, IconButton, Image, Skeleton, Text, VStack } from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DeletePartDialog } from "./delete-part-dialog";

interface PartItemProps {
  id: number;
  name: string;
  startPage: number | null;
  endPage: number | null;
  color: string;
  onDelete: (id: number) => void;
  arrangementId?: string;
  filePath?: string;
}

export function PartItem({ id, name, startPage, endPage, color, onDelete, arrangementId, filePath }: PartItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  const generateThumbnail = useCallback(async () => {
    if (!arrangementId || !filePath || !startPage) return;

    setIsLoadingThumbnail(true);
    try {
      const thumbnailMap = await generatePageThumbnails(arrangementId, filePath, [startPage]);
      const thumbnail = thumbnailMap.get(startPage);
      if (thumbnail) {
        setThumbnailUrl(thumbnail);
      }
    } catch (error) {
      console.error("生成縮圖失敗:", error);
    } finally {
      setIsLoadingThumbnail(false);
    }
  }, [arrangementId, filePath, startPage]);

  useEffect(() => {
    // 只有當有 arrangementId、filePath 和 startPage 時才生成縮圖
    if (arrangementId && filePath && startPage) {
      generateThumbnail();
    }
  }, [arrangementId, filePath, startPage, generateThumbnail]);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
  };

  return (
    <>
      <HStack p={3} borderRadius="md" border="1px solid" borderColor="border.emphasized" justify="space-between">
        <HStack gap={3}>
          <Box w={4} h={4} bg={color} borderRadius="full" />
          <VStack align="start" gap={0}>
            <Text fontWeight="medium">{name}</Text>
            <Text fontSize="sm" color="fg.muted">
              頁面 {startPage} - {endPage}
            </Text>
          </VStack>
        </HStack>

        <HStack gap={3}>
          {/* 縮圖顯示區域 */}
          <Box w={16} h={20} borderRadius="md" overflow="hidden" border="1px solid" borderColor="border.subtle">
            {isLoadingThumbnail ? (
              <Skeleton w="full" h="full" />
            ) : thumbnailUrl ? (
              <Image src={thumbnailUrl} alt={`${name} 縮圖`} w="full" h="full" objectFit="cover" />
            ) : (
              <Box w="full" h="full" bg="bg.muted" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="xs" color="fg.muted">
                  P{startPage}
                </Text>
              </Box>
            )}
          </Box>

          <IconButton size="sm" variant="ghost" colorScheme="red" onClick={handleDelete} aria-label={`刪除 ${name}`}>
            <Trash2 size={16} />
          </IconButton>
        </HStack>
      </HStack>

      <DeletePartDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} partName={name} />
    </>
  );
}
