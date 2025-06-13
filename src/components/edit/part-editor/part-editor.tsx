"use client";

import { toaster } from "@/components/ui/toaster";
import { createPart, CreatePartData, deletePart, getPartsByArrangementId, getPDFPageCount, Part } from "@/lib/services/part-service";
import { downloadPDFBuffer } from "@/lib/services/thumbnail-client";
import { Alert, Box, CloseButton, Drawer, Flex, HStack, Portal, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { PartCreatorForm } from "./part-creator-form";
import { PartListing } from "./part-listing";
import { PartSelector } from "./part-selector";

interface PartEditorProps {
  arrangementId: string;
  filePath: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PartWithColor extends Part {
  color: string;
  name: string;
}

// 預定義的顏色列表
// 使用 Chakra UI 的色彩 token
const PART_COLORS = ["red.500", "teal.500", "blue.500", "green.500", "yellow.400", "purple.400", "cyan.400", "amber.400", "indigo.400", "sky.400"];

export function PartEditor({ arrangementId, filePath, isOpen, onClose }: PartEditorProps) {
  const queryClient = useQueryClient();

  // 狀態管理
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [partLabel, setPartLabel] = useState<string>("");

  // 獲取 PDF 頁數
  const { data: totalPages, isLoading: isLoadingPages } = useQuery({
    queryKey: ["pdf-pages", arrangementId, filePath],
    queryFn: () => (filePath ? getPDFPageCount(filePath) : Promise.resolve(0)),
    enabled: !!filePath && isOpen
  });

  // 下載 PDF buffer（只下載一次）
  const { data: pdfBuffer, isLoading: isLoadingBuffer } = useQuery({
    queryKey: ["pdf-buffer", filePath],
    queryFn: () => (filePath ? downloadPDFBuffer(filePath) : Promise.resolve(null)),
    enabled: !!filePath && isOpen
  });

  // 獲取聲部列表
  const { data: parts = [], isLoading: isLoadingParts } = useQuery({
    queryKey: ["parts", arrangementId],
    queryFn: () => getPartsByArrangementId(arrangementId),
    enabled: isOpen
  });

  // 為聲部添加顏色和名稱
  const partsWithColor = useMemo<PartWithColor[]>(() => {
    return parts.map((part, index) => ({
      ...part,
      color: PART_COLORS[index % PART_COLORS.length],
      name: part.label || `聲部 ${index + 1}`
    }));
  }, [parts]);

  // 創建聲部 mutation
  const createPartMutation = useMutation({
    mutationFn: createPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts", arrangementId] });
      setSelectedPages(new Set());
      setPartLabel("");
      toaster.success({
        title: "聲部創建成功",
        description: "新聲部已成功創建"
      });
    },
    onError: (error) => {
      toaster.error({
        title: "創建聲部失敗",
        description: error instanceof Error ? error.message : "未知錯誤"
      });
    }
  });

  // 刪除聲部 mutation
  const deletePartMutation = useMutation({
    mutationFn: deletePart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts", arrangementId] });
      toaster.success({
        title: "聲部刪除成功",
        description: "聲部已成功刪除"
      });
    },
    onError: (error) => {
      toaster.error({
        title: "刪除聲部失敗",
        description: error instanceof Error ? error.message : "未知錯誤"
      });
    }
  });

  // 處理頁面選擇
  const handlePageToggle = (pageNumber: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNumber)) {
      newSelected.delete(pageNumber);
    } else {
      newSelected.add(pageNumber);
    }
    setSelectedPages(newSelected);
  };

  // 處理批量頁面選擇（用於 shift 點擊）
  const handleBulkPageToggle = (pageNumbers: number[], shouldSelect: boolean) => {
    setSelectedPages((prev) => {
      const newSelected = new Set(prev);
      pageNumbers.forEach((pageNumber) => {
        if (shouldSelect) {
          newSelected.add(pageNumber);
        } else {
          newSelected.delete(pageNumber);
        }
      });
      return newSelected;
    });
  };

  // 處理創建聲部
  const handleCreatePart = () => {
    if (selectedPages.size === 0) {
      toaster.error({
        title: "請選擇頁面",
        description: "請至少選擇一個頁面來創建聲部"
      });
      return;
    }

    if (!partLabel.trim()) {
      toaster.error({
        title: "請輸入聲部標籤",
        description: "請為聲部輸入一個標籤名稱"
      });
      return;
    }

    const selectedPagesArray = Array.from(selectedPages).sort((a, b) => a - b);
    const startPage = selectedPagesArray[0];
    const endPage = selectedPagesArray[selectedPagesArray.length - 1];

    const createData: CreatePartData = {
      arrangementId,
      startPage,
      endPage,
      label: partLabel.trim()
    };

    createPartMutation.mutate(createData);
  };

  // 處理刪除聲部
  const handleDeletePart = (partId: number) => {
    deletePartMutation.mutate(partId);
  };

  // 重置狀態當抽屜關閉時
  useEffect(() => {
    if (!isOpen) {
      setSelectedPages(new Set());
      setPartLabel("");
    }
  }, [isOpen]);

  if (!filePath) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>聲部編輯器</Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body>
                <Alert.Root status="warning">
                  <Alert.Indicator />
                  <Text>此編曲尚未上傳 PDF 文件，無法編輯聲部。</Text>
                </Alert.Root>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    );
  }

  return (
    <Drawer.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="full">
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header borderBottomWidth="1px" px={6} py={4}>
              <HStack justify="space-between" w="full">
                <Drawer.Title fontSize="xl" fontWeight="semibold">
                  聲部編輯器
                </Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="md" />
                </Drawer.CloseTrigger>
              </HStack>
            </Drawer.Header>
            <Drawer.Body p={0} overflow="scroll">
              <Flex h="full" direction={{ base: "column", lg: "row" }}>
                {/* 左側/上方：頁面選擇器 */}
                <Box
                  flex="1"
                  borderRightWidth={{ base: "0", lg: "1px" }}
                  borderBottomWidth={{ base: "1px", lg: "0" }}
                  borderColor="border.subtle"
                  overflow="auto"
                  p={6}
                  minH={{ base: "50vh", lg: "auto" }}
                >
                  <PartSelector
                    totalPages={totalPages || 0}
                    selectedPages={selectedPages}
                    parts={parts}
                    onPageToggle={handlePageToggle}
                    onBulkPageToggle={handleBulkPageToggle}
                    isLoading={isLoadingPages || isLoadingBuffer}
                    pdfBuffer={pdfBuffer}
                  />
                </Box>

                {/* 右側/下方：聲部列表和創建器 */}
                <Box w={{ base: "full", lg: "400px" }} h={{ lg: "full" }} flexShrink={0} overflow="auto" p={6}>
                  <VStack gap={6} align="stretch" h="full">
                    {/* 聲部列表 */}
                    <Box flex={{ base: "unset", lg: 1 }} overflow={{ base: "unset", lg: "auto" }}>
                      <PartListing parts={partsWithColor} onDeletePart={handleDeletePart} isLoading={isLoadingParts} h="full" />
                    </Box>

                    {/* 創建新聲部 */}
                    <Box flexShrink={0} borderTopWidth="1px" pt={6}>
                      <PartCreatorForm selectedPages={selectedPages} partLabel={partLabel} onPartLabelChange={setPartLabel} onCreatePart={handleCreatePart} isCreating={createPartMutation.isPending} />
                    </Box>
                  </VStack>
                </Box>
              </Flex>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
