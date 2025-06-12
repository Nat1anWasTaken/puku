"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, VStack, HStack, Box, Button, Text, IconButton, Alert } from "@chakra-ui/react";
import { ArrowLeft, Save, X } from "lucide-react";
import { ArrangementWithDetails } from "@/lib/services/arrangement-service-server";
import { useArrangementActions } from "@/hooks/use-arrangements";
import { toaster } from "@/components/ui/toaster";

interface ArrangementEditPageProps {
  arrangement: ArrangementWithDetails;
  userId: string;
}

export function ArrangementEditPage({ arrangement, userId }: ArrangementEditPageProps) {
  const router = useRouter();
  const { editArrangement, isUpdating } = useArrangementActions();

  // 表單狀態
  const [title, setTitle] = useState(arrangement.title);
  const [composers, setComposers] = useState(arrangement.composers);
  const [ensembleType, setEnsembleType] = useState(arrangement.ensemble_type);
  const [visibility, setVisibility] = useState(arrangement.visibility);

  // 暫時使用這些setter來避免linter警告，實際表單將在第三階段實施
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = { setTitle, setComposers, setEnsembleType, setVisibility };

  // 追蹤是否有未保存的更改
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 檢查表單是否有效
  const isFormValid = title.trim().length >= 3 && composers.some((c) => c.trim().length > 0);

  // 檢查是否有更改
  const hasChanges =
    title !== arrangement.title || JSON.stringify(composers) !== JSON.stringify(arrangement.composers) || ensembleType !== arrangement.ensemble_type || visibility !== arrangement.visibility;

  const handleSave = async () => {
    if (!isFormValid) {
      toaster.error({
        title: "表單驗證失敗",
        description: "請確保標題至少3個字符，且至少有一個作曲家"
      });
      return;
    }

    const success = await editArrangement(arrangement.id, userId, {
      title: title.trim(),
      composers: composers.filter((c) => c.trim().length > 0),
      ensembleType,
      visibility
    });

    if (success) {
      setHasUnsavedChanges(false);
      router.push("/library");
    }
  };

  const handleCancel = () => {
    if (hasChanges && hasUnsavedChanges) {
      if (window.confirm("您有未保存的更改。確定要離開嗎？")) {
        router.push("/library");
      }
    } else {
      router.push("/library");
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm("您有未保存的更改。確定要離開嗎？")) {
        router.push("/library");
      }
    } else {
      router.push("/library");
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack gap={6} align="stretch">
        {/* 頁面標題和導航 */}
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            <IconButton size="sm" variant="ghost" onClick={handleBack} aria-label="返回樂譜庫">
              <ArrowLeft size={20} />
            </IconButton>
            <VStack align="start" gap={0}>
              <Text fontSize="2xl" fontWeight="bold">
                編輯編曲
              </Text>
              <Text fontSize="md" color="gray.600">
                {arrangement.title}
              </Text>
            </VStack>
          </HStack>

          <HStack gap={2}>
            <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
              <X size={16} />
              取消
            </Button>
            <Button colorScheme="blue" onClick={handleSave} disabled={!isFormValid || !hasChanges || isUpdating} loading={isUpdating} loadingText="保存中...">
              <Save size={16} />
              保存變更
            </Button>
          </HStack>
        </HStack>

        {/* 未保存更改提醒 */}
        {hasChanges && (
          <Alert.Root status="warning" borderRadius="md">
            <Alert.Indicator />
            <Text>您有未保存的更改</Text>
          </Alert.Root>
        )}

        {/* 編輯表單區域 */}
        <Box>
          {/* 這裡將在第三階段添加詳細的編輯表單組件 */}
          <Text color="gray.500" textAlign="center" py={8}>
            編輯表單將在下一階段實施
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
