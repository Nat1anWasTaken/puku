"use client";

export interface ThumbnailResult {
  thumbnailUrl: string | null;
  previewPath: string | null;
}

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
