import { useLoadingStore } from "../stores/loadingStore";

export const usePageLoading = () => {
  const { isPageLoading, loadingMessage, startPageLoading, stopPageLoading } =
    useLoadingStore();

  return {
    isPageLoading,
    loadingMessage,
    startLoading: startPageLoading,
    stopLoading: stopPageLoading,
  };
};
