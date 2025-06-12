import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateThumbnail } from "@/lib/services/thumbnail-service";

export async function GET(request: NextRequest, { params }: { params: { arrangementId: string } }) {
  try {
    const { arrangementId } = params;

    if (!arrangementId) {
      return NextResponse.json({ error: "Missing arrangement ID" }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if user is logged in
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query arrangement record
    const { data: arrangement, error: fetchError } = await supabase.from("arrangements").select("id, file_path, preview_path, owner_id").eq("id", arrangementId).single();

    if (fetchError || !arrangement) {
      return NextResponse.json({ error: "Arrangement not found" }, { status: 404 });
    }

    // Check user permission (only the owner can access)
    if (arrangement.owner_id !== user.id) {
      return NextResponse.json({ error: "No permission to access this arrangement" }, { status: 403 });
    }

    // If thumbnail already exists, return it directly
    if (arrangement.preview_path) {
      const { data } = supabase.storage.from("thumbnails").getPublicUrl(arrangement.preview_path);

      return NextResponse.json({
        thumbnailUrl: data.publicUrl,
        previewPath: arrangement.preview_path
      });
    }

    // Check if PDF file exists
    if (!arrangement.file_path) {
      return NextResponse.json({ error: "Arrangement PDF file not uploaded yet" }, { status: 400 });
    }

    // Generate thumbnail
    const { previewPath } = await generateThumbnail(arrangementId, arrangement.file_path);

    // Update preview_path in the database
    const { error: updateError } = await supabase.from("arrangements").update({ preview_path: previewPath }).eq("id", arrangementId);

    if (updateError) {
      console.error("Failed to update preview_path:", updateError);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    // Return thumbnail URL
    const { data } = supabase.storage.from("thumbnails").getPublicUrl(previewPath);

    return NextResponse.json({
      thumbnailUrl: data.publicUrl,
      previewPath
    });
  } catch (error) {
    console.error("Thumbnail generation failed:", error);
    return NextResponse.json({ error: "Thumbnail generation failed" }, { status: 500 });
  }
}
