import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // Auth state
      token: null,
      user: null,

      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),

      // UI state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Wardrobe state
      selectedItems: [],
      setSelectedItems: (items) => set({ selectedItems: items }),
      toggleItemSelection: (itemId) =>
        set((state) => ({
          selectedItems: state.selectedItems.includes(itemId)
            ? state.selectedItems.filter((id) => id !== itemId)
            : [...state.selectedItems, itemId],
        })),
      clearSelectedItems: () => set({ selectedItems: [] }),

      // Filter state
      filters: {
        category: null,
        style: null,
        season: null,
        color: null,
      },
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      clearFilters: () =>
        set({
          filters: {
            category: null,
            style: null,
            season: null,
            color: null,
          },
        }),

      // Shopping item state
      shoppingItem: null,
      setShoppingItem: (item) => set({ shoppingItem: item }),
      clearShoppingItem: () => set({ shoppingItem: null }),
    }),
    {
      name: 'wardrobe-ai-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        sidebarOpen: state.sidebarOpen,
        filters: state.filters,
      }),
    }
  )
);
