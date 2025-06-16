"use client";

import { getAvailableCategoriesByArrangementId, getPartsByArrangementId } from "@/lib/services/part-service";
import { createClient } from "@/lib/supabase/client";
import { VStack } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PartCategorySection } from "./part-category-section";
import { PartCategorySectionSkeleton } from "./part-category-section-skeleton";
import { PartFilters } from "./part-filters";

interface ArrangementPartListingProps {
  arrangementId: string;
}

export function ArrangementPartListing({ arrangementId }: ArrangementPartListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 獲取編曲資料（包含 file_path）
  const { data: arrangement } = useQuery({
    queryKey: ["arrangement", arrangementId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("arrangements").select("*").eq("id", arrangementId).single();

      if (error) throw error;
      return data;
    },
    enabled: !!arrangementId
  });

  // 獲取聲部資料
  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["arrangement-parts", arrangementId],
    queryFn: () => getPartsByArrangementId(arrangementId),
    enabled: !!arrangementId
  });

  // 獲取可用分類
  const { data: availableCategories = [] } = useQuery({
    queryKey: ["arrangement-categories", arrangementId],
    queryFn: () => getAvailableCategoriesByArrangementId(arrangementId),
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

  // 按分類分組聲部
  const partsByCategory = useMemo(() => {
    const grouped: Record<string, typeof filteredAndSortedParts> = {};

    // 初始化所有分類
    availableCategories.forEach((category) => {
      grouped[category] = [];
    });

    // 初始化未分類
    grouped["未分類"] = [];

    // 分組聲部
    filteredAndSortedParts.forEach((part) => {
      const category = part.category || "未分類";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(part);
    });

    return grouped;
  }, [filteredAndSortedParts, availableCategories]);

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

      {/* 按分類顯示聲部 */}
      {arrangement ? (
        <>
          {availableCategories.map((category) => {
            const categoryParts = partsByCategory[category] || [];
            // 只顯示有聲部的分類
            if (categoryParts.length === 0) return null;

            return <PartCategorySection key={category} title={category} parts={categoryParts} isLoading={isLoading} arrangement={arrangement} />;
          })}

          {/* 未分類聲部區段 - 只在有未分類聲部時顯示 */}
          {(partsByCategory["未分類"]?.length > 0 || isLoading) && <PartCategorySection title="未分類" parts={partsByCategory["未分類"] || []} isLoading={isLoading} arrangement={arrangement} />}
        </>
      ) : (
        <>
          {availableCategories.map((category) => (
            <PartCategorySectionSkeleton key={category} />
          ))}
          <PartCategorySectionSkeleton />
        </>
      )}
    </VStack>
  );
}
