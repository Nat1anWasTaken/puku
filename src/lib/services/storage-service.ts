import { createClient } from "@/lib/supabase/client";

export async function uploadFileToStorage(bucketName: string, filePath: string, file: File | Uint8Array): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: "application/pdf"
  });

  if (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  return data.path;
}

export async function getFilePublicUrl(bucketName: string, filePath: string): Promise<string> {
  const supabase = createClient();

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  return data.publicUrl;
}

export function generateArrangementFilePath(arrangementId: string): string {
  return `arrangements/${arrangementId}.pdf`;
}
