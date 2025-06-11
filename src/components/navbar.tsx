"use client";

import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  Avatar,
  Button,
  Flex,
  Heading,
  HStack,
  Link,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LoaderCircle, UserIcon } from "lucide-react";
import { toaster } from "./ui/toaster";
import { useCallback } from "react";

export function Navbar() {
  const { user, isLoading } = useAuth(auth);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      toaster.success({
        title: "Logged out",
        description: "You have been logged out",
      });
    } catch (error) {
      toaster.error({
        title: "Failed to logout",
        description: error as string,
      });
    }
  }, []);

  return (
    <Flex direction="row" justify="space-between" align="center" p={4}>
      {/* Left part */}
      <HStack>
        <Link href="/">
          <Heading fontSize="xl">Puku</Heading>
        </Link>
      </HStack>

      {/* Right part */}
      <HStack>
        {isLoading && <LoaderCircle className="animate-spin" />}
        {user ? (
          <Menu.Root>
            <Menu.Trigger>
              <Avatar.Root>
                <Avatar.Fallback className="flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                  <Text className="text-sm">{user.displayName?.charAt(0)}</Text>
                </Avatar.Fallback>
                <Avatar.Image src={user.photoURL ?? ""} />
              </Avatar.Root>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item value="logout" onClick={handleSignOut}>
                    Logout
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </HStack>
    </Flex>
  );
}
