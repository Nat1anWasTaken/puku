import { Box, Button, Center, Container, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { HiExclamationCircle, HiExclamationTriangle } from "react-icons/hi2";

type ErrorPageProps = {
  params: Promise<{ error: string; error_description: string; error_code: string }>;
};

export default async function ErrorPage({ params }: ErrorPageProps) {
  const { error, error_description, error_code } = await params;

  const errorDescription = error_description;
  const errorCode = error_code;

  const getErrorMessage = () => {
    if (errorDescription) {
      return decodeURIComponent(errorDescription);
    }

    switch (error) {
      case "access_denied":
        return "存取被拒絕。您可能已取消授權或沒有權限。";
      case "server_error":
        return "伺服器發生錯誤。請稍後再試。";
      case "temporarily_unavailable":
        return "服務暫時無法使用。請稍後再試。";
      case "invalid_request":
        return "無效的請求。";
      case "invalid_client":
        return "無效的客戶端。";
      case "invalid_grant":
        return "無效的授權。";
      case "unauthorized_client":
        return "未授權的客戶端。";
      case "unsupported_grant_type":
        return "不支援的授權類型。";
      case "invalid_scope":
        return "無效的範圍。";
      default:
        return error ? `發生未知錯誤：${error}` : "發生未知錯誤。";
    }
  };

  return (
    <Center minH="full">
      <Container maxW="md">
        <VStack gap={8} align="center">
          <VStack gap={4} textAlign="center">
            <Box color="fg.error" fontSize="48px">
              <HiExclamationTriangle />
            </Box>
            <Heading size="xl">認證錯誤</Heading>
            <Text fontSize="sm" color="fg.muted">
              登入過程中發生錯誤
            </Text>
          </VStack>

          <Box w="full" bg="bg.error" border="1px" borderColor="border.error" borderRadius="md" p={4}>
            <VStack gap={2} align="stretch">
              <HStack align="center" gap={2}>
                <Box color="fg.error" fontSize="20px">
                  <HiExclamationCircle />
                </Box>
                <Heading size="sm" color="fg.error">
                  錯誤詳情
                </Heading>
              </HStack>
              <Text color="fg.error" fontSize="sm">
                {getErrorMessage()}
              </Text>
              {errorCode && (
                <Text color="fg.error" fontSize="sm">
                  錯誤代碼：{errorCode}
                </Text>
              )}
            </VStack>
          </Box>

          <VStack gap={4} w="full">
            <Link href="/" w="full">
              <Button w="full">返回首頁</Button>
            </Link>

            <Link href="/auth/login" w="full">
              <Button w="full" variant="outline">
                登入
              </Button>
            </Link>
          </VStack>

          {/* Show all parameters in development mode */}
          {process.env.NODE_ENV === "development" && (
            <Box w="full" bg="bg.muted" borderRadius="md" p={4}>
              <Heading size="sm" mb={2}>
                除錯資訊（僅開發模式）
              </Heading>
              <VStack gap={1} align="stretch">
                {Object.entries({ error, error_description, error_code }).map(([key, value]) => (
                  <HStack key={key} fontSize="xs" color="fg.muted">
                    <Text fontWeight="bold">{key}:</Text>
                    <Text>{value}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Center>
  );
}
