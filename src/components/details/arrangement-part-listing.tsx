"use client";

import { getPartsByArrangementId } from "@/lib/services/part-service";
import { VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PartCategorySection } from "./part-category-section";
import { PartFilters } from "./part-filters";

interface ArrangementPartListingProps {
  arrangementId: string;
}

export function ArrangementPartListing({ arrangementId }: ArrangementPartListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 獲取聲部資料
  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["arrangement-parts", arrangementId],
    queryFn: () => getPartsByArrangementId(arrangementId),
    enabled: !!arrangementId
  });

  // 篩選和排序聲部
  const filteredAndSortedParts = parts
    .filter((part) => part.label.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.label.localeCompare(b.label, "zh-TW");
      } else if (sortBy === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  return (
    <VStack gap={6} align="stretch" mt={8}>
      {/* 篩選和搜尋區域 */}
      <PartFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        totalCount={parts.length}
        filteredCount={filteredAndSortedParts.length}
      />

      {/* 未分類聲部區段 */}
      <PartCategorySection title="未分類" parts={filteredAndSortedParts} isLoading={isLoading} />
    </VStack>
  );
}
