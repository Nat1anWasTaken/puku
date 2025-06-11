import { Card, Center, Skeleton, SkeletonText, VStack } from "@chakra-ui/react";

export function UploadFormSkeleton() {
  return (
    <Card.Root w="2xl">
      <Card.Header>
        <Center>
          <SkeletonText noOfLines={1} height="8" width="48" />
        </Center>
        <Center mt="2">
          <SkeletonText noOfLines={1} height="4" width="40" />
        </Center>
      </Card.Header>
      <Card.Body>
        <VStack gap="6">
          {/* Title Input Skeleton */}
          <VStack width="full" align="start" gap="2">
            <Skeleton height="4" width="12" />
            <Skeleton height="10" width="full" />
          </VStack>

          {/* Composers Input Skeleton */}
          <VStack width="full" align="start" gap="2">
            <Skeleton height="4" width="20" />
            <VStack width="full" gap="2">
              <Skeleton height="10" width="full" />
              <Skeleton height="6" width="24" />
            </VStack>
          </VStack>

          {/* Ensemble Type Select Skeleton */}
          <VStack width="full" align="start" gap="2">
            <Skeleton height="4" width="28" />
            <Skeleton height="10" width="full" />
          </VStack>

          {/* File Upload Section Skeleton */}
          <VStack width="full" align="start" gap="2">
            <Skeleton height="4" width="16" />
            <Skeleton height="32" width="full" />
          </VStack>

          {/* Upload Progress Skeleton (hidden by default) */}
          <VStack width="full" gap="2" display="none">
            <Skeleton height="2" width="full" />
            <Skeleton height="4" width="16" />
          </VStack>

          {/* Upload Error Skeleton (hidden by default) */}
          <VStack width="full" display="none">
            <Skeleton height="6" width="full" />
          </VStack>

          {/* Submit Button Skeleton */}
          <Skeleton height="12" width="full" />
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
