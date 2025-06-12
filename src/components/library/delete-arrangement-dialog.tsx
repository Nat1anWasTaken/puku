import { Button, Dialog, Text, VStack, HStack, Icon, Portal, CloseButton } from "@chakra-ui/react";
import { AlertTriangle } from "lucide-react";

interface DeleteArrangementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  arrangementTitle: string;
}

export function DeleteArrangementDialog({ isOpen, onClose, onConfirm, arrangementTitle }: DeleteArrangementDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md">
            <Dialog.Header>
              <HStack gap={2}>
                <Icon color="fg.error">
                  <AlertTriangle />
                </Icon>
                <Dialog.Title>確認刪除編曲</Dialog.Title>
              </HStack>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} align="start">
                <Text>
                  您確定要刪除編曲 <strong>「{arrangementTitle}」</strong> 嗎？
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  此操作將會：
                </Text>
                <VStack align="start" gap={1} pl={4}>
                  <Text fontSize="sm" color="fg.muted">
                    • 永久刪除編曲檔案
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    • 移除所有相關的縮圖和預覽
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
              <Button colorScheme="red" onClick={handleConfirm}>
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
