import { VStack, Skeleton, Box, Container } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Container maxW="4xl" py={8}>
      <VStack gap={6} align="stretch">
        {/* 頁面標題和導航 */}
        <Box>
          <Skeleton height="40px" width="200px" mb={4} />
          <Skeleton height="32px" width="300px" />
        </Box>

        {/* 編輯表單骨架 */}
        <VStack gap={4} align="stretch">
          {/* 標題輸入框 */}
          <Box>
            <Skeleton height="20px" width="80px" mb={2} />
            <Skeleton height="40px" width="100%" />
          </Box>

          {/* 作曲家列表 */}
          <Box>
            <Skeleton height="20px" width="60px" mb={2} />
            <VStack gap={2}>
              <Skeleton height="40px" width="100%" />
              <Skeleton height="40px" width="100%" />
            </VStack>
          </Box>

          {/* 合奏類型 */}
          <Box>
            <Skeleton height="20px" width="80px" mb={2} />
            <Skeleton height="40px" width="100%" />
          </Box>

          {/* 可見性設定 */}
          <Box>
            <Skeleton height="20px" width="60px" mb={2} />
            <Skeleton height="40px" width="100%" />
          </Box>
        </VStack>

        {/* 操作按鈕 */}
        <VStack gap={2}>
          <Skeleton height="40px" width="120px" />
          <Skeleton height="40px" width="100px" />
        </VStack>
      </VStack>
    </Container>
  );
}
