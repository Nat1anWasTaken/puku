"use client";

import { UploadForm, UploadFormSkeleton } from "@/components/upload";
import { useUser } from "@/hooks/use-user";
import { Flex } from "@chakra-ui/react";

export default function UploadPage() {
  const { user, isLoading } = useUser();

  return (
    <Flex w="full" h="full" justify="center" align="center">
      {isLoading ? <UploadFormSkeleton /> : <UploadForm user={user!} />}
    </Flex>
  );
}
