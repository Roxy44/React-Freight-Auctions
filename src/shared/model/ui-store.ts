import { create } from 'zustand';

/**
 * Point UI-state only (drawers, transient flags).
 * List filters live in URL search params and enter TanStack Query keys — not here.
 */
type UiState = {
    isFiltersDrawerOpen: boolean;
    setFiltersDrawerOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
    isFiltersDrawerOpen: false,
    setFiltersDrawerOpen: (open) => set({ isFiltersDrawerOpen: open }),
}));
