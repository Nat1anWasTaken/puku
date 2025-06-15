"use client";

import { Button, Dialog, Input, Portal, VStack } from "@chakra-ui/react";
import { useState } from "react";

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCategory: (categoryName: string) => void;
}

export function CreateCategoryDialog({ isOpen, onClose, onCreateCategory }: CreateCategoryDialogProps) {
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = () => {
    if (categoryName.trim()) {
      onCreateCategory(categoryName.trim());
      setCategoryName("");
    }
  };

  const handleClose = () => {
    setCategoryName("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && handleClose()} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>創建新分類</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Input placeholder="輸入分類名稱（例如：弦樂、管樂、打擊樂等）" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={handleClose}>
                  取消
                </Button>
              </Dialog.ActionTrigger>
              <Button colorScheme="blue" onClick={handleSubmit} disabled={!categoryName.trim()}>
                創建分類
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
