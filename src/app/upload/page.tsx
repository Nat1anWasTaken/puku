"use client";

import { UploadForm, UploadFormSkeleton } from "@/components/upload";
import { useUser } from "@/hooks/use-user";
import { Container, Flex } from "@chakra-ui/react";

export default function UploadPage() {
  const { user, isLoading } = useUser();

  return (
    <Container maxW="7xl" py={8}>
      <Flex justify="center">{isLoading ? <UploadFormSkeleton /> : <UploadForm user={user!} />}</Flex>
    </Container>
  );
}
