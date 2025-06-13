"use client";

import { ArrangementWithDetails } from "@/lib/services/arrangement-service-server";
import { Constants, Database } from "@/lib/supabase/types";
import { Alert, Button, Card, Fieldset, HStack, IconButton, Input, Portal, Select, Text, VStack, createListCollection } from "@chakra-ui/react";
import { AlertCircle, Music, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PartEditor } from "./part-editor";

interface ArrangementEditFormProps {
  arrangement: ArrangementWithDetails;
  title: string;
  setTitle: (title: string) => void;
  composers: string[];
  setComposers: (composers: string[]) => void;
  ensembleType: Database["public"]["Enums"]["ensemble_type"];
  setEnsembleType: (type: Database["public"]["Enums"]["ensemble_type"]) => void;
  visibility: Database["public"]["Enums"]["visibility"];
  setVisibility: (visibility: Database["public"]["Enums"]["visibility"]) => void;
  onInputChange: () => void;
}

const visibilityOptions = [
  { value: "private", label: "私人" },
  { value: "unlisted", label: "未列出" },
  { value: "public", label: "公開" }
];

export function ArrangementEditForm({ arrangement, title, setTitle, composers, setComposers, ensembleType, setEnsembleType, visibility, setVisibility, onInputChange }: ArrangementEditFormProps) {
  // 表單驗證狀態
  const [titleError, setTitleError] = useState<string | null>(null);
  const [composersError, setComposersError] = useState<string | null>(null);

  // 聲部編輯器狀態
  const [isPartEditorOpen, setIsPartEditorOpen] = useState(false);

  // 創建ensemble類型選項集合
  const ensembleCollection = useMemo(() => {
    return createListCollection({
      items: Constants.public.Enums.ensemble_type.map((type) => ({
        label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: type
      }))
    });
  }, []);

  // 創建可見性選項集合
  const visibilityCollection = useMemo(() => {
    return createListCollection({
      items: visibilityOptions
    });
  }, []);

  // 表單驗證
  useEffect(() => {
    // 標題驗證
    if (title.length === 0) {
      setTitleError("標題為必填項目");
    } else if (title.trim().length < 3) {
      setTitleError("標題至少需要3個字符");
    } else {
      setTitleError(null);
    }

    // 作曲家驗證
    const validComposers = composers.filter((c) => c.trim().length > 0);
    if (validComposers.length === 0) {
      setComposersError("至少需要一個作曲家");
    } else {
      setComposersError(null);
    }
  }, [title, composers]);

  // 處理標題變更
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    onInputChange();
  };

  // 處理作曲家變更
  const handleComposerChange = (index: number, value: string) => {
    const newComposers = [...composers];
    newComposers[index] = value;
    setComposers(newComposers);
    onInputChange();
  };

  // 新增作曲家
  const handleAddComposer = () => {
    setComposers([...composers, ""]);
    onInputChange();
  };

  // 移除作曲家
  const handleRemoveComposer = (index: number) => {
    if (composers.length > 1) {
      setComposers(composers.filter((_, i) => i !== index));
      onInputChange();
    }
  };

  // 處理合奏類型變更
  const handleEnsembleTypeChange = (details: { value: string[] }) => {
    setEnsembleType(details.value[0] as Database["public"]["Enums"]["ensemble_type"]);
    onInputChange();
  };

  // 處理可見性變更
  const handleVisibilityChange = (details: { value: string[] }) => {
    setVisibility(details.value[0] as Database["public"]["Enums"]["visibility"]);
    onInputChange();
  };

  return (
    <VStack gap={6} align="stretch">
      {/* 基本資訊卡片 */}
      <Card.Root>
        <Card.Header>
          <Card.Title>基本資訊</Card.Title>
        </Card.Header>
        <Card.Body>
          <VStack gap={4} align="stretch">
            {/* 標題 */}
            <Fieldset.Root invalid={!!titleError}>
              <Fieldset.Legend>編曲標題 *</Fieldset.Legend>
              <Input value={title} onChange={handleTitleChange} placeholder="請輸入編曲標題" />
              {titleError && (
                <Fieldset.ErrorText>
                  <AlertCircle size={16} />
                  {titleError}
                </Fieldset.ErrorText>
              )}
            </Fieldset.Root>

            {/* 作曲家 */}
            <Fieldset.Root invalid={!!composersError}>
              <Fieldset.Legend>作曲家 *</Fieldset.Legend>
              <VStack gap={3}>
                {composers.map((composer, index) => (
                  <HStack key={index} w="full">
                    <Input value={composer} onChange={(e) => handleComposerChange(index, e.target.value)} placeholder={`作曲家 ${index + 1}`} />
                    {composers.length > 1 && (
                      <IconButton size="md" colorScheme="red" variant="outline" onClick={() => handleRemoveComposer(index)} aria-label={`移除作曲家 ${index + 1}`}>
                        <Trash2 size={16} />
                      </IconButton>
                    )}
                  </HStack>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddComposer}
                  w="full"
                  disabled={composers.length >= 10} // 限制最多10個作曲家
                >
                  <Plus size={16} />
                  新增作曲家
                </Button>
                {composers.length >= 10 && (
                  <Text fontSize="sm" color="fg.muted">
                    最多可新增10個作曲家
                  </Text>
                )}
              </VStack>
              {composersError && (
                <Fieldset.ErrorText>
                  <AlertCircle size={16} />
                  {composersError}
                </Fieldset.ErrorText>
              )}
            </Fieldset.Root>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* 分類設定卡片 */}
      <Card.Root>
        <Card.Header>
          <Card.Title>分類設定</Card.Title>
        </Card.Header>
        <Card.Body>
          <VStack gap={4} align="stretch">
            {/* 合奏類型 */}
            <Fieldset.Root>
              <Fieldset.Legend>合奏類型 *</Fieldset.Legend>
              <Select.Root collection={ensembleCollection} value={[ensembleType]} onValueChange={handleEnsembleTypeChange}>
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="請選擇合奏類型" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {ensembleCollection.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Fieldset.Root>

            {/* 可見性 */}
            <Fieldset.Root>
              <Fieldset.Legend>可見性設定 *</Fieldset.Legend>
              <Select.Root collection={visibilityCollection} value={[visibility]} onValueChange={handleVisibilityChange}>
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="請選擇可見性" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {visibilityCollection.items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
              <Fieldset.HelperText>
                <VStack align="start" gap={1}>
                  <Text fontSize="sm">• 私人：只有您可以查看</Text>
                  <Text fontSize="sm">• 未列出：有連結的人可以查看，但不會出現在公開列表中</Text>
                  <Text fontSize="sm">• 公開：所有人都可以查看和搜尋</Text>
                </VStack>
              </Fieldset.HelperText>
            </Fieldset.Root>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* 聲部管理卡片 */}
      <Card.Root>
        <Card.Header>
          <Card.Title>聲部管理</Card.Title>
        </Card.Header>
        <Card.Body>
          <VStack gap={4} align="stretch">
            <Text fontSize="sm" color="fg.muted">
              管理編曲的聲部分配，將頁面分組為不同的聲部。
            </Text>
            <Button variant="outline" onClick={() => setIsPartEditorOpen(true)} disabled={!arrangement.file_path}>
              <Music size={16} />
              編輯聲部
            </Button>
            {!arrangement.file_path && (
              <Text fontSize="sm" color="fg.muted">
                需要先上傳 PDF 文件才能編輯聲部
              </Text>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* 表單驗證提醒 */}
      {(titleError || composersError) && (
        <Alert.Root status="error" borderRadius="md">
          <Alert.Indicator />
          <VStack align="start" gap={1}>
            <Text fontWeight="bold">請修正以下錯誤：</Text>
            {titleError && <Text>• {titleError}</Text>}
            {composersError && <Text>• {composersError}</Text>}
          </VStack>
        </Alert.Root>
      )}

      {/* 聲部編輯器 */}
      <PartEditor arrangementId={arrangement.id} filePath={arrangement.file_path} isOpen={isPartEditorOpen} onClose={() => setIsPartEditorOpen(false)} />
    </VStack>
  );
}
