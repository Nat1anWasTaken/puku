"use client";

import { Card, Grid, HStack, Skeleton, VStack } from "@chakra-ui/react";

export function LibrarySkeleton() {
  return (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card.Root key={i} overflow="hidden">
          <Skeleton h="200px" />
          <Card.Body>
            <VStack align="start" gap={3}>
              <VStack align="start" gap={1} w="full">
                <Skeleton h="6" w="80%" />
                <Skeleton h="4" w="60%" />
              </VStack>
              <HStack justify="space-between" w="full">
                <Skeleton h="5" w="20%" />
                <Skeleton h="4" w="24" />
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </Grid>
  );
}
