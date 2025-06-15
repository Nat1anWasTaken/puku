"use client";

import { Tables } from "@/lib/supabase/types";
import { Card, Grid, Skeleton, Text, VStack } from "@chakra-ui/react";
import { PartCard } from "./part-card";

type Part = Tables<"parts">;

interface PartCategorySectionProps {
  title: string;
  parts: Part[];
  isLoading?: boolean;
}

export function PartCategorySection({ title, parts, isLoading }: PartCategorySectionProps) {
  if (isLoading) {
    return (
      <Card.Root>
        <Card.Header>
          <Card.Title fontSize="lg">{title}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height="300px" borderRadius="md" />
            ))}
          </Grid>
        </Card.Body>
      </Card.Root>
    );
  }

  if (parts.length === 0) {
    return (
      <Card.Root>
        <Card.Header>
          <Card.Title>{title}</Card.Title>
        </Card.Header>
        <Card.Body>
          <VStack gap={4} py={8}>
            <Text color="fg.muted" fontSize="lg">
              此分類中沒有聲部
            </Text>
            <Text color="fg.muted" fontSize="sm">
              聲部將在編輯器中創建後顯示在這裡
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>
          {title} ({parts.length})
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
          {parts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
