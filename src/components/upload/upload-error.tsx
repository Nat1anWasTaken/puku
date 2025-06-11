import { Alert, Text } from "@chakra-ui/react";

interface UploadErrorProps {
  error: string | null;
}

export function UploadError({ error }: UploadErrorProps) {
  if (!error) return null;

  return (
    <Alert.Root status="error" borderRadius="md">
      <Alert.Indicator />
      <Text fontWeight="bold">Upload failed</Text>
      <Text>{error}</Text>
    </Alert.Root>
  );
}
