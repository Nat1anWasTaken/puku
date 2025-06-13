"use client";

import { Badge, Box, Button, Card, HStack, Input, Text, VStack } from "@chakra-ui/react";
import { Plus } from "lucide-react";

interface PartCreatorFormProps {
  selectedPages: Set<number>;
  partLabel: string;
  onPartLabelChange: (label: string) => void;
  onCreatePart: () => void;
  isCreating?: boolean;
}

export function PartCreatorForm({ selectedPages, partLabel, onPartLabelChange, onCreatePart, isCreating }: PartCreatorFormProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>創建新聲部</Card.Title>
      </Card.Header>
      <Card.Body>
        <VStack gap={4} align="stretch">
          {selectedPages.size > 0 && (
            <Box>
              <Text fontSize="sm" color="fg.muted" mb={2}>
                已選擇頁面：
              </Text>
              <HStack gap={2} flexWrap="wrap">
                {Array.from(selectedPages)
                  .sort((a, b) => a - b)
                  .map((pageNum) => (
                    <Badge key={pageNum} colorScheme="blue">
                      P{pageNum}
                    </Badge>
                  ))}
              </HStack>
            </Box>
          )}

          <Box>
            <Text fontSize="sm" color="fg.muted" mb={2}>
              聲部標籤：
            </Text>
            <Input placeholder="輸入聲部名稱（例如：小提琴、鋼琴、人聲等）" value={partLabel} onChange={(e) => onPartLabelChange(e.target.value)} />
          </Box>

          <Button onClick={onCreatePart} disabled={selectedPages.size === 0 || !partLabel.trim()} loading={isCreating} loadingText="創建中..." colorScheme="blue">
            <Plus size={16} />
            創建聲部
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
