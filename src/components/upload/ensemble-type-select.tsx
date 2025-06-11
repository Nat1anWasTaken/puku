import { Constants } from "@/lib/supabase/types";
import { Box, createListCollection, Portal, Select, Text } from "@chakra-ui/react";
import { useMemo } from "react";

interface EnsembleTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function EnsembleTypeSelect({ value, onChange }: EnsembleTypeSelectProps) {
  const ensembleTypes = Constants.public.Enums.ensemble_type;

  const ensembleCollection = useMemo(() => {
    return createListCollection({
      items: ensembleTypes.map((type) => ({
        label: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: type
      }))
    });
  }, [ensembleTypes]);

  return (
    <Box w="full">
      <Text fontWeight="bold" mb="2">
        Ensemble Type
      </Text>
      <Select.Root collection={ensembleCollection} value={value ? [value] : []} onValueChange={(details) => onChange(details.value[0] || "")} size="md" required>
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Please select an ensemble type" />
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
  );
}
