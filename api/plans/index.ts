import { getOrCreateUser } from "../_lib/user";
import { prisma } from "../_lib/prisma";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const telegramId = String(req.headers["x-telegram-id"] ?? "demo");
    const user = await getOrCreateUser(telegramId);

    const plans = await prisma.mealPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const active = plans.find((p) => p.isActive) ?? null;

    res.status(200).json({
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
        dailyCalories: p.dailyCalories,
        meals: JSON.parse(p.meals),
        isActive: p.isActive
      })),
      activePlan: active
        ? {
            id: active.id,
            name: active.name,
            startDate: active.startDate.toISOString(),
            endDate: active.endDate.toISOString(),
            dailyCalories: active.dailyCalories,
            meals: JSON.parse(active.meals),
            isActive: active.isActive
          }
        : null
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Failed to fetch meal plans" });
  }
}

