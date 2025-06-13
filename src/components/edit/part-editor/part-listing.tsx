"use client";

import { Part } from "@/lib/services/part-service";
import { Card, Text, VStack } from "@chakra-ui/react";
import { PartItem } from "./part-item";

interface PartWithColor extends Part {
  color: string;
  name: string;
}

interface PartListingProps {
  parts: PartWithColor[];
  onDeletePart: (id: number) => void;
  isLoading?: boolean;
  arrangementId?: string;
  filePath?: string;
}

export function PartListing({ parts, onDeletePart, isLoading, arrangementId, filePath }: PartListingProps) {
  return (
    <Card.Root>
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
                onDelete={onDeletePart}
                arrangementId={arrangementId}
                filePath={filePath}
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
