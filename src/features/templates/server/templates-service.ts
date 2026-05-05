import { db } from "@/lib/prisma";

type CreateTemplateInput = {
  userId: string;
  name: string;
  description?: string;
  ingredients: string[];
};

type UpdateTemplateInput = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  ingredients: string[];
};

export async function listTemplates(userId: string) {
  return db.mealTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTemplate(input: CreateTemplateInput) {
  return db.mealTemplate.create({
    data: {
      userId: input.userId,
      name: input.name,
      description: input.description,
      ingredients: input.ingredients,
    },
  });
}

export async function updateTemplate(input: UpdateTemplateInput) {
  return db.mealTemplate.update({
    where: {
      id_userId: {
        id: input.id,
        userId: input.userId,
      },
    },
    data: {
      name: input.name,
      description: input.description,
      ingredients: input.ingredients,
    },
  });
}

export async function deleteTemplate(userId: string, id: string) {
  return db.mealTemplate.delete({
    where: {
      id_userId: { id, userId },
    },
  });
}
