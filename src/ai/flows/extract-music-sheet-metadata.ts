"use server";
/**
 * @fileOverview A flow to extract detailed music sheet metadata from a file using the Gemini API.
 *
 * - extractMusicSheetMetadata - A function that handles the metadata extraction process.
 * - ExtractMusicSheetMetadataInput - The input type for the extractMusicSheetMetadata function.
 * - ExtractMusicSheetMetadataOutput - The return type for the extractMusicSheetMetadata function (now includes title, composers, arrangement_type, and parts with primaryInstrumentation).
 */

import { ai } from "@/ai/genkit";
import { FileMetadataResponse, GoogleAIFileManager } from "@google/generative-ai/server";
import { z } from "genkit";

// Files API related types and constants
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Google AI File Manager
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required for Files API");
}

const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

export type ExtractMusicSheetMetadataInput = {
  musicSheetDataUri: string;
  existingArrangementTypes: string[];
  additionalInstructions?: string;
};

const PartInformationSchema = z.object({
  label: z
    .string()
    .describe(
      "The type of part, typically the instrument or section name, such as 'Flute I', 'Percussion II'. For non-musical sections, use descriptive labels like 'Cover', 'Program Notes'. Reproduce exactly the label as written in the score. For the full ensemble score, always use 'Full Score'."
    ),
  is_full_score: z
    .boolean()
    .describe(
      "Indicates whether this part is the full score. Set to true only for pages showing the complete ensemble score with all instruments. Set to false for covers, program notes, individual instrument parts, and other non-full-score sections."
    ),
  start_page: z.number().int().describe("The starting page number of this part in the document."),
  end_page: z.number().int().describe("The ending page number of this part in the document."),
  category: z
    .string()
    .describe(
      "The category of the part. For large ensemble scores, use clear, standardized categories such as: 'Full Score', 'Woodwinds', 'Brass', 'Percussion', 'Strings', 'Vocal', 'Cover', 'Program Notes', or 'Other'. Always select the most specific and appropriate category for each part, based on its content and function in the score. For example, use 'Full Score' only for the complete ensemble score, and use 'Cover' or 'Program Notes' for non-musical sections. Do not invent new categories; choose from the provided list or select 'Other' if none apply."
    )
});

const ExtractMusicSheetMetadataOutputSchema = z.object({
  title: z.string().describe("The title of the score, typically the name of the music piece. Please write out the full original title, e.g., 'Washington Post March'."),
  composers: z.array(z.string()).describe("The composers and arrangers of the piece. Please write out their full original names, e.g., 'John Philip Sousa'."),
  arrangement_type: z
    .string()
    .describe(
      "The type of arrangement. YOU MUST CHOOSE EXACTLY ONE OF THE PROVIDED existingArrangementTypes. Do not invent a new type. e.g., if existingArrangementTypes is ['Concert Band', 'Jazz Ensemble'], you must output either 'Concert Band' or 'Jazz Ensemble'. THIS IS NOT PART NAME SO IT SHOULDN'T BE SOMETHING LIKE 'Full Score', 'Flute 1'"
    ),
  parts: z
    .array(PartInformationSchema)
    .describe(
      "A list of the individual parts included within the file. Carefully examine the document and specify the start and end pages of each part to facilitate later extraction. This means you must carefully inspect each page individually, rather than treating the entire document as one unit."
    )
});
export type ExtractMusicSheetMetadataOutput = z.infer<typeof ExtractMusicSheetMetadataOutputSchema>;

/**
 * Uploads a file to the Gemini Files API using the official GoogleAIFileManager
 */
async function uploadFileToGeminiAPI(fileBuffer: Buffer, mimeType: string, displayName?: string) {
  const uploadResponse = await fileManager.uploadFile(fileBuffer, {
    mimeType: mimeType,
    displayName: displayName || "music-sheet.pdf"
  });

  return uploadResponse.file;
}

/**
 * Checks the status of an uploaded file using the official GoogleAIFileManager
 */
async function getFileStatus(fileName: string) {
  const response = await fileManager.getFile(fileName);
  return response;
}

/**
 * Waits for a file to be processed by the Gemini Files API using the official GoogleAIFileManager
 */
