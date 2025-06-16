"use client";

import { Card, Grid, HStack, Skeleton, SkeletonText } from "@chakra-ui/react";

export function PartCategorySectionSkeleton() {
  return (
    <Card.Root>
      <Card.Header>
        <HStack gap={2}>
          <Skeleton height="28px" width="120px" />
          <Skeleton height="28px" width="40px" />
        </HStack>
      </Card.Header>
      <Card.Body>
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card.Root key={index}>
              <Card.Body>
                <Skeleton height="120px" width="100%" mb={3} borderRadius="md" />
                <SkeletonText noOfLines={2} />
                <Skeleton height="20px" width="60%" mt={2} />
              </Card.Body>
            </Card.Root>
          ))}
        </Grid>
      </Card.Body>
    </Card.Root>
  );
}
