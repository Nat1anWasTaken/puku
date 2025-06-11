import { Box, Progress, Text } from "@chakra-ui/react";

interface UploadProgressProps {
  progress: {
    progress: number;
    message: string;
  } | null;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  if (!progress) return null;

  return (
    <Box w="full">
      <Text fontSize="sm" mb="2">
        {progress.message}
      </Text>
      <Progress.Root value={progress.progress} colorScheme="blue">
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
}
