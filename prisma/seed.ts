import { addDays, startOfDay } from "date-fns";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "demo@mealplan.local";
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: "Demo User" },
    update: {},
  });

  const templates = await Promise.all(
    [
      {
        name: "Chicken Rice Bowl",
        description: "Lean protein with rice and vegetables",
        ingredients: ["chicken breast", "rice", "broccoli", "soy sauce"],
      },
      {
        name: "Greek Yogurt Parfait",
        description: "Quick breakfast",
        ingredients: ["greek yogurt", "berries", "granola", "honey"],
      },
      {
        name: "Pasta Pomodoro",
        description: "Simple weeknight dinner",
        ingredients: ["pasta", "tomato", "garlic", "olive oil", "basil"],
      },
    ].map((meal) =>
      prisma.mealTemplate.upsert({
        where: { userId_name: { userId: user.id, name: meal.name } },
        create: { userId: user.id, ...meal },
        update: { ...meal },
      }),
    ),
  );

  const today = startOfDay(new Date());
  await prisma.scheduledMeal.deleteMany({ where: { userId: user.id } });
  await prisma.scheduledMeal.createMany({
    data: [
      { userId: user.id, mealTemplateId: templates[0].id, startDate: today, durationDays: 2, orderIndex: 1 },
      { userId: user.id, mealTemplateId: templates[1].id, startDate: addDays(today, 2), durationDays: 1, orderIndex: 2 },
      { userId: user.id, mealTemplateId: templates[2].id, startDate: addDays(today, 3), durationDays: 3, orderIndex: 3 },
    ],
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
