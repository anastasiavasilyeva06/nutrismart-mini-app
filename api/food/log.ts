import { readJson } from "../_lib/body";
import { getOrCreateUser } from "../_lib/user";
import { prisma } from "../_lib/prisma";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const telegramId = String(req.headers["x-telegram-id"] ?? "demo");
    const user = await getOrCreateUser(telegramId);
    const body = await readJson(req);

    const food = await prisma.food.create({
      data: {
        userId: user.id,
        name: String(body.name ?? "Unknown"),
        imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
        calories: Number(body.calories ?? 0),
        protein: Number(body.protein ?? 0),
        carbs: Number(body.carbs ?? 0),
        fat: Number(body.fat ?? 0),
        fiber: body.fiber != null ? Number(body.fiber) : undefined,
        sugar: body.sugar != null ? Number(body.sugar) : undefined,
        portionSize: Number(body.portionSize ?? 0),
        portionCalories: Number(body.portionCalories ?? 0),
        healthScore: body.healthScore != null ? Number(body.healthScore) : undefined,
        aiSuggestions: body.aiSuggestions ? String(body.aiSuggestions) : undefined,
        alternatives: Array.isArray(body.alternatives) ? body.alternatives.map(String) : [],
        mealType: String(body.mealType ?? "lunch")
      }
    });

    res.status(200).json({ success: true, food: { ...food, consumedAt: food.consumedAt.toISOString() } });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Failed to log food" });
  }
}

