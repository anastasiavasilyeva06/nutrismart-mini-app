export interface MealPlanPreferences {
  name: string;
  duration: number;
  calorieGoal: number;
  dietType: string;
  budget: number;
  excludeIngredients: string[];
}

export interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dailyCalories: number;
  meals: any;
  isActive: boolean;
}

