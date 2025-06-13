"use client";

import { Part } from "@/lib/services/part-service";
import { generatePageThumbnailsFromBuffer } from "@/lib/services/thumbnail-client";
import { Box, Card, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

interface PartSelectorProps {
  totalPages: number;
  selectedPages: Set<number>;
  parts: Part[];
  onPageToggle: (pageNumber: number) => void;
  onBulkPageToggle?: (pageNumbers: number[], shouldSelect: boolean) => void;
  isLoading?: boolean;
  pdfBuffer?: ArrayBuffer | null;
}

// 預定義的顏色列表
const PART_COLORS = ["red.500", "teal.500", "blue.500", "green.500", "yellow.400", "purple.400", "cyan.400", "amber.400", "indigo.400", "sky.400"];

export function PartSelector({ totalPages, selectedPages, parts, onPageToggle, onBulkPageToggle, isLoading, pdfBuffer }: PartSelectorProps) {
  const [thumbnailUrls, setThumbnailUrls] = useState<Map<number, string>>(new Map());
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [lastClickedPage, setLastClickedPage] = useState<number | null>(null);

  // 生成所有頁面的縮圖
  const generateThumbnails = useCallback(async () => {
    if (!pdfBuffer || !totalPages) return;

    setIsLoadingThumbnails(true);
    try {
      const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
      const thumbnailMap = await generatePageThumbnailsFromBuffer(pdfBuffer, pageNumbers);
      setThumbnailUrls(thumbnailMap);
    } catch (error) {
      console.error("生成縮圖失敗:", error);
    } finally {
      setIsLoadingThumbnails(false);
    }
  }, [pdfBuffer, totalPages]);

  useEffect(() => {
    // 只有當有 pdfBuffer 和 totalPages 時才生成縮圖
    if (pdfBuffer && totalPages) {
      generateThumbnails();
    }
  }, [pdfBuffer, totalPages, generateThumbnails]);

  // 獲取頁面的背景顏色
  const getPageBackgroundColor = (pageNumber: number) => {
    // 檢查是否被選中
    if (selectedPages.has(pageNumber)) {
      return "blue.500";
    }

    // 檢查是否屬於某個聲部
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.start_page && part.end_page && pageNumber >= part.start_page && pageNumber <= part.end_page) {
        return PART_COLORS[i % PART_COLORS.length] + "40"; // 添加透明度
      }
    }

    return "bg.subtle";
  };

  // 處理頁面點擊，支援 Shift 鍵批量選擇
  const handlePageClick = (pageNumber: number, event: React.MouseEvent) => {
    // 阻止默認行為，避免文字選擇等干擾
    event.preventDefault();

    if (event.shiftKey && lastClickedPage !== null && lastClickedPage !== pageNumber && onBulkPageToggle) {
      // Shift + 點擊：選擇範圍（只有當點擊不同頁面時）
      const start = Math.min(lastClickedPage, pageNumber);
      const end = Math.max(lastClickedPage, pageNumber);

      // 獲取範圍內的所有頁面
      const rangePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

      const selectedInRange = rangePages.filter((page) => selectedPages.has(page)).length;
      const shouldSelect = selectedInRange < rangePages.length / 2; // 如果少於一半被選中，則選擇全部；否則取消全部

      // 批量選擇/取消選擇範圍內的所有頁面
      onBulkPageToggle(rangePages, shouldSelect);

      // 範圍選擇後，不更新 lastClickedPage，保持原來的起始點
      // 這樣用戶可以繼續從同一個起始點進行多次範圍選擇
    } else {
      // 普通點擊：切換單個頁面
      onPageToggle(pageNumber);

      // 只有在普通點擊時才更新最後點擊的頁面
      setLastClickedPage(pageNumber);
    }
  };

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>頁面</Card.Title>
        <Text fontSize="sm" color="fg.muted">
          點擊頁面來選擇，按住 Shift 鍵點擊可批量選擇範圍，選中的頁面將用於創建新聲部
        </Text>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Text>載入頁面中...</Text>
        ) : totalPages ? (
          <Flex flexWrap="wrap" gap={2}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Box
                key={pageNum}
                as="button"
                p={2}
                bg={getPageBackgroundColor(pageNum)}
                border="2px solid"
                w="250px"
                borderColor={selectedPages.has(pageNum) ? "blue.500" : "bg.emphasized"}
                borderRadius="md"
                cursor="pointer"
                onClick={(event) => handlePageClick(pageNum, event)}
                onMouseDown={(event) => {
                  // 確保 shift 鍵狀態被正確捕獲
                  if (event.shiftKey) {
                    event.preventDefault();
                  }
                }}
                _hover={{ borderColor: "blue.400" }}
                transition="all 0.2s"
                position="relative"
                overflow="hidden"
              >
                {/* 縮圖顯示區域 */}
                <Box borderRadius="sm" overflow="hidden" mb={1} aspectRatio={1 / 1.4142}>
                  {isLoadingThumbnails ? (
                    <Skeleton w="full" h="full" />
                  ) : thumbnailUrls.has(pageNum) ? (
                    <Image src={thumbnailUrls.get(pageNum)} alt={`頁面 ${pageNum} 縮圖`} w="full" h="full" objectFit="cover" aspectRatio={1 / 1.4142} />
                  ) : (
                    <Box w="full" h="full" bg="bg.muted" display="flex" alignItems="center" justifyContent="center">
                      <Text fontSize="xs" color="fg.muted">
                        P{pageNum}
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* 頁碼標籤 */}
                <Text fontSize="xs" fontWeight="medium" textAlign="center">
                  P{pageNum}
                </Text>
              </Box>
            ))}
          </Flex>
        ) : (
          <Text>無法載入頁面信息</Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}
