import { create } from 'zustand';

type UiState = {
    isFiltersDrawerOpen: boolean;
    setFiltersDrawerOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
    isFiltersDrawerOpen: false,
    setFiltersDrawerOpen: (open) => set({ isFiltersDrawerOpen: open }),
}));
