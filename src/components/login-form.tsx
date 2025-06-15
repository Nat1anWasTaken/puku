"use client";

import { toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/client";

import { Button, Card, Center, Heading, Input, Link, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuthError = useCallback((error: unknown) => {
    let errorMessage = "未知錯誤";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toaster.error({
      title: "登入失敗",
      description: errorMessage
    });
  }, []);

  const handleLoginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      // OAuth 登入會自動重定向，所以不需要手動導航
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthError, supabase]);

  const handleEmailPasswordLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      router.push("/");
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router, handleAuthError, supabase]);

  return (
    <Card.Root w="md">
      <Card.Header>
        <Center>
          <Heading>登入</Heading>
        </Center>
        <Text color="fg.subtle" textAlign="center">
          登入您的帳戶以繼續
        </Text>
      </Card.Header>
      <Card.Body>
        <Button w="full" onClick={handleLoginWithGoogle} loading={isLoading} loadingText="登入中" disabled>
          使用 Google 登入
        </Button>
        <VStack
          mt="4"
          as="form"
          gap="4"
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailPasswordLogin();
          }}
        >
          <Text w="full" textAlign="left" fontWeight="bold">
            電子郵件
          </Text>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="請輸入您的電子郵件" required w="full" size="md" />
          <Text w="full" textAlign="left" fontWeight="bold">
            密碼
          </Text>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="請輸入您的密碼" required w="full" size="md" />
          <Button w="full" type="submit" colorScheme="blue" loading={isLoading} loadingText="登入中">
            登入
          </Button>
        </VStack>
        <Text textAlign="center" mt="4" color="fg.subtle">
          還沒有帳戶？ <Link href="/auth/register">註冊</Link>
        </Text>
      </Card.Body>
    </Card.Root>
  );
}
