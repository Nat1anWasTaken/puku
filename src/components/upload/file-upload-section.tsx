import { Box, FileUpload, Icon, Text } from "@chakra-ui/react";
import { Upload } from "lucide-react";

interface FileUploadSectionProps {
  onFileChange: (files: File[]) => void;
}

export function FileUploadSection({ onFileChange }: FileUploadSectionProps) {
  return (
    <Box w="full">
      <Text fontWeight="bold" mb="2">
        編曲檔案
      </Text>
      <FileUpload.Root
        maxFiles={10}
        accept={[".pdf"]}
        maxW="full"
        alignItems="stretch"
        onFileChange={(details) => {
          onFileChange(Array.from(details.acceptedFiles));
        }}
      >
        <FileUpload.HiddenInput />
        <FileUpload.Dropzone>
          <Icon size="lg" color="fg.muted">
            <Upload />
          </Icon>
          <FileUpload.DropzoneContent>
            <Box>點擊或拖曳檔案上傳</Box>
            <Box color="fg.muted" fontSize="sm">
              僅支援 PDF 檔案 (最多 10 個檔案)
            </Box>
          </FileUpload.DropzoneContent>
        </FileUpload.Dropzone>
        <FileUpload.List showSize clearable />
      </FileUpload.Root>
    </Box>
  );
}