async function waitForFileProcessing(fileName: string, maxWaitTimeMs: number = 60000) {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds

  while (Date.now() - startTime < maxWaitTimeMs) {
    const file = await getFileStatus(fileName);

    if (file.state === "ACTIVE") {
      return file;
    } else if (file.state === "FAILED") {
      const errorMessage = file.error?.message || "Unknown error during file processing";
      throw new Error(`File processing failed: ${errorMessage}`);
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  throw new Error(`File processing timed out after ${maxWaitTimeMs}ms`);
}

/**
 * Deletes an uploaded file from the Gemini Files API using the official GoogleAIFileManager
 */
async function deleteFile(fileName: string): Promise<void> {
  try {
    await fileManager.deleteFile(fileName);
  } catch (error: unknown) {
    // Don't throw on 404 errors (file not found)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes("404") && !errorMessage.includes("not found")) {
      console.warn(`Failed to delete file ${fileName}:`, errorMessage);
    }
  }
}

/**
 * Converts a data URI to a Buffer and extracts MIME type, validates Files API URI, or handles HTTP URLs
 */
function processInputUri(uri: string): {
  buffer?: Buffer;
  mimeType?: string;
  isFilesApiUri: boolean;
  isHttpUrl: boolean;
} {
  // Check if it's a Files API URI
  if (uri.startsWith("https://generativelanguage.googleapis.com/v1beta/files/")) {
    return { isFilesApiUri: true, isHttpUrl: false };
  }

  // Check if it's an HTTP/HTTPS URL
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return { isFilesApiUri: false, isHttpUrl: true };
  }

  // Handle data URI
  const match = uri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error(
      "Invalid URI format. Expected either a data URI (format: 'data:<mimetype>;base64,<encoded_data>'), Files API URI (format: 'https://generativelanguage.googleapis.com/v1beta/files/<file-id>'), or HTTP URL."
    );
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");

  return { buffer, mimeType, isFilesApiUri: false, isHttpUrl: false };
}

