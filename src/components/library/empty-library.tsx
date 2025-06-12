"use client";

import { Button, Card, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { Music } from "lucide-react";

interface EmptyLibraryProps {
  onUpload: () => void;
}

export function EmptyLibrary({ onUpload }: EmptyLibraryProps) {
  return (
    <Card.Root w="full">
      <Card.Body>
        <VStack align="center" gap={4} py={12}>
          <Icon size="2xl" color="fg.muted">
            <Music />
          </Icon>
          <VStack gap={2} textAlign="center">
            <Heading size="lg" color="fg.muted">
              還沒有編曲作品
            </Heading>
            <Text color="fg.muted">開始上傳您的第一個編曲作品吧！</Text>
          </VStack>
          <Button colorScheme="blue" onClick={onUpload}>
            上傳編曲
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
