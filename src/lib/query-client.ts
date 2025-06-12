import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分鐘
      gcTime: 10 * 60 * 1000, // 10 分鐘
      retry: (failureCount, error) => {
        // 對於 401/403 錯誤不重試
        if (error instanceof Error && error.message.includes("401")) return false;
        if (error instanceof Error && error.message.includes("403")) return false;
        return failureCount < 3;
      }
    },
    mutations: {
      retry: false
    }
  }
});
