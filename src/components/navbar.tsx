"use client";

import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { Avatar, Button, Flex, Heading, HStack, Link, Menu, Portal, Text } from "@chakra-ui/react";
import { LoaderCircle, UserIcon } from "lucide-react";
import { useCallback } from "react";
import { toaster } from "./ui/toaster";

export function Navbar() {
  const { user, isLoading } = useUser();
  const supabase = createClient();

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toaster.success({
        title: "登出成功",
        description: "您已成功登出"
      });
    } catch (error) {
      toaster.error({
        title: "登出失敗",
        description: error instanceof Error ? error.message : String(error)
      });
    }
  }, [supabase]);

  return (
    <Flex direction="row" justify="space-between" align="center" p={4}>
      {/* 左側區塊 */}
      <HStack gap={2} align="center">
        <Link href="/">
          <Heading fontSize="xl">Puku</Heading>
        </Link>
      </HStack>

      {/* 右側區塊 */}
      <HStack gap={4}>
        {isLoading && <LoaderCircle className="animate-spin" />}
        {user ? (
          <>
            <Button asChild variant="outline">
              <Link href="/upload">上傳編曲</Link>
            </Button>
            <Menu.Root>
              <Menu.Trigger>
                <Avatar.Root>
                  <Avatar.Fallback className="flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                    <Text className="text-sm">{user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}</Text>
                  </Avatar.Fallback>
                  <Avatar.Image src={user.user_metadata?.avatar_url} />
                </Avatar.Root>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value="library" asChild>
                      <Link href="/library">我的樂譜庫</Link>
                    </Menu.Item>
                    <Menu.Item value="logout" onClick={handleSignOut}>
                      登出
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </>
        ) : (
          <Button asChild>
            <Link href="/auth/login">登入</Link>
          </Button>
        )}
      </HStack>
    </Flex>
  );
}
