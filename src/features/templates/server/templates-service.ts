import { db } from "@/lib/prisma";

type CreateRecipeInput = {
  userId: string;
  parentRecipeId?: string | null;
  name: string;
  description?: string;
  ingredients: string[];
};

type UpdateRecipeInput = {
  id: string;
  userId: string;
  parentRecipeId?: string | null;
  name: string;
  description?: string;
  ingredients: string[];
};

export async function listRecipes(userId: string) {
  return db.recipe.findMany({
    where: { userId },
    include: {
      parentRecipe: true,
      variations: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createRecipe(input: CreateRecipeInput) {
  return db.recipe.create({
    data: {
      userId: input.userId,
      parentRecipeId: input.parentRecipeId ?? null,
      name: input.name,
      description: input.description,
      ingredients: input.ingredients,
    },
  });
}

export async function updateRecipe(input: UpdateRecipeInput) {
  return db.recipe.update({
    where: {
      id_userId: {
        id: input.id,
        userId: input.userId,
      },
    },
    data: {
      name: input.name,
      parentRecipeId: input.parentRecipeId ?? null,
      description: input.description,
      ingredients: input.ingredients,
    },
  });
}

export async function deleteRecipe(userId: string, id: string) {
  return db.recipe.delete({
    where: {
      id_userId: { id, userId },
    },
  });
}
