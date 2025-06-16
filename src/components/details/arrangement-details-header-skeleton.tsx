import { Badge, Box, Card, Flex, Heading, HStack, Skeleton, Text, VStack } from "@chakra-ui/react";

export function ArrangementDetailsHeaderSkeleton() {
  return (
    <Card.Root>
      <Card.Body p={6}>
        <Flex direction={{ base: "column", md: "row" }} gap={6} align="start">
          {/* 縮略圖區域 */}
          <Box flexShrink={0} w={{ base: "full", md: "300px" }}>
            <Box w="full" aspectRatio={1 / 1.4142} overflow="hidden" borderRadius="lg" shadow="md">
              <Skeleton w="full" h="full" />
            </Box>
          </Box>

          {/* 編曲資訊區域 */}
          <VStack align="stretch" gap={4} flex={1} h="full">
            {/* 標題 */}
            <Skeleton>
              <Heading size="2xl" lineHeight="1.2">
                正在載入編曲資訊...
              </Heading>
            </Skeleton>

            {/* 作曲家 */}
            <VStack align="stretch" gap={1}>
              <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                作曲家
              </Text>
              <Skeleton>
                <Text fontSize="lg" color="fg.default">
                  正在載入作曲家...
                </Text>
              </Skeleton>
            </VStack>

            {/* 樂團類型和可見性 */}
            <HStack gap={3} wrap="wrap">
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                  樂團類型
                </Text>
                <Skeleton>
                  <Badge variant="subtle" size="md">
                    正在載入樂團類型...
                  </Badge>
                </Skeleton>
              </VStack>

              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                  可見性
                </Text>
                <Skeleton>
                  <Badge variant="outline" colorPalette="gray" size="md">
                    正在載入可見性...
                  </Badge>
                </Skeleton>
              </VStack>
            </HStack>

            {/* 創建日期 */}
            <VStack align="stretch" gap={1}>
              <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                建立日期
              </Text>
              <Skeleton>
                <Text fontSize="md" color="fg.default">
                  正在載入建立日期...
                </Text>
              </Skeleton>
            </VStack>
          </VStack>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
