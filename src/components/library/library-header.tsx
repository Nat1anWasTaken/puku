"use client";

import { Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";

interface LibraryHeaderProps {
  onUpload: () => void;
}

export function LibraryHeader({ onUpload }: LibraryHeaderProps) {
  return (
    <Flex justify="space-between" align="center" w="full">
      <VStack align="start" gap={1}>
        <Heading size="xl">我的編曲庫</Heading>
        <Text color="fg.muted">管理和組織您的音樂編曲作品</Text>
      </VStack>

      <Button colorScheme="blue" onClick={onUpload}>
        上傳新編曲
      </Button>
    </Flex>
  );
}
