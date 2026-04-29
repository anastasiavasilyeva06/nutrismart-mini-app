export interface FoodAnalysis {
  name: string;
  calories: number; // per 100g
  protein: number; // per 100g
  carbs: number; // per 100g
  fat: number; // per 100g
  fiber: number; // per 100g
  sugar: number; // per 100g
  healthScore: number; // 1-10
  aiSuggestions: string;
  alternatives: string[];
  portionSize: number; // grams
  confidence: number; // 0..1
  imageUrl?: string;
}

export interface Food extends FoodAnalysis {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  portionCalories: number;
  consumedAt: string;
}

