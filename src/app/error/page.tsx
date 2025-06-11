"use client";

import { Box, Button, Center, Container, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { HiExclamationCircle, HiExclamationTriangle } from "react-icons/hi2";

export default function ErrorPage() {
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const errorCode = searchParams.get("error_code");

  const getErrorMessage = () => {
    if (errorDescription) {
      return decodeURIComponent(errorDescription);
    }

    switch (error) {
      case "access_denied":
        return "Access denied. You may have cancelled authorization or do not have permission.";
      case "server_error":
        return "A server error occurred. Please try again later.";
      case "temporarily_unavailable":
        return "The service is temporarily unavailable. Please try again later.";
      case "invalid_request":
        return "Invalid request.";
      case "invalid_client":
        return "Invalid client.";
      case "invalid_grant":
        return "Invalid grant.";
      case "unauthorized_client":
        return "Unauthorized client.";
      case "unsupported_grant_type":
        return "Unsupported grant type.";
      case "invalid_scope":
        return "Invalid scope.";
      default:
        return error ? `Unknown error occurred: ${error}` : "An unknown error occurred.";
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
              <Button w="full">Go Back to Home</Button>
            </Link>

            <Link href="/auth/login" w="full">
              <Button w="full" variant="outline">
                Login
              </Button>
            </Link>
          </VStack>

          {/* Show all parameters in development mode */}
          {process.env.NODE_ENV === "development" && (
            <Box w="full" bg="bg.muted" borderRadius="md" p={4}>
              <Heading size="sm" mb={2}>
                Debug Info (Development Only)
              </Heading>
              <VStack gap={1} align="stretch">
                {Array.from(searchParams.entries()).map(([key, value]) => (
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
