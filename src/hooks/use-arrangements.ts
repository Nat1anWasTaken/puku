import { toaster } from "@/components/ui/toaster";
import { ArrangementWithDetails, deleteArrangement, getUserArrangements, updateArrangement, UpdateArrangementData } from "@/lib/services/arrangement-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useArrangements(userId: string) {
  const queryClient = useQueryClient();

  const {
    data: arrangements = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["arrangements", userId],
    queryFn: () => getUserArrangements(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000 // 5 分鐘
  });

  const updateArrangementMutation = useMutation({
    mutationFn: ({ arrangementId, data }: { arrangementId: string; data: UpdateArrangementData }) => updateArrangement(arrangementId, data),
    onSuccess: (_, { arrangementId, data }) => {
      // 樂觀更新本地快取
      queryClient.setQueryData(["arrangements", userId], (old: ArrangementWithDetails[] = []) => old.map((arr) => (arr.id === arrangementId ? { ...arr, ...data } : arr)));
      toaster.success({
        title: "更新成功",
        description: "編曲資訊已成功更新"
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : "Failed to update arrangement";
      toaster.error({
        title: "更新失敗",
        description: errorMessage
      });
    }
  });

  const deleteArrangementMutation = useMutation({
    mutationFn: (arrangementId: string) => deleteArrangement(arrangementId),
    onSuccess: (_, arrangementId) => {
      // 樂觀更新本地快取
      queryClient.setQueryData(["arrangements", userId], (old: ArrangementWithDetails[] = []) => old.filter((arr) => arr.id !== arrangementId));
      toaster.success({
        title: "刪除成功",
        description: "編曲已成功刪除"
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete arrangement";
      toaster.error({
        title: "刪除失敗",
        description: errorMessage
      });
    }
  });

  const updateArrangementInList = (arrangementId: string, updatedData: Partial<ArrangementWithDetails>) => {
    queryClient.setQueryData(["arrangements", userId], (old: ArrangementWithDetails[] = []) => old.map((arr) => (arr.id === arrangementId ? { ...arr, ...updatedData } : arr)));
  };

  const removeArrangementFromList = (arrangementId: string) => {
    queryClient.setQueryData(["arrangements", userId], (old: ArrangementWithDetails[] = []) => old.filter((arr) => arr.id !== arrangementId));
  };

  return {
    arrangements,
    isLoading,
    error: error?.message || null,
    refetch,
    updateArrangementInList,
    removeArrangementFromList,
    updateArrangement: updateArrangementMutation.mutate,
    deleteArrangement: deleteArrangementMutation.mutate,
    isUpdating: updateArrangementMutation.isPending,
    isDeleting: deleteArrangementMutation.isPending
  };
}

export function useArrangementActions() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ arrangementId, data }: { arrangementId: string; data: UpdateArrangementData }) => updateArrangement(arrangementId, data),
    onSuccess: () => {
      // 重新獲取所有相關的 arrangements 查詢
      queryClient.invalidateQueries({ queryKey: ["arrangements"] });
      toaster.success({
        title: "更新成功",
        description: "編曲資訊已成功更新"
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : "Failed to update arrangement";
      toaster.error({
        title: "更新失敗",
        description: errorMessage
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (arrangementId: string) => deleteArrangement(arrangementId),
    onSuccess: () => {
      // 重新獲取所有相關的 arrangements 查詢
      queryClient.invalidateQueries({ queryKey: ["arrangements"] });
      toaster.success({
        title: "刪除成功",
        description: "編曲已成功刪除"
      });
    },
    onError: (err) => {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete arrangement";
      toaster.error({
        title: "刪除失敗",
        description: errorMessage
      });
    }
  });

  const editArrangement = async (arrangementId: string, data: UpdateArrangementData): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ arrangementId, data });
      return true;
    } catch {
      return false;
    }
  };

  const removeArrangement = async (arrangementId: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(arrangementId);
      return true;
    } catch {
      return false;
    }
  };

  return {
    editArrangement,
    removeArrangement,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
