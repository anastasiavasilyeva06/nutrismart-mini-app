import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";
import type { Food } from "../types/food";
import { useUserStore } from "./userStore";

interface FoodState {
  foods: Food[];
  todayFoods: Food[];
  isLoading: boolean;
  error: string | null;

  logFood: (foodData: Partial<Food>) => Promise<void>;
  fetchFoodHistory: (options?: { limit?: number; mealType?: string; startDate?: string; endDate?: string }) => Promise<void>;
  fetchTodayFoods: () => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useFoodStore = create<FoodState>()(
  persist(
    (set, get) => ({
      foods: [],
      todayFoods: [],
      isLoading: false,
      error: null,

      logFood: async (foodData) => {
        set({ isLoading: true, error: null });
        try {
          const telegramId = useUserStore.getState().user?.telegramId;
          const response = await api.post("/food/log", foodData, {
            headers: telegramId ? { "x-telegram-id": telegramId } : undefined
          });

          const newFood = response.data.food as Food;
          set((state) => ({ foods: [newFood, ...state.foods], isLoading: false }));
        } catch (error: any) {
          set({ error: error?.response?.data?.error || "Failed to log food", isLoading: false });
          throw error;
        }
      },

      fetchFoodHistory: async (options = {}) => {
        set({ isLoading: true, error: null });
        try {
          const telegramId = useUserStore.getState().user?.telegramId;
          const response = await api.get("/food/history", {
            params: options,
            headers: telegramId ? { "x-telegram-id": telegramId } : undefined
          });
          set({ foods: response.data, isLoading: false });
        } catch (error: any) {
          set({ error: error?.response?.data?.error || "Failed to fetch food history", isLoading: false });
        }
      },

      fetchTodayFoods: async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        await get().fetchFoodHistory({ startDate: today.toISOString(), endDate: tomorrow.toISOString(), limit: 100 });
        set({ todayFoods: get().foods });
      },

      deleteFood: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const telegramId = useUserStore.getState().user?.telegramId;
          await api.delete(`/food/${id}`, {
            headers: telegramId ? { "x-telegram-id": telegramId } : undefined
          });
          set((state) => ({
            foods: state.foods.filter((f) => f.id !== id),
            todayFoods: state.todayFoods.filter((f) => f.id !== id),
            isLoading: false
          }));
        } catch (error: any) {
          set({ error: error?.response?.data?.error || "Failed to delete food", isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: "food-store",
      partialize: (state) => ({ foods: state.foods.slice(0, 50), todayFoods: state.todayFoods })
    }
  )
);

