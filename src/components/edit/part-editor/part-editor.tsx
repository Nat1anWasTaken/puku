"use client";

import { toaster } from "@/components/ui/toaster";
import { createPart, CreatePartData, deletePart, getPartsByArrangementId, getPDFPageCount, Part } from "@/lib/services/part-service";
import { Alert, CloseButton, Drawer, Portal, Text, VStack } from "@chakra-ui/react";
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
    <Drawer.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content maxW="4xl">
            <Drawer.Header>
              <Drawer.Title>聲部編輯器</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body>
              <VStack gap={6} align="stretch">
                {/* 頁面選擇區域 */}
                <PartSelector totalPages={totalPages || 0} selectedPages={selectedPages} parts={parts} onPageToggle={handlePageToggle} isLoading={isLoadingPages} />

                {/* 聲部列表 */}
                <PartListing parts={partsWithColor} onDeletePart={handleDeletePart} isLoading={isLoadingParts} />

                {/* 創建新聲部 */}
                <PartCreatorForm selectedPages={selectedPages} partLabel={partLabel} onPartLabelChange={setPartLabel} onCreatePart={handleCreatePart} isCreating={createPartMutation.isPending} />
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