export async function extractMusicSheetMetadata(input: ExtractMusicSheetMetadataInput): Promise<ExtractMusicSheetMetadataOutput> {
  // Check input type
  const inputInfo = processInputUri(input.musicSheetDataUri);

  if (inputInfo.isFilesApiUri) {
    // Already a Files API URI, use directly
    const inputWithMime = {
      ...input,
      mimeType: "application/pdf" // Default assumption for Files API URIs
    };
    return await extractMusicSheetMetadataFlow(inputWithMime);
  }

  // Handle HTTP URLs by passing them directly to Gemini API
  if (inputInfo.isHttpUrl) {
    console.log("Input is an HTTP URL, passing directly to Gemini API...");

    // Guess MIME type from URL extension for better processing
    let mimeType = "application/pdf"; // Default for music sheets
    const urlLower = input.musicSheetDataUri.toLowerCase();
    if (urlLower.endsWith(".png")) {
      mimeType = "image/png";
    } else if (urlLower.endsWith(".jpg") || urlLower.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (urlLower.endsWith(".gif")) {
      mimeType = "image/gif";
    } else if (urlLower.endsWith(".webp")) {
      mimeType = "image/webp";
    }

    const inputWithMime = {
      ...input,
      mimeType
    };
    return await extractMusicSheetMetadataFlow(inputWithMime);
  }

  // Handle data URIs
  const { buffer, mimeType } = inputInfo;
  if (!buffer || !mimeType) {
    throw new Error("Failed to process data URI");
  }

  const fileSize = buffer.length;
  const MAX_INLINE_SIZE = 20 * 1024 * 1024; // 20 MB in bytes
  const MAX_FILES_API_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB in bytes

  console.log(`Processing file: ${Math.round(fileSize / (1024 * 1024))} MB`);

  if (fileSize > MAX_FILES_API_SIZE) {
    throw new Error(
      `File size exceeds the maximum limit of 2 GB for Gemini Files API. ` +
        `File size: ${Math.round(fileSize / (1024 * 1024))} MB. ` +
        `Please reduce the file size or split the PDF into smaller parts.`
    );
  }

  return await processFileBuffer(buffer, mimeType, input, fileSize, MAX_INLINE_SIZE);
}

/**
 * Processes a file buffer using either Files API or direct approach
 */
async function processFileBuffer(buffer: Buffer, mimeType: string, input: ExtractMusicSheetMetadataInput, fileSize: number, maxInlineSize: number): Promise<ExtractMusicSheetMetadataOutput> {
  let uploadedFile: FileMetadataResponse | null = null;
  const useFilesAPI = fileSize > maxInlineSize;

  try {
    if (useFilesAPI) {
      console.log("File size exceeds 20 MB, using Files API for upload...");

      // Upload file to Files API
      uploadedFile = await uploadFileToGeminiAPI(buffer, mimeType, `music-sheet-${Date.now()}.pdf`);

      console.log(`File uploaded successfully: ${uploadedFile.name}`);

      // Wait for file to be processed
      console.log("Waiting for file processing...");
      uploadedFile = await waitForFileProcessing(uploadedFile.name);

      console.log("File processing completed, waiting for file to be fully ready...");
      // Add a buffer time to ensure the file is truly ready for use
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second buffer

      console.log("Proceeding with metadata extraction...");

      // Create modified input with file URI and corrected MIME type
      // Files API often returns 'application/octet-stream' which is not supported by Gemini
      // Use the original MIME type we extracted from the data URI instead
      const correctedMimeType =
        uploadedFile.mimeType === "application/octet-stream"
          ? mimeType // Use the original MIME type from data URI parsing
          : uploadedFile.mimeType;

      const modifiedInput = {
        ...input,
        musicSheetDataUri: uploadedFile.uri,
        mimeType: correctedMimeType
      };

      const result = await extractMusicSheetMetadataFlow(modifiedInput);

      // Clean up uploaded file after successful processing
      if (uploadedFile) {
        try {
          console.log(`Cleaning up uploaded file: ${uploadedFile.name}`);
          await deleteFile(uploadedFile.name);
        } catch (cleanupError) {
          console.warn("Failed to clean up uploaded file:", cleanupError);
          // Don't throw cleanup errors - the main operation was successful
        }
      }

      return result;
    } else {
      // Use original approach for smaller files
      console.log("File size is within limits, using direct base64 approach...");

      // Convert buffer to data URI for direct processing
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      const inputWithMime = {
        ...input,
        musicSheetDataUri: dataUri,
        mimeType: mimeType
      };
      return await extractMusicSheetMetadataFlow(inputWithMime);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Enhanced error handling for Files API
    if (errorMessage.includes("Failed to upload file")) {
      throw new Error(
        `Unable to upload file to Gemini Files API. This could be due to: ` +
          `1. Network connectivity issues, ` +
          `2. API quota exceeded, ` +
          `3. Invalid file format. ` +
          `Original error: ${errorMessage}`
      );
    } else if (errorMessage.includes("File processing failed")) {
      throw new Error(
        `Gemini could not process the uploaded file. This could be due to: ` + `1. Unsupported file format, ` + `2. Corrupted file, ` + `3. File content issues. ` + `Original error: ${errorMessage}`
      );
    } else if (errorMessage.includes("File processing timed out")) {
      throw new Error(`File processing timed out. This can happen with very large or complex files. ` + `Please try again or reduce the file size.`);
    }

    // Clean up uploaded file on error
    if (uploadedFile && useFilesAPI) {
      try {
        console.log(`Cleaning up uploaded file after error: ${uploadedFile.name}`);
        await deleteFile(uploadedFile.name);
      } catch (cleanupError) {
        console.warn("Failed to clean up uploaded file:", cleanupError);
      }
    }

    // Re-throw other errors as-is
    throw error;
  }
}

const systemPrompt = `
You are the conductor of a world-renowned orchestra, with extensive knowledge of sheet music from around the globe.

As your assistant, I will provide you with a PDF file containing sheet music.

I will also provide a list of \`existingArrangementTypes\`. You MUST choose the most appropriate \`arrangement_type\` for the music sheet from this exact list.

 Please analyze the content of the music score and provide the following information in JSON format:

- **title**: The title of the score, typically the name of the music piece. Please write out the full original title (e.g., "Washington Post March").
- **composers**: The composers and arrangers of the piece. Please write out their full original names (e.g., "John Philip Sousa").
- **arrangement_type**: The type of arrangement. YOU MUST CHOOSE EXACTLY ONE OF THE PROVIDED \`existingArrangementTypes\`. Do not invent a new type. For example, if the provided \`existingArrangementTypes\` are ["Concert Band", "Jazz Ensemble", "String Orchestra"], and the music sheet is for a concert band, you must output "Concert Band". THIS IS NOT A PART NAME, so it should not be something like "Full Score" or "Flute 1".
- **parts**: A list of the individual parts included within the file. Analyze each page carefully and identify distinct sections:
  - **Cover pages and text-only pages**: If there are cover pages, title pages, program notes, or other descriptive text-only pages (without musical notation), these should be identified as separate parts with:
    - \`label\`: "Cover" (for cover pages) or "Program Notes" (for descriptive text pages).
    - \`is_full_score\`: false.
    - \`start_page\` and \`end_page\`: The exact page range for these sections.
    - \`category\`: "Cover" or "Program Notes", respectively.
  - **Full Score sections**: If there are pages showing the full orchestral/ensemble score (all instruments together on each page), identify these as:
    - \`label\`: "Full Score".
    - \`is_full_score\`: true.
    - \`start_page\` and \`end_page\`: The exact page range for the full score section.
    - \`category\`: "Full Score".
  - **Individual instrument parts**: If there are separate sections for individual instruments (e.g., pages 15-20 are the Flute part, pages 21-25 are the Clarinet part), identify each as a separate part with the appropriate instrument label.
  
  Important guidelines for each part:
  - **label**: The type of part, typically the instrument or section name (e.g., "Flute I", "Percussion II", "Cover", "Program Notes"). Reproduce the label exactly as written in the score, or use descriptive labels for non-musical sections.
  - **is_full_score**: Set to \`true\` only for pages that show the complete ensemble score with all instruments. Set to \`false\` for covers, program notes, and individual instrument parts.
  - **start_page**: The starting page number of this part in the document.
  - **end_page**: The ending page number of this part in the document.
  - **Single-page parts**: If a part consists of only a single page, the \`start_page\` and \`end_page\` should be the same page number. Do not attempt to calculate a range by adding or subtracting from the page number. For example, if a Flute part is only on page 5, then \`start_page\` is 5 and \`end_page\` is 5.
  - **category**: The category of the part, typically for large ensemble scores, it should be something like 'Full Score', 'Woodwinds', 'Brass', 'Percussion', 'Strings', 'Vocal', 'Cover', 'Program Notes', 'Other'.

Please extract all fields as JSON only.
`;

// Updated schema to include mimeType for Files API URIs
const ExtractMusicSheetMetadataInputWithMimeSchema = z.object({
  musicSheetDataUri: z
    .string()
    .describe(
      "A music sheet file, which can be one of: 1) A data URI (format: 'data:<mimetype>;base64,<encoded_data>'), 2) A Gemini Files API URI (format: 'https://generativelanguage.googleapis.com/v1beta/files/<file-id>'), or 3) An HTTP/HTTPS URL pointing to a file."
    ),
  existingArrangementTypes: z.array(z.string()).describe("An array of predefined arrangement type names that the AI must choose from. e.g., ['Concert Band', 'Jazz Ensemble', 'String Orchestra']"),
  mimeType: z.string().optional().describe("The MIME type of the file, required for Files API URIs"),
  additionalInstructions: z.string().optional().describe("Any additional instructions or context for the AI to consider when extracting metadata.")
});

const extractMusicSheetMetadataPrompt = ai.definePrompt({
  name: "extractMusicSheetMetadataPrompt",
  input: { schema: ExtractMusicSheetMetadataInputWithMimeSchema },
  output: { schema: ExtractMusicSheetMetadataOutputSchema },
  prompt: `${systemPrompt}

  Existing Arrangement Types: {{existingArrangementTypes}}
  Music Sheet File: {{media url=musicSheetDataUri contentType=mimeType}}
  
  {{#if additionalInstructions}}
  Additional Instructions: {{additionalInstructions}}
  {{/if}}`,
  config: {
    responseMimeType: "application/json" // Ensure Genkit requests JSON from Gemini
  }
});

const extractMusicSheetMetadataFlow = ai.defineFlow(
  {
    name: "extractMusicSheetMetadataFlow",
    inputSchema: ExtractMusicSheetMetadataInputWithMimeSchema,
    outputSchema: ExtractMusicSheetMetadataOutputSchema
  },
  async (input) => {
    try {
      const { output } = await extractMusicSheetMetadataPrompt(input);
      if (!output) {
        throw new Error("No output from metadata extraction prompt.");
      }
      // Validate that all required fields are present, especially for parts
      if (!output.title || !output.composers || output.composers.length === 0 || !output.arrangement_type || !output.parts || output.parts.length === 0) {
        const missingFields = [];
        if (!output.title) missingFields.push("title");
        if (!output.composers || output.composers.length === 0) missingFields.push("composers");
        if (!output.arrangement_type) missingFields.push("arrangement_type");
        if (!output.parts || output.parts.length === 0) missingFields.push("parts");

        (output.parts || []).forEach((part, index) => {
          if (!part.label) missingFields.push(`parts[${index}].label`);
          if (part.is_full_score === undefined) missingFields.push(`parts[${index}].is_full_score`);
          if (part.start_page === undefined) missingFields.push(`parts[${index}].start_page`);
          if (part.end_page === undefined) missingFields.push(`parts[${index}].end_page`);
        });

        if (missingFields.length > 0) {
          throw new Error(`AI could not extract all required metadata fields. Missing or invalid: ${missingFields.join(", ")}`);
        }
      }
      return output;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Enhanced error handling for common API issues
      if (errorMessage.includes("400 Bad Request")) {
        throw new Error(
          `Invalid request to Gemini API. This could be due to: ` + `1. File too large (max 20 MB), ` + `2. Unsupported file format, ` + `3. Corrupted data URI. ` + `Original error: ${errorMessage}`
        );
      } else if (errorMessage.includes("413")) {
        throw new Error(`Request payload too large. Please reduce the file size to under 20 MB.`);
      } else if (errorMessage.includes("429")) {
        throw new Error(`Rate limit exceeded. Please wait a moment and try again.`);
      }
      // Re-throw other errors as-is
      throw error;
    }
  }
);
