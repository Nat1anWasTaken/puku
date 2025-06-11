import { Alert, Grid, Text } from "@chakra-ui/react";

interface UploadErrorProps {
  error: string | null;
}

export function UploadError({ error }: UploadErrorProps) {
  if (!error) return null;

  return (
    <Alert.Root status="error" borderRadius="md">
      <Alert.Indicator />
      <Grid templateColumns="1fr 5fr" gap={2}>
        <Text fontWeight="bold">Upload failed</Text>
        <Text>{error}</Text>
      </Grid>
    </Alert.Root>
  );
}
