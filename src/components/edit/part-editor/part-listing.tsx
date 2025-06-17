"use client";

import { Part } from "@/lib/services/part-service";
import { BoxProps, Card, Text, VStack } from "@chakra-ui/react";
import { PartItem } from "./part-item";

interface PartWithColor extends Part {
  color: string;
  name: string;
}

interface PartListingProps extends BoxProps {
  parts: PartWithColor[];
  availableCategories: string[];
  onDeletePart: (id: string) => void;
  onCategoryChange: (partId: string, category: string | null) => void;
  onCreateCategory: (category: string) => void;
  isLoading?: boolean;
}

export function PartListing({ parts, availableCategories, onDeletePart, onCategoryChange, onCreateCategory, isLoading, ...boxProps }: PartListingProps) {
  return (
    <Card.Root {...boxProps}>
      <Card.Header>
        <Card.Title>聲部</Card.Title>
        <Text fontSize="sm" color="fg.muted">
          管理編曲的聲部分配
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack gap={4} align="stretch">
          {isLoading ? (
            <Text>載入聲部中...</Text>
          ) : parts.length > 0 ? (
            parts.map((part) => (
              <PartItem
                key={part.id}
                id={part.id}
                name={part.name}
                startPage={part.start_page}
                endPage={part.end_page}
                color={part.color}
                category={part.category}
                availableCategories={availableCategories}
                onDelete={onDeletePart}
                onCategoryChange={onCategoryChange}
                onCreateCategory={onCreateCategory}
              />
            ))
          ) : (
            <Text color="fg.muted">尚未創建任何聲部</Text>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
