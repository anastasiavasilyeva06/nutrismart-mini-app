import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Dev seed: create one demo user if not exists
  const telegramId = "demo-telegram-id";
  const user = await prisma.user.upsert({
    where: { telegramId },
    update: {},
    create: {
      telegramId,
      firstName: "Demo",
      lastName: "User",
      username: "demo",
      language: "en",
      goals: ["maintain"],
      allergies: [],
      dislikedFoods: [],
      preferredCuisine: []
    }
  });

  await prisma.progress.upsert({
    where: { userId_date: { userId: user.id, date: new Date(new Date().toDateString()) } },
    update: {},
    create: {
      userId: user.id,
      date: new Date(new Date().toDateString()),
      caloriesGoal: 2000,
      proteinGoal: 120,
      carbsGoal: 220,
      fatGoal: 70
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

