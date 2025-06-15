"use client";

import { HStack, Select, Text, VStack, createListCollection } from "@chakra-ui/react";

interface PartSortControlsProps {
  sortBy: "name" | "created_at";
  onSortByChange: (sortBy: "name" | "created_at") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
}

const sortByOptions = createListCollection({
  items: [
    { label: "名稱", value: "name" },
    { label: "建立日期", value: "created_at" }
  ]
});

const sortOrderOptions = createListCollection({
  items: [
    { label: "升序", value: "asc" },
    { label: "降序", value: "desc" }
  ]
});

export function PartSortControls({ sortBy, onSortByChange, sortOrder, onSortOrderChange }: PartSortControlsProps) {
  return (
    <HStack gap={3}>
      <VStack align="stretch" gap={2}>
        <Text fontSize="sm" fontWeight="medium" color="fg.muted">
          排序方式
        </Text>
        <Select.Root
          collection={sortByOptions}
          value={[sortBy]}
          onValueChange={(details) => onSortByChange(details.value[0] as "name" | "created_at")}
          size="sm"
          width="100px"
          positioning={{ sameWidth: true }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Content zIndex={9999}>
              {sortByOptions.items.map((option) => (
                <Select.Item key={option.value} item={option}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </VStack>

      <VStack align="stretch" gap={2}>
        <Text fontSize="sm" fontWeight="medium" color="fg.muted">
          順序
        </Text>
        <Select.Root
          collection={sortOrderOptions}
          value={[sortOrder]}
          onValueChange={(details) => onSortOrderChange(details.value[0] as "asc" | "desc")}
          size="sm"
          width="100px"
          positioning={{ sameWidth: true }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Select.Positioner>
            <Select.Content zIndex={9999}>
              {sortOrderOptions.items.map((option) => (
                <Select.Item key={option.value} item={option}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </VStack>
    </HStack>
  );
}
