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

    const limit = Number(req.query?.limit ?? 50);
    const mealType = req.query?.mealType ? String(req.query.mealType) : undefined;
    const startDate = req.query?.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query?.endDate ? new Date(String(req.query.endDate)) : undefined;

    const where: any = { userId: user.id };
    if (mealType) where.mealType = mealType;
    if (startDate || endDate) {
      where.consumedAt = {};
      if (startDate) where.consumedAt.gte = startDate;
      if (endDate) where.consumedAt.lte = endDate;
    }

    const foods = await prisma.food.findMany({
      where,
      orderBy: { consumedAt: "desc" },
      take: Math.min(limit, 200)
    });

    res.status(200).json(
      foods.map((f) => ({
        ...f,
        consumedAt: f.consumedAt.toISOString()
      }))
    );
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Failed to get food history" });
  }
}

