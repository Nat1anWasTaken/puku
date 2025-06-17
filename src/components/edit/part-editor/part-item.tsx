"use client";

import { getThumbnailForPart } from "@/lib/services/thumbnail-client";
import { Box, HStack, IconButton, Image, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { CategorySelector } from "./category-selector";
import { CreateCategoryDialog } from "./create-category-dialog";
import { DeletePartDialog } from "./delete-part-dialog";

interface PartItemProps {
  id: string;
  name: string;
  startPage: number | null;
  endPage: number | null;
  color: string;
  category: string | null;
  availableCategories: string[];
  onDelete: (id: string) => void;
  onCategoryChange: (partId: string, category: string | null) => void;
  onCreateCategory: (category: string) => void;
}

export function PartItem({ id, name, startPage, endPage, color, category, availableCategories, onDelete, onCategoryChange, onCreateCategory }: PartItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false);

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

  const handleCategoryChange = (newCategory: string) => {
    onCategoryChange(id, newCategory || null);
  };

  const handleCreateNewCategory = () => {
    setIsCreateCategoryDialogOpen(true);
  };

  const handleCreateCategory = (newCategory: string) => {
    onCreateCategory(newCategory);
    onCategoryChange(id, newCategory);
    setIsCreateCategoryDialogOpen(false);
  };

  return (
    <>
      <VStack gap={3} p={3} borderRadius="md" border="1px solid" borderColor="border.emphasized">
        {/* Top row with basic info and thumbnail */}
        <HStack justify="space-between" w="full">
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

        {/* Bottom row with category selector */}
        <HStack w="full" justify="space-between" gap={3}>
          <Text fontSize="sm" color="fg.muted" minW="fit-content">
            分類
          </Text>
          <CategorySelector w="full" value={category || ""} onChange={handleCategoryChange} availableCategories={availableCategories} onCreateNew={handleCreateNewCategory} />
        </HStack>
      </VStack>

      <DeletePartDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} partName={name} />
      <CreateCategoryDialog isOpen={isCreateCategoryDialogOpen} onClose={() => setIsCreateCategoryDialogOpen(false)} onCreateCategory={handleCreateCategory} />
    </>
  );
}
