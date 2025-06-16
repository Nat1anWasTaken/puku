"use client";

import { extractMusicSheetMetadata } from "@/ai/flows/extract-music-sheet-metadata";
import { DeleteArrangementDialog } from "@/components/library/delete-arrangement-dialog";
import { toaster } from "@/components/ui/toaster";
import { useArrangementActions } from "@/hooks/use-arrangements";
import { ArrangementWithDetails } from "@/lib/services/arrangement-service-server";
import { createClient } from "@/lib/supabase/client";
import { Constants, Database } from "@/lib/supabase/types";
import { Alert, Button, Container, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Sparkles, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrangementEditForm } from "./arrangement-edit-form";
import { AutoSaveIndicator } from "./auto-save-indicator";

interface ArrangementEditPageProps {
  arrangement: ArrangementWithDetails;
}

export function ArrangementEditPage({ arrangement }: ArrangementEditPageProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack gap={6} align="stretch">
          <Text>載入中...</Text>
        </VStack>
      </Container>
    );
  }

  return <ArrangementEditPageClient arrangement={arrangement} />;
}

function ArrangementEditPageClient({ arrangement }: ArrangementEditPageProps) {
  const router = useRouter();

  const supabase = createClient();

  const queryClient = useQueryClient();

  const { editArrangement, removeArrangement, isUpdating, isDeleting } = useArrangementActions();

  // 表單狀態
  const [title, setTitle] = useState(arrangement.title);
  const [composers, setComposers] = useState(arrangement.composers);
  const [ensembleType, setEnsembleType] = useState<Database["public"]["Enums"]["ensemble_type"]>(arrangement.ensemble_type);
  const [visibility, setVisibility] = useState<Database["public"]["Enums"]["visibility"]>(arrangement.visibility);

  // 追蹤是否有未保存的更改
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 自動保存相關狀態
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 刪除對話框狀態
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // AI 生成狀態
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);

  // 檢查表單是否有效
  const isFormValid = title.trim().length >= 3 && composers.some((c) => c.trim().length > 0);

  // 檢查是否有更改
  const hasChanges =
    title !== arrangement.title || JSON.stringify(composers) !== JSON.stringify(arrangement.composers) || ensembleType !== arrangement.ensemble_type || visibility !== arrangement.visibility;

  // 自動保存草稿功能
  const autoSaveDraft = useCallback(async () => {
    if (!hasChanges || !isFormValid) return;

    setIsAutoSaving(true);
    try {
      // 這裡可以保存到本地存儲或者發送到服務器作為草稿
      localStorage.setItem(
        `arrangement-draft-${arrangement.id}`,
        JSON.stringify({
          title: title.trim(),
          composers: composers.filter((c) => c.trim().length > 0),
          ensembleType,
          visibility,
          lastSaved: new Date().toISOString()
        })
      );
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("自動保存失敗:", error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [arrangement.id, title, composers, ensembleType, visibility, hasChanges, isFormValid]);

  // 定期自動保存
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && !isAutoSaving) {
        autoSaveDraft();
      }
    }, 30000); // 每30秒自動保存一次

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, isAutoSaving, autoSaveDraft]);

  const handleSave = async () => {
    if (!isFormValid) {
      toaster.error({
        title: "表單驗證失敗",
        description: "請確保標題至少3個字符，且至少有一個作曲家"
      });
      return;
    }

    const success = await editArrangement(arrangement.id, {
      title: title.trim(),
      composers: composers.filter((c) => c.trim().length > 0),
      ensemble_type: ensembleType as Database["public"]["Enums"]["ensemble_type"],
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

  const handleDelete = async () => {
    const success = await removeArrangement(arrangement.id);
    if (success) {
      router.push("/library");
    }
  };

  // AI 生成元數據處理函數
  const handleGenerateWithAI = async () => {
    if (!arrangement.file_path) {
      toaster.error({
        title: "無法使用 AI 生成",
        description: "此編曲沒有關聯的 PDF 檔案"
      });
      return;
    }

    setIsGeneratingWithAI(true);
    try {
      // 準備可用的合奏類型 - 轉換為人類可讀的格式
      const availableEnsembleTypes = Constants.public.Enums.ensemble_type.map((type) => type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));

      const { data, error } = await supabase.storage.from("arrangements").createSignedUrl(arrangement.file_path, 30 * 60);

      if (error) {
        throw error;
      }

      const signedUrl = data.signedUrl;

      // 調用 AI 元數據提取
      const metadata = await extractMusicSheetMetadata({
        musicSheetDataUri: signedUrl, // 假設這是一個可訪問的 URL
        existingArrangementTypes: availableEnsembleTypes,
        additionalInstructions: "Please carefully analyze the Chinese traditional music elements and provide accurate metadata."
      });

      // 更新表單狀態
      if (metadata.title) {
        setTitle(metadata.title);
      }
      if (metadata.composers && metadata.composers.length > 0) {
        setComposers(metadata.composers);
      }
      if (metadata.arrangement_type) {
        // 將人類可讀格式轉回 snake_case
        const matchedEnsembleType = Constants.public.Enums.ensemble_type.find((type) => type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) === metadata.arrangement_type);
        if (matchedEnsembleType) {
          setEnsembleType(matchedEnsembleType);
        }
      }

      await supabase.from("parts").delete().eq("arrangement_id", arrangement.id);

      const { error: partsError } = await supabase.from("parts").insert(
        metadata.parts.map((part) => ({
          arrangement_id: arrangement.id,
          label: part.label,
          start_page: part.start_page,
          end_page: part.end_page,
          category: part.category
        }))
      );

      if (partsError) {
        throw partsError;
      }

      queryClient.invalidateQueries({ queryKey: ["parts", arrangement.id] });

      toaster.success({
        title: "AI 生成成功",
        description: `已提取元數據：${metadata.title || "未知標題"}，${metadata.composers?.length || 0} 位作曲家，${metadata.parts?.length || 0} 個聲部`
      });
    } catch (error) {
      console.error("AI 生成失敗:", error);
      toaster.error({
        title: "AI 生成失敗",
        description: error instanceof Error ? error.message : "發生未知錯誤，請稍後再試"
      });
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  return (
    <Container maxW="7xl" py={8}>
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
              <AutoSaveIndicator isAutoSaving={isAutoSaving} lastSaved={lastSaved} hasUnsavedChanges={hasUnsavedChanges} />
            </VStack>
          </HStack>

          <HStack gap={2}>
            {arrangement.file_path && (
              <Button
                variant="outline"
                colorScheme="purple"
                onClick={handleGenerateWithAI}
                disabled={isUpdating || isDeleting || isGeneratingWithAI}
                loading={isGeneratingWithAI}
                loadingText="AI 生成中..."
              >
                <Sparkles size={16} />
                AI 生成元數據
              </Button>
            )}
            <Button variant="outline" colorScheme="red" onClick={() => setIsDeleteDialogOpen(true)} disabled={isUpdating || isDeleting}>
              <Trash2 size={16} />
              刪除
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isUpdating || isDeleting}>
              <X size={16} />
              取消
            </Button>
            <Button colorScheme="blue" onClick={handleSave} disabled={!isFormValid || !hasChanges || isUpdating || isDeleting} loading={isUpdating} loadingText="保存中...">
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
        <ArrangementEditForm
          arrangement={arrangement}
          title={title}
          setTitle={setTitle}
          composers={composers}
          setComposers={setComposers}
          ensembleType={ensembleType}
          setEnsembleType={setEnsembleType}
          visibility={visibility}
          setVisibility={setVisibility}
          onInputChange={() => setHasUnsavedChanges(true)}
        />

        {/* 刪除確認對話框 */}
        <DeleteArrangementDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleDelete} arrangementTitle={arrangement.title} />
      </VStack>
    </Container>
  );
}
