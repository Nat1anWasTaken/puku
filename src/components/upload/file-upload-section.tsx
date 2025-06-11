import { Box, FileUpload, Icon, Text } from "@chakra-ui/react";
import { Upload } from "lucide-react";

interface FileUploadSectionProps {
  onFileChange: (files: File[]) => void;
}

export function FileUploadSection({ onFileChange }: FileUploadSectionProps) {
  return (
    <Box w="full">
      <Text fontWeight="bold" mb="2">
        Arrangement Files
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
            <Box>Click or drag files here to upload</Box>
            <Box color="fg.muted" fontSize="sm">
              Only PDF files are supported (up to 10 files)
            </Box>
          </FileUpload.DropzoneContent>
        </FileUpload.Dropzone>
        <FileUpload.List showSize clearable />
      </FileUpload.Root>
    </Box>
  );
}
