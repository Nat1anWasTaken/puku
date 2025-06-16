"use client";

import { useUser } from "@/hooks/use-user";
import { Box, Button, Card, Center, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { CheckCircle, Home, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmailConfirmedPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoToLogin = () => {
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Text>載入中...</Text>
      </Center>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <Flex justify="center">
        <Card.Root maxW="md" w="full">
          <Card.Body>
            <VStack gap={6} textAlign="center">
              <Box color="fg.success" p={4} borderRadius="full">
                <CheckCircle size={64} />
              </Box>
              <VStack gap={2}>
                <Heading size="lg" color="fg.success">
                  電子郵件已確認！
                </Heading>
                <Text color="fg.muted">您的電子郵件地址已成功驗證。</Text>
              </VStack>
              <VStack gap={3} w="full">
                <Button onClick={handleGoHome} colorScheme="fg.success" size="lg" w="full">
                  <Home size={16} />
                  前往首頁
                </Button>
                {!user && (
                  <Button onClick={handleGoToLogin} variant="outline" size="lg" w="full">
                    <LogIn size={16} />
                    登入帳戶
                  </Button>
                )}
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Flex>
    </Container>
  );
}
