import { Tables } from "@/lib/supabase/types";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { Badge, Box, Card, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { ArrangementThumbnailImage } from "../library/arrangement-thumbnail-image";

type Arrangement = Tables<"arrangements">;

interface ArrangementDetailsHeaderProps {
  arrangement: Arrangement;
}

export async function ArrangementDetailsHeader({ arrangement }: ArrangementDetailsHeaderProps) {
  return (
    <Card.Root>
      <Card.Body p={6}>
        <Flex direction={{ base: "column", md: "row" }} gap={6} align="start">
          {/* 縮略圖區域 */}
          <Box flexShrink={0} w={{ base: "full", md: "300px" }}>
            <Box w="full" aspectRatio={1 / 1.4142} overflow="hidden" borderRadius="lg" shadow="md">
              <ArrangementThumbnailImage title={arrangement.title} filePath={arrangement.file_path} arrangementId={arrangement.id} w="full" h="full" />
            </Box>
          </Box>

          {/* 編曲資訊區域 */}
          <VStack align="stretch" gap={4} flex={1} h="full">
            {/* 標題 */}
            <Heading size="2xl" lineHeight="1.2">
              {arrangement.title}
            </Heading>

            {/* 作曲家 */}
            <VStack align="stretch" gap={1}>
              <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                作曲家
              </Text>
              <Text fontSize="lg" color="fg.default">
                {arrangement.composers.join(", ")}
              </Text>
            </VStack>

            {/* 樂團類型和可見性 */}
            <HStack gap={3} wrap="wrap">
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                  樂團類型
                </Text>
                <Badge variant="subtle" size="md">
                  {snakeCaseToTitleCase(arrangement.ensemble_type)}
                </Badge>
              </VStack>

              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                  可見性
                </Text>
                <Badge variant={arrangement.visibility === "public" ? "solid" : "outline"} colorPalette={arrangement.visibility === "public" ? "green" : "gray"} size="md">
                  {arrangement.visibility === "public" ? "公開" : arrangement.visibility === "unlisted" ? "不公開" : "私人"}
                </Badge>
              </VStack>
            </HStack>

            {/* 創建日期 */}
            <VStack align="stretch" gap={1}>
              <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                建立日期
              </Text>
              <Text fontSize="md" color="fg.default">
                {new Date(arrangement.created_at).toLocaleDateString("zh-TW", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </Text>
            </VStack>
          </VStack>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
