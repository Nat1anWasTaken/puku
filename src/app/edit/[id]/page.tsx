import { ArrangementEditPage } from "@/components/edit/arrangement-edit-page";
import { getArrangementByIdServer } from "@/lib/services/arrangement-service-server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { id: arrangementId } = await params;
  const supabase = await createClient();

  // 檢查用戶是否已認證
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  let arrangement;
  try {
    // 獲取樂曲資料，並確保只有擁有者才能編輯
    arrangement = await getArrangementByIdServer(arrangementId, user.id);
  } catch {
    // 如果樂曲不存在或用戶無權限編輯，重定向到樂譜庫
    redirect("/library");
  }

  return <ArrangementEditPage arrangement={arrangement} />;
}
