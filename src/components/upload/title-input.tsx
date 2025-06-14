import { Box, Input, Text } from "@chakra-ui/react";

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <Box w="full">
      <Text fontWeight="bold" mb="2">
        編曲標題
      </Text>
      <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="請輸入編曲標題" required size="md" />
    </Box>
  );
}
