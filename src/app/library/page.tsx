"use client";

import { EmptyLibrary, LibraryHeader, LibrarySkeleton, LibraryStats } from "@/components/library";
import { LibraryArrangementGrid } from "@/components/library/library-arrangement-grid";
import { useArrangements } from "@/hooks/use-arrangements";
import { useUser } from "@/hooks/use-user";
import { Center, Container, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const { user, isLoading: userLoading } = useUser();
  const { arrangements, isLoading: arrangementsLoading } = useArrangements(user?.id || "");

  const router = useRouter();

  const handleUpload = () => {
    router.push("/upload");
  };

  // 如果用戶未登入
  if (userLoading) {
    return (
      <Center minH="full">
        <Text>載入中...</Text>
      </Center>
    );
  }

  if (!user) {
    return (
      <Center minH="full">
        <Text>請先登入以查看您的圖書館</Text>
      </Center>
    );
  }

  const isLoading = arrangementsLoading;

  return (
    <Container maxW="7xl" py={8}>
      <VStack align="start" gap={6} w="full">
        {/* 頁面標題和操作 */}
        <LibraryHeader onUpload={handleUpload} />

        {/* 統計信息 */}
        <LibraryStats arrangements={arrangements} />

        {/* 編曲列表 */}
        {isLoading ? <LibrarySkeleton /> : arrangements.length > 0 ? <LibraryArrangementGrid arrangements={arrangements} /> : <EmptyLibrary onUpload={handleUpload} />}
      </VStack>
    </Container>
  );
}
