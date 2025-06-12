"use client";

export interface ThumbnailResult {
  thumbnailUrl: string | null;
  previewPath: string | null;
}

/**
 * Fetches thumbnail data for a specific arrangement from the API.
 * @param arrangementId - The arrangement ID to fetch thumbnail for
 * @returns Promise<ThumbnailResult> - Returns thumbnail URL and preview path, or null values if not found
 * @description Makes a client-side API call to retrieve thumbnail information. Returns null values on error or when thumbnail doesn't exist.
 */
export async function getThumbnailForArrangement(arrangementId: string): Promise<ThumbnailResult> {
  try {
    const response = await fetch(`/api/thumbnails/${arrangementId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          thumbnailUrl: null,
          previewPath: null
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      thumbnailUrl: data.thumbnailUrl || null,
      previewPath: data.previewPath || null
    };
  } catch (error) {
    console.error("獲取縮圖失敗:", error);
    return {
      thumbnailUrl: null,
      previewPath: null
    };
  }
}
