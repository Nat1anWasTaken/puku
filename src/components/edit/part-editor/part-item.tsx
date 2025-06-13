"use client";

import { getThumbnailForPart } from "@/lib/services/thumbnail-client";
import { Box, HStack, IconButton, Image, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DeletePartDialog } from "./delete-part-dialog";

interface PartItemProps {
  id: number;
  name: string;
  startPage: number | null;
  endPage: number | null;
  color: string;
  onDelete: (id: number) => void;
}

export function PartItem({ id, name, startPage, endPage, color, onDelete }: PartItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 使用 React Query 獲取聲部縮圖
  const { data: thumbnailResult, isLoading: isLoadingThumbnail } = useQuery({
    queryKey: ["part-thumbnail", id],
    queryFn: async () => {
      return await getThumbnailForPart(id);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

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
            ) : thumbnailResult?.thumbnailUrl ? (
              <Image src={thumbnailResult.thumbnailUrl} alt={`${name} 縮圖`} w="full" h="full" objectFit="cover" />
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
