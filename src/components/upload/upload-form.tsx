"use client";

import { toaster } from "@/components/ui/toaster";
import { useUploadArrangement } from "@/hooks/use-upload-arrangement";
import { Database } from "@/lib/supabase/types";
import { Button, Card, Center, Heading, Text, VStack } from "@chakra-ui/react";
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { ComposersInput, EnsembleTypeSelect, FileUploadSection, TitleInput, UploadError, UploadProgress } from ".";

export function UploadForm({ user }: { user: User }) {
  const [title, setTitle] = useState("");
  const [composers, setComposers] = useState<string[]>([""]);
  const [ensembleType, setEnsembleType] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  const { upload, isLoading, progress, error } = useUploadArrangement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toaster.error({
        title: "請輸入標題"
      });
      return;
    }

    if (composers.some((composer) => !composer.trim())) {
      toaster.error({
        title: "請填寫所有作曲家"
      });
      return;
    }

    if (!ensembleType) {
      toaster.error({
        title: "請選擇合奏類型"
      });
      return;
    }

    if (files.length === 0) {
      toaster.error({
        title: "請選擇至少一個 PDF 檔案"
      });
      return;
    }

    try {
      const result = await upload({
        title: title.trim(),
        composers: composers.filter((composer) => composer.trim()),
        ensembleType: ensembleType as Database["public"]["Enums"]["ensemble_type"],
        files: files,
        ownerId: user.id
      });

      if (result) {
        setTitle("");
        setComposers([""]);
        setEnsembleType("");
        setFiles([]);
        toaster.success({
          title: "編曲上傳成功！"
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <Card.Root w="2xl">
      <Card.Header>
        <Center>
          <Heading>上傳編曲</Heading>
        </Center>
        <Text color="fg.subtle" textAlign="center">
          分享你的音樂編曲
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack as="form" gap="6" onSubmit={handleSubmit}>
          <TitleInput value={title} onChange={setTitle} />

          <ComposersInput composers={composers} onChange={setComposers} />

          <EnsembleTypeSelect value={ensembleType} onChange={setEnsembleType} />

          <FileUploadSection onFileChange={setFiles} />

          <UploadProgress progress={progress} />

          <UploadError error={error} />

          <Button w="full" type="submit" colorScheme="blue" loading={isLoading} loadingText="上傳中" size="lg">
            上傳編曲
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
