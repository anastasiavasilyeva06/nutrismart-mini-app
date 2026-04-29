import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api";
import type { MealPlan, MealPlanPreferences } from "../types/plan";
import { useUserStore } from "./userStore";

interface PlanState {
  plans: MealPlan[];
  activePlan: MealPlan | null;
  isLoading: boolean;
  error: string | null;

  generatePlan: (preferences: MealPlanPreferences) => Promise<void>;
  fetchPlans: () => Promise<void>;
  clearError: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plans: [],
      activePlan: null,
      isLoading: false,
      error: null,

      generatePlan: async (preferences) => {
        set({ isLoading: true, error: null });
        try {
          const telegramId = useUserStore.getState().user?.telegramId;
          const response = await api.post("/plans/generate", preferences, {
            headers: telegramId ? { "x-telegram-id": telegramId } : undefined
          });
          const newPlan = response.data.plan as MealPlan;
          set((state) => ({ plans: [newPlan, ...state.plans], activePlan: newPlan, isLoading: false }));
        } catch (error: any) {
          set({ error: error?.response?.data?.error || "Failed to generate meal plan", isLoading: false });
          throw error;
        }
      },

      fetchPlans: async () => {
        set({ isLoading: true, error: null });
        try {
          const telegramId = useUserStore.getState().user?.telegramId;
          const response = await api.get("/plans", {
            headers: telegramId ? { "x-telegram-id": telegramId } : undefined
          });
          set({ plans: response.data.plans, activePlan: response.data.activePlan, isLoading: false });
        } catch (error: any) {
          set({ error: error?.response?.data?.error || "Failed to fetch meal plans", isLoading: false });
        }
      },

      clearError: () => set({ error: null })
    }),
    { name: "plan-store", partialize: (state) => ({ plans: state.plans.slice(0, 10), activePlan: state.activePlan }) }
  )
);

