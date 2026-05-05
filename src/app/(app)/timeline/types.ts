export type Recipe = {
  id: string;
  name: string;
  parentRecipe?: { id: string; name: string } | null;
};

export type ScheduledMeal = {
  id: string;
  startDate: string;
  durationDays: number;
  recipe: {
    id: string;
    name: string;
    description?: string | null;
    ingredients?: string[];
    parentRecipe?: { id: string; name: string } | null;
  };
};

export type MealHistory = {
  id: string;
  date: string;
  actualMealName: string | null;
  actualRecipe: { name: string } | null;
};

export type TimelineWeek = {
  key: -1 | 0 | 1;
  label: string;
  days: Date[];
};
