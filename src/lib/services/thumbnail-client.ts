"use client";

import { createClient } from "@/lib/supabase/client";

export interface ThumbnailResult {
  thumbnailUrl: string | null;
  previewPath: string | null;
}

export async function getThumbnailUrl(previewPath: string): Promise<string | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.storage.from("thumbnails").createSignedUrl(previewPath, 60 * 60); // 1 hour expiry

    if (error) {
      console.error("Failed to create signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error getting thumbnail URL:", error);
    return null;
  }
}

export async function getArrangementThumbnail(arrangementId: string): Promise<ThumbnailResult> {
  const supabase = createClient();

  try {
    // Get the current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("用戶未登入");
    }

    // Query arrangement record
    const { data: arrangement, error: fetchError } = await supabase.from("arrangements").select("id, file_path, preview_path, owner_id").eq("id", arrangementId).single();

    if (fetchError || !arrangement) {
      throw new Error("找不到編曲");
    }

    // Check user permission (only the owner can access)
    if (arrangement.owner_id !== user.id) {
      throw new Error("沒有權限存取此編曲");
    }

    // If thumbnail already exists, return it
    if (arrangement.preview_path) {
      const thumbnailUrl = await getThumbnailUrl(arrangement.preview_path);
      return {
        thumbnailUrl,
        previewPath: arrangement.preview_path
      };
    }

    // If no thumbnail exists, return null
    return {
      thumbnailUrl: null,
      previewPath: null
    };
  } catch (error) {
    console.error("Error getting arrangement thumbnail:", error);
    return {
      thumbnailUrl: null,
      previewPath: null
    };
  }
}
