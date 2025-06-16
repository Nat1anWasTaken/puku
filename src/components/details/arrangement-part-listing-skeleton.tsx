"use client";

import { Box, HStack, Skeleton, VStack } from "@chakra-ui/react";

export function ArrangementPartListingSkeleton() {
  return (
    <VStack gap={6} align="stretch" mt={8}>
      {/* Filters skeleton */}
      <Box p={4} borderWidth={1} borderRadius="md">
        <VStack gap={4} align="stretch">
          {/* Search and sort controls skeleton */}
          <HStack gap={4}>
            <Skeleton height="40px" flex={1} borderRadius="md" />
            <Skeleton height="40px" width="120px" borderRadius="md" />
            <Skeleton height="40px" width="100px" borderRadius="md" />
          </HStack>

          {/* Count display skeleton */}
          <HStack>
            <Skeleton height="20px" width="200px" />
          </HStack>
        </VStack>
      </Box>

      {/* Part category sections skeleton */}
      {Array.from({ length: 3 }).map((_, index) => (
        <Box key={index} borderWidth={1} borderRadius="md" overflow="hidden">
          {/* Category header skeleton */}
          <Box p={4} borderBottomWidth={1}>
            <HStack justify="space-between" align="center">
              <Skeleton height="24px" width="120px" />
              <Skeleton height="20px" width="60px" />
            </HStack>
          </Box>

          {/* Category content skeleton */}
          <VStack gap={3} p={4} align="stretch">
            {Array.from({ length: 2 + index }).map((_, partIndex) => (
              <HStack key={partIndex} gap={4} p={3} borderWidth={1} borderRadius="md">
                {/* Thumbnail skeleton */}
                <Skeleton width="60px" height="60px" borderRadius="md" />

                <VStack align="start" flex={1} gap={2}>
                  {/* Part label skeleton */}
                  <Skeleton height="20px" width="150px" />

                  {/* Part details skeleton */}
                  <HStack gap={4}>
                    <Skeleton height="16px" width="80px" />
                    <Skeleton height="16px" width="100px" />
                  </HStack>
                </VStack>

                {/* Action buttons skeleton */}
                <HStack gap={2}>
                  <Skeleton width="32px" height="32px" borderRadius="md" />
                  <Skeleton width="32px" height="32px" borderRadius="md" />
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}
