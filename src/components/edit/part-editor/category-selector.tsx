"use client";

import { createListCollection, HStack, Select, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useMemo } from "react";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  availableCategories: string[];
  onCreateNew: () => void;
}

export function CategorySelector({ value, onChange, availableCategories, onCreateNew }: CategorySelectorProps) {
  const categoryCollection = useMemo(() => {
    const items = [
      ...availableCategories.map((category) => ({
        label: category,
        value: category
      })),
      {
        label: "創建新分類",
        value: "__create_new__"
      }
    ];

    console.log("Category collection items:", items); // Debug log
    return createListCollection({ items });
  }, [availableCategories]);

  const handleValueChange = (details: { value: string[] }) => {
    const selectedValue = details.value[0];
    console.log("Selected value:", selectedValue); // Debug log
    if (selectedValue === "__create_new__") {
      onCreateNew();
    } else {
      onChange(selectedValue || "");
    }
  };

  return (
    <HStack gap={2}>
      <Select.Root collection={categoryCollection} value={value ? [value] : []} onValueChange={handleValueChange} size="md" flex="1">
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="選擇分類或創建新分類" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner zIndex={9999}>
          <Select.Content>
            {categoryCollection.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.value === "__create_new__" ? (
                  <HStack gap={2}>
                    <Plus size={14} />
                    <Text>{item.label}</Text>
                  </HStack>
                ) : (
                  item.label
                )}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
    </HStack>
  );
}
