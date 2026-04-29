import { create } from "zustand";
import { telegram } from "../services/telegram";

export type User = {
  telegramId?: string;
  firstName?: string;
  caloriesGoal?: number;
  dietType?: string;
  budget?: number;
  allergies?: string[];
};

export const useUserStore = create<{ user: User | null }>(() => {
  const tgUser = telegram.getUser();
  const user: User = tgUser
    ? {
        telegramId: String(tgUser.id),
        firstName: tgUser.first_name,
        caloriesGoal: 2000,
        dietType: "balanced",
        budget: 50,
        allergies: []
      }
    : {
        telegramId: "demo",
        firstName: "Demo",
        caloriesGoal: 2000,
        dietType: "balanced",
        budget: 50,
        allergies: []
      };

  return { user };
});

