import { createClient } from "@/lib/supabase/client";

/**
 * Uploads a file to Supabase storage
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path where the file should be stored
 * @param file - The file to upload (File object or Uint8Array)
 * @returns Promise<string> - Returns the storage path of the uploaded file
 * @throws {Error} When file upload fails
 * @description Uploads files to Supabase storage with PDF content type and 1-hour cache control
 */
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

/**
 * Gets the public URL for a file in Supabase storage
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path of the file in storage
 * @returns Promise<string> - Returns the public URL for accessing the file
 * @description Generates a public URL that can be used to access files directly from storage
 */
export async function getFilePublicUrl(bucketName: string, filePath: string): Promise<string> {
  const supabase = createClient();

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Generates a standardized file path for arrangement PDFs
 * @param arrangementId - The arrangement ID to generate path for
 * @returns string - Returns the formatted file path for the arrangement
 * @description Creates a consistent naming pattern for arrangement files in storage
 */
export function generateArrangementFilePath(arrangementId: string): string {
  return `arrangements/${arrangementId}.pdf`;
}
