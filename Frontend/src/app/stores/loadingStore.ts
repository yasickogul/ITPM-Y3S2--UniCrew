import { create } from "zustand";

interface LoadingState {
  isPageLoading: boolean;
  loadingMessage: string | null;
  startPageLoading: (message?: string) => void;
  stopPageLoading: () => void;
  setLoadingMessage: (message: string | null) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isPageLoading: false,
  loadingMessage: null,

  startPageLoading: (message = "Loading...") =>
    set({ isPageLoading: true, loadingMessage: message }),

  stopPageLoading: () =>
    set({ isPageLoading: false, loadingMessage: null }),

  setLoadingMessage: (message) => set({ loadingMessage: message }),
}));
