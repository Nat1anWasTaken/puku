import { Button, CloseButton, Dialog, HStack, Icon, Portal, Text, VStack } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";
import { useRef } from "react";

interface DeletePartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partName: string;
}

export function DeletePartDialog({ isOpen, onClose, onConfirm, partName }: DeletePartDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} placement="center" initialFocusEl={() => confirmRef.current}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md">
            <Dialog.Header>
              <HStack gap={2}>
                <Icon color="fg.error">
                  <AlertTriangle />
                </Icon>
                <Dialog.Title>確認刪除聲部</Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} align="start">
                <Text>
                  您確定要刪除聲部 <strong>「{partName}」</strong> 嗎？
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  此操作將會：
                </Text>
                <VStack align="start" gap={1} pl={4}>
                  <Text fontSize="sm" color="fg.muted">
                    • 永久刪除聲部設定
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    • 移除相關的頁面範圍設定
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    • 此操作無法撤銷
                  </Text>
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={onClose}>
                  取消
                </Button>
              </Dialog.ActionTrigger>
              <Button colorScheme="red" onClick={handleConfirm} ref={confirmRef}>
                確認刪除
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
