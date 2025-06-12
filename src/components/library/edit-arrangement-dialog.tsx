import { Button, Dialog, Input, VStack, HStack, Text, Box, IconButton, Select, Portal, createListCollection, CloseButton } from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";

interface Arrangement {
  id: string;
  title: string;
  composers: string[];
  ensemble_type: string;
  created_at: string;
  visibility: string;
  file_path: string | null;
  preview_path: string | null;
}

interface EditArrangementDialogProps {
  arrangement: Arrangement;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedArrangement: Arrangement) => void;
}

const ensembleTypes = ["concert_band", "symphony_orchestra", "jazz_ensemble", "wind_ensemble", "marching_band", "chamber_ensemble"];

const visibilityOptions = [
  { value: "public", label: "公開" },
  { value: "private", label: "私人" }
];

export function EditArrangementDialog({ arrangement, isOpen, onClose, onSave }: EditArrangementDialogProps) {
  const [title, setTitle] = useState(arrangement.title);
  const [composers, setComposers] = useState(arrangement.composers);
  const [ensembleType, setEnsembleType] = useState(arrangement.ensemble_type);
  const [visibility, setVisibility] = useState(arrangement.visibility);

  const ensembleCollection = useMemo(() => {
    return createListCollection({
      items: ensembleTypes.map((type) => ({
        label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: type
      }))
    });
  }, []);

  const visibilityCollection = useMemo(() => {
    return createListCollection({
      items: visibilityOptions
    });
  }, []);

  const handleAddComposer = () => {
    setComposers([...composers, ""]);
  };

  const handleRemoveComposer = (index: number) => {
    if (composers.length > 1) {
      setComposers(composers.filter((_, i) => i !== index));
    }
  };

  const handleComposerChange = (index: number, value: string) => {
    const newComposers = [...composers];
    newComposers[index] = value;
    setComposers(newComposers);
  };

  const handleSave = () => {
    const updatedArrangement: Arrangement = {
      ...arrangement,
      title: title.trim(),
      composers: composers.filter((c) => c.trim()),
      ensemble_type: ensembleType,
      visibility
    };
    onSave(updatedArrangement);
    onClose();
  };

  const handleCancel = () => {
    // 重置表單
    setTitle(arrangement.title);
    setComposers(arrangement.composers);
    setEnsembleType(arrangement.ensemble_type);
    setVisibility(arrangement.visibility);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md">
            <Dialog.Header>
              <Dialog.Title>編輯編曲</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap={4} align="stretch">
                {/* 標題 */}
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    編曲標題
                  </Text>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="請輸入編曲標題" />
                </Box>

                {/* 作曲家 */}
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    作曲家
                  </Text>
                  <VStack gap={2}>
                    {composers.map((composer, index) => (
                      <HStack key={index} w="full">
                        <Input value={composer} onChange={(e) => handleComposerChange(index, e.target.value)} placeholder={`作曲家 ${index + 1}`} />
                        {composers.length > 1 && (
                          <IconButton size="sm" colorScheme="red" variant="outline" onClick={() => handleRemoveComposer(index)}>
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </HStack>
                    ))}
                    <Button size="sm" variant="outline" onClick={handleAddComposer} w="full">
                      <Plus size={16} />
                      新增作曲家
                    </Button>
                  </VStack>
                </Box>

                {/* 合奏類型 */}
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    合奏類型
                  </Text>
                  <Select.Root collection={ensembleCollection} value={[ensembleType]} onValueChange={(details) => setEnsembleType(details.value[0])}>
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
                </Box>

                {/* 可見性 */}
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    可見性
                  </Text>
                  <Select.Root collection={visibilityCollection} value={[visibility]} onValueChange={(details) => setVisibility(details.value[0])}>
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
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={handleCancel}>
                  取消
                </Button>
              </Dialog.ActionTrigger>
              <Button colorScheme="blue" onClick={handleSave}>
                保存變更
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
