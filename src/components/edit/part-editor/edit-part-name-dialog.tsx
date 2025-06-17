"use client";

import { Button, Dialog, Input, Portal, VStack } from "@chakra-ui/react";
import { useState } from "react";

interface EditPartNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEditPartName: (newName: string) => void;
  currentName: string;
}

export function EditPartNameDialog({ isOpen, onClose, onEditPartName, currentName }: EditPartNameDialogProps) {
  const [partName, setPartName] = useState(currentName);

  const handleSubmit = () => {
    if (partName.trim() && partName.trim() !== currentName) {
      onEditPartName(partName.trim());
      onClose();
    }
  };

  const handleClose = () => {
    setPartName(currentName);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Reset the input value when dialog opens
  const handleOpenChange = ({ open }: { open: boolean }) => {
    if (open) {
      setPartName(currentName);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>編輯聲部名稱</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} align="stretch">
                <Input placeholder="輸入聲部名稱" value={partName} onChange={(e) => setPartName(e.target.value)} onKeyDown={handleKeyDown} autoFocus />
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={handleClose}>
                  取消
                </Button>
              </Dialog.ActionTrigger>
              <Button colorScheme="blue" onClick={handleSubmit} disabled={!partName.trim() || partName.trim() === currentName}>
                保存
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
