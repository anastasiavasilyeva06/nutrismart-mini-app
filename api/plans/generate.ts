import { GoogleGenerativeAI } from "@google/generative-ai";
import { mustGetEnv } from "../_lib/env";
import { readJson } from "../_lib/body";
import { getOrCreateUser } from "../_lib/user";
import { prisma } from "../_lib/prisma";

function safeJsonObject(text: string) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Invalid meal plan response format");
  return JSON.parse(m[0]);
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const telegramId = String(req.headers["x-telegram-id"] ?? "demo");
    const user = await getOrCreateUser(telegramId);
    const pref = await readJson(req);

    const apiKey = mustGetEnv("GEMINI_API_KEY");
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
    const model = genAI.getGenerativeModel({ model: modelName });

    const duration = Number(pref.duration ?? 7);
    const calorieGoal = Number(pref.calorieGoal ?? 2000);
    const dietType = String(pref.dietType ?? "balanced");
    const budget = Number(pref.budget ?? 50);
    const excludeIngredients = Array.isArray(pref.excludeIngredients) ? pref.excludeIngredients.map(String) : [];
    const name = String(pref.name ?? "AI Meal Plan");

    const prompt = `Create a ${duration}-day meal plan with the following requirements:
- Daily calories: ${calorieGoal}
- Diet type: ${dietType}
- Daily budget: $${budget}
- Exclude: ${excludeIngredients.join(", ") || "none"}

Respond ONLY with valid JSON object with keys as ISO dates (YYYY-MM-DD):
{
  "meals": {
    "2026-01-01": {
      "breakfast": {"name":"...", "calories": 0, "ingredients": ["..."]},
      "lunch": {"name":"...", "calories": 0, "ingredients": ["..."]},
      "dinner": {"name":"...", "calories": 0, "ingredients": ["..."]},
      "snack": {"name":"...", "calories": 0, "ingredients": ["..."]}
    }
  }
}
Keep meals practical and balanced.`;

    const result = await model.generateContent(prompt);
    const json = safeJsonObject(result.response.text());
    const meals = json.meals ?? {};

    // deactivate previous plans
    await prisma.mealPlan.updateMany({ where: { userId: user.id, isActive: true }, data: { isActive: false } });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Math.max(1, duration));

    const plan = await prisma.mealPlan.create({
      data: {
        userId: user.id,
        name,
        startDate,
        endDate,
        dailyCalories: calorieGoal,
        meals: JSON.stringify(meals),
        isActive: true,
        isGenerated: true
      }
    });

    res.status(200).json({
      plan: {
        id: plan.id,
        name: plan.name,
        startDate: plan.startDate.toISOString(),
        endDate: plan.endDate.toISOString(),
        dailyCalories: plan.dailyCalories,
        meals,
        isActive: plan.isActive
      }
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Failed to generate meal plan" });
  }
}

