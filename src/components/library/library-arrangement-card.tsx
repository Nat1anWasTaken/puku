"use client";

import { snakeCaseToTitleCase } from "@/lib/utils";
import { Badge, Box, Card, Heading, HStack, IconButton, Link, Text, VStack } from "@chakra-ui/react";
import { Edit, Eye } from "lucide-react";
import { ArrangementThumbnailImage } from "./arrangement-thumbnail-image";

interface Arrangement {
  id: string;
  title: string;
  composers: string[];
  ensemble_type: string;
  created_at: string;
  visibility: string;
  file_path: string | null;
  preview_path: string | null;
}

interface LibraryArrangementCardProps {
  arrangement: Arrangement;
  onView: (id: string) => void;
}

export function LibraryArrangementCard({ arrangement, onView }: LibraryArrangementCardProps) {
  return (
    <Card.Root overflow="hidden" h="full">
      <Box position="relative">
        <ArrangementThumbnailImage title={arrangement.title} filePath={arrangement.file_path} arrangementId={arrangement.id} w="full" h="200px" />

        {/* 可見性標籤 */}
        <Badge position="absolute" top="2" left="2" colorScheme={arrangement.visibility === "public" ? "green" : "gray"} size="sm">
          {arrangement.visibility === "public" ? "公開" : "私人"}
        </Badge>

        {/* 操作按鈕 */}
        <HStack position="absolute" top="2" right="2" gap={1}>
          <IconButton size="xs" variant="ghost" onClick={() => onView(arrangement.id)} aria-label="查看編曲">
            <Eye size={12} />
          </IconButton>
          <Link href={`/edit/${arrangement.id}`}>
            <IconButton size="xs" variant="ghost" aria-label="編輯編曲">
              <Edit size={12} />
            </IconButton>
          </Link>
        </HStack>
      </Box>

      <Card.Body>
        <VStack align="start" gap={3}>
          <VStack align="start" gap={1} w="full">
            <Heading size="md" lineClamp={2}>
              {arrangement.title}
            </Heading>
            <Text color="fg.muted" fontSize="sm" lineClamp={1}>
              作曲：{arrangement.composers.join(", ")}
            </Text>
          </VStack>

          <HStack justify="space-between" w="full">
            <Badge variant="outline" size="sm">
              {snakeCaseToTitleCase(arrangement.ensemble_type)}
            </Badge>
            <Text color="fg.muted" fontSize="xs">
              {new Date(arrangement.created_at).toLocaleDateString("zh-TW")}
            </Text>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export type { Arrangement };
