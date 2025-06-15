"use client";

import { toaster } from "@/components/ui/toaster";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Center, Heading, Input, Link, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuthError = useCallback((error: unknown) => {
    let errorMessage = "未知錯誤";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    toaster.error({
      title: "註冊失敗",
      description: errorMessage
    });
  }, []);

  const handleRegisterWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      // OAuth 註冊會自動重定向，所以不需要手動導航
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthError, supabase]);

  const handleEmailPasswordRegister = useCallback(async () => {
    // 檢查密碼是否匹配
    if (password !== confirmPassword) {
      toaster.error({
        title: "註冊失敗",
        description: "密碼不匹配"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/email-confirmed`
        }
      });

      if (error) throw error;

      toaster.success({
        title: "註冊成功",
        description: "請檢查您的電子郵件以驗證帳戶"
      });

      router.push("/auth/login");
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmPassword, router, handleAuthError, supabase]);

  return (
    <Card.Root w="md">
      <Card.Header>
        <Center>
          <Heading>註冊</Heading>
        </Center>
        <Text color="fg.subtle" textAlign="center">
          創建您的帳戶以開始使用
        </Text>
      </Card.Header>
      <Card.Body>
        <Button w="full" onClick={handleRegisterWithGoogle} loading={isLoading} loadingText="創建帳戶中" disabled>
          使用 Google 註冊
        </Button>
        <VStack
          mt="4"
          as="form"
          gap="4"
          onSubmit={(e) => {
            e.preventDefault();
            handleEmailPasswordRegister();
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
          <Text w="full" textAlign="left" fontWeight="bold">
            確認密碼
          </Text>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="請確認您的密碼" required w="full" size="md" />
          <Button w="full" type="submit" colorScheme="blue" loading={isLoading} loadingText="創建帳戶中">
            註冊
          </Button>
        </VStack>
        <Text textAlign="center" mt="4" color="fg.subtle">
          已經有帳戶？ <Link href="/auth/login">登入</Link>
        </Text>
      </Card.Body>
    </Card.Root>
  );
}
