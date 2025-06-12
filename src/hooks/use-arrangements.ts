import { useState, useEffect } from "react";
import { getUserArrangements, updateArrangement, deleteArrangement, ArrangementWithDetails, UpdateArrangementData } from "@/lib/services/arrangement-service";
import { toaster } from "@/components/ui/toaster";

export function useArrangements(userId: string) {
  const [arrangements, setArrangements] = useState<ArrangementWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArrangements = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getUserArrangements(userId);
      setArrangements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch arrangements";
      setError(errorMessage);
      toaster.error({
        title: "載入失敗",
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArrangements();
  }, [userId]);

  const updateArrangementInList = (arrangementId: string, updatedData: Partial<ArrangementWithDetails>) => {
    setArrangements((prev) => prev.map((arr) => (arr.id === arrangementId ? { ...arr, ...updatedData } : arr)));
  };

  const removeArrangementFromList = (arrangementId: string) => {
    setArrangements((prev) => prev.filter((arr) => arr.id !== arrangementId));
  };

  return {
    arrangements,
    isLoading,
    error,
    refetch: fetchArrangements,
    updateArrangementInList,
    removeArrangementFromList
  };
}

export function useArrangementActions() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const editArrangement = async (arrangementId: string, userId: string, data: UpdateArrangementData): Promise<boolean> => {
    try {
      setIsUpdating(true);
      await updateArrangement(arrangementId, userId, data);
      toaster.success({
        title: "更新成功",
        description: "編曲資訊已成功更新"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update arrangement";
      toaster.error({
        title: "更新失敗",
        description: errorMessage
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const removeArrangement = async (arrangementId: string, userId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      await deleteArrangement(arrangementId, userId);
      toaster.success({
        title: "刪除成功",
        description: "編曲已成功刪除"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete arrangement";
      toaster.error({
        title: "刪除失敗",
        description: errorMessage
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    editArrangement,
    removeArrangement,
    isUpdating,
    isDeleting
  };
}
