"use client";

import { Box, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DeletePartDialog } from "./delete-part-dialog";

interface PartItemProps {
  id: number;
  name: string;
  startPage: number | null;
  endPage: number | null;
  color: string;
  onDelete: (id: number) => void;
}

export function PartItem({ id, name, startPage, endPage, color, onDelete }: PartItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
  };

  return (
    <>
      <HStack p={3} borderRadius="md" border="1px solid" borderColor="border.emphasized" justify="space-between">
        <HStack gap={3}>
          <Box w={4} h={4} bg={color} borderRadius="full" />
          <VStack align="start" gap={0}>
            <Text fontWeight="medium">{name}</Text>
            <Text fontSize="sm" color="fg.muted">
              頁面 {startPage} - {endPage}
            </Text>
          </VStack>
        </HStack>
        <IconButton size="sm" variant="ghost" colorScheme="red" onClick={handleDelete} aria-label={`刪除 ${name}`}>
          <Trash2 size={16} />
        </IconButton>
      </HStack>

      <DeletePartDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} partName={name} />
    </>
  );
}
