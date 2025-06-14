import { Box, Button, HStack, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";

interface ComposersInputProps {
  composers: string[];
  onChange: (composers: string[]) => void;
}

export function ComposersInput({ composers, onChange }: ComposersInputProps) {
  const addComposer = () => {
    onChange([...composers, ""]);
  };

  const removeComposer = (index: number) => {
    if (composers.length > 1) {
      onChange(composers.filter((_, i) => i !== index));
    }
  };

  const updateComposer = (index: number, value: string) => {
    const newComposers = [...composers];
    newComposers[index] = value;
    onChange(newComposers);
  };

  return (
    <Box w="full">
      <Text fontWeight="bold" mb="2">
        作曲家
      </Text>
      <VStack gap="3" w="full">
        {composers.map((composer, index) => (
          <HStack key={index} w="full">
            <Input type="text" value={composer} onChange={(e) => updateComposer(index, e.target.value)} placeholder={`作曲家 ${index + 1}`} required size="md" />
            {composers.length > 1 && (
              <IconButton aria-label="Remove Composer" onClick={() => removeComposer(index)} colorScheme="red" variant="outline" size="sm">
                <Trash2 size={16} />
              </IconButton>
            )}
          </HStack>
        ))}
        <Button onClick={addComposer} variant="outline" size="sm" w="full">
          <Plus size={16} />
          <Text ml="2">Add Composer</Text>
        </Button>
      </VStack>
    </Box>
  );
}
