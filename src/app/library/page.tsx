"use client";

import { Container, VStack, Center, Text } from "@chakra-ui/react";
import { LibraryHeader, LibraryStats, LibrarySkeleton, ArrangementGrid, EmptyLibrary } from "@/components/library";
import { useUser } from "@/hooks/use-user";
import { useArrangements } from "@/hooks/use-arrangements";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const { user, isLoading: userLoading } = useUser();
  const { arrangements, isLoading: arrangementsLoading } = useArrangements(user?.id || "");

  const router = useRouter();
  const supabase = createClient();

  const handleUpload = () => {
    router.push("/upload");
  };

  const handleView = async (id: string) => {
    const arrangement = arrangements.find((arr) => arr.id === id);
    if (!arrangement?.file_path) {
      console.error("檔案路徑不存在");
      return;
    }

    try {
      const { data } = await supabase.storage.from("arrangements").createSignedUrl(arrangement.file_path, 60);
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error) {
      console.error("開啟檔案失敗:", error);
    }
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
        {isLoading ? <LibrarySkeleton /> : arrangements.length > 0 ? <ArrangementGrid arrangements={arrangements} onView={handleView} /> : <EmptyLibrary onUpload={handleUpload} />}
      </VStack>
    </Container>
  );
}
