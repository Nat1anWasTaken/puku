"use client";

import { Part } from "@/lib/services/part-service";
import { Box, Card, Grid, Text } from "@chakra-ui/react";

interface PartSelectorProps {
  totalPages: number;
  selectedPages: Set<number>;
  parts: Part[];
  onPageToggle: (pageNumber: number) => void;
  isLoading?: boolean;
}

// 預定義的顏色列表
const PART_COLORS = ["red.500", "teal.500", "blue.500", "green.500", "yellow.400", "purple.400", "cyan.400", "amber.400", "indigo.400", "sky.400"];

export function PartSelector({ totalPages, selectedPages, parts, onPageToggle, isLoading }: PartSelectorProps) {
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

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>頁面</Card.Title>
        <Text fontSize="sm" color="fg.muted">
          點擊頁面來選擇，選中的頁面將用於創建新聲部
        </Text>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <Text>載入頁面中...</Text>
        ) : totalPages ? (
          <Grid templateColumns="repeat(10, 1fr)" gap={2}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Box
                key={pageNum}
                as="button"
                p={3}
                bg={getPageBackgroundColor(pageNum)}
                border="1px solid"
                borderColor={selectedPages.has(pageNum) ? "blue.500" : "gray.200"}
                borderRadius="md"
                cursor="pointer"
                onClick={() => onPageToggle(pageNum)}
                _hover={{ borderColor: "blue.400" }}
                transition="all 0.2s"
              >
                <Text fontSize="sm" fontWeight="medium">
                  P{pageNum}
                </Text>
              </Box>
            ))}
          </Grid>
        ) : (
          <Text>無法載入頁面信息</Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}
