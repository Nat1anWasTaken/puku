"use client";

import { Badge, Card, HStack, IconButton, Input, Popover, Portal, Text, VStack } from "@chakra-ui/react";
import { Filter } from "lucide-react";
import { useState } from "react";
import { PartSortControls } from "./part-sort-controls";

interface PartFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "name" | "created_at";
  onSortByChange: (sortBy: "name" | "created_at") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  totalCount: number;
  filteredCount: number;
}

export function PartFilters({ searchQuery, onSearchChange, sortBy, onSortByChange, sortOrder, onSortOrderChange, totalCount, filteredCount }: PartFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title fontSize="lg">篩選聲部</Card.Title>
      </Card.Header>
      <Card.Body>
        <VStack gap={4} align="stretch">
          {/* 搜尋欄和篩選按鈕 */}
          <HStack gap={4} align="end">
            <VStack align="stretch" gap={2} flex={1}>
              <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                搜尋聲部
              </Text>
              <Input placeholder="輸入聲部名稱..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
            </VStack>

            {/* 桌面版排序選項 */}
            <HStack gap={3} display={{ base: "none", md: "flex" }}>
              <PartSortControls sortBy={sortBy} onSortByChange={onSortByChange} sortOrder={sortOrder} onSortOrderChange={onSortOrderChange} />
            </HStack>

            {/* 手機版篩選按鈕 */}
            <Popover.Root open={isFilterOpen} onOpenChange={(e) => setIsFilterOpen(e.open)}>
              <Popover.Trigger asChild>
                <IconButton variant="outline" size="md" display={{ base: "flex", md: "none" }} aria-label="篩選選項">
                  <Filter size={16} />
                </IconButton>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Arrow>
                      <Popover.ArrowTip />
                    </Popover.Arrow>
                    <Popover.Header>
                      <Popover.Title>篩選選項</Popover.Title>
                    </Popover.Header>
                    <Popover.Body>
                      <VStack gap={4} align="stretch">
                        <PartSortControls sortBy={sortBy} onSortByChange={onSortByChange} sortOrder={sortOrder} onSortOrderChange={onSortOrderChange} />
                      </VStack>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          </HStack>

          {/* 結果統計 */}
          <HStack justify="space-between" align="center">
            <Text fontSize="sm" color="fg.muted">
              顯示 {filteredCount} / {totalCount} 個聲部
            </Text>
            {searchQuery && (
              <Badge variant="subtle" colorPalette="blue">
                搜尋: {searchQuery}
              </Badge>
            )}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
