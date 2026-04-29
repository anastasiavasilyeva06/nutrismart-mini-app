import { prisma } from "./prisma";

export async function getOrCreateUser(telegramId: string) {
  const tid = telegramId?.trim() ? telegramId.trim() : "demo";
  const existing = await prisma.user.findUnique({ where: { telegramId: tid } });
  if (existing) return existing;

  return prisma.user.create({
    data: {
      telegramId: tid,
      firstName: tid === "demo" ? "Demo" : undefined,
      lastName: undefined,
      username: undefined,
      language: "en",
      goals: ["maintain"],
      allergies: [],
      dislikedFoods: [],
      preferredCuisine: []
    }
  });
}

