"use client";

import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isWithinInterval,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Recipe = {
  id: string;
  name: string;
  parentRecipe?: { id: string; name: string } | null;
};

type ScheduledMeal = {
  id: string;
  startDate: string;
  durationDays: number;
  recipe: { id: string; name: string; parentRecipe?: { id: string; name: string } | null };
};

type MealHistory = {
  id: string;
  date: string;
  actualMealName: string | null;
  actualRecipe: { name: string } | null;
};

export default function TimelinePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);
  const [history, setHistory] = useState<MealHistory[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recipeId, setRecipeId] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [durationDays, setDurationDays] = useState("1");

  const load = async () => {
    try {
      const [tRes, sRes, hRes] = await Promise.all([
        fetch("/api/recipes"),
        fetch("/api/schedule"),
        fetch("/api/history"),
      ]);

      if (!tRes.ok || !sRes.ok || !hRes.ok) {
        throw new Error("Failed to load timeline data.");
      }

      setRecipes((await tRes.json()) as Recipe[]);
      setScheduledMeals((await sRes.json()) as ScheduledMeal[]);
      setHistory((await hRes.json()) as MealHistory[]);
      setLoadError(null);
    } catch {
      setLoadError("Could not load timeline data. Try refreshing the page.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const weeks = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return [-1, 0, 1].map((offset) => {
      const weekStart = addWeeks(currentWeekStart, offset);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return {
        key: offset,
        label:
          offset === -1
            ? "Previous week"
            : offset === 0
              ? "Current week"
              : "Next week",
        days: eachDayOfInterval({ start: weekStart, end: weekEnd }),
      };
    });
  }, []);

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Schedule recipie</h1>
        <div className="grid gap-3 md:grid-cols-4">
          <select
            className="h-10 rounded-xl border border-white/10 bg-[#111113] px-3 text-sm text-white"
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
          >
            <option value="">Select recipie</option>
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input
            type="number"
            min={1}
            max={30}
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
          />
          <Button
            onClick={async () => {
              await fetch("/api/schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  recipeId,
                  startDate,
                  durationDays: Number(durationDays),
                }),
              });
              await load();
            }}
          >
            Add to timeline
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Three-week timeline</h2>
        {loadError ? <p className="text-sm text-red-300">{loadError}</p> : null}
        <div className="space-y-4">
          {weeks.map((week) => (
            <div key={week.key} className="space-y-2">
              <p className="text-sm font-medium text-zinc-300">{week.label}</p>
              <div className="grid gap-2 md:grid-cols-7">
                {week.days.map((day) => {
                  const activeMeals = scheduledMeals.filter((meal) =>
                    isWithinInterval(day, {
                      start: new Date(meal.startDate),
                      end: addDays(new Date(meal.startDate), meal.durationDays - 1),
                    }),
                  );
                  const dayKey = format(day, "yyyy-MM-dd");
                  const eaten = history.find(
                    (entry) => format(new Date(entry.date), "yyyy-MM-dd") === dayKey,
                  );

                  return (
                    <div
                      key={dayKey}
                      className="rounded-xl border border-white/10 bg-[#161618] p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{format(day, "EEE d")}</p>
                        {eaten ? (
                          <p className="text-xs text-zinc-300">
                            Ate: {eaten.actualRecipe?.name ?? eaten.actualMealName ?? "Logged"}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activeMeals.length === 0 ? (
                          <span className="text-zinc-500">No meal</span>
                        ) : (
                          activeMeals.map((meal) => (
                            <span
                              key={meal.id}
                              className="rounded-lg border border-white/10 bg-white/10 px-2 py-1"
                            >
                              {meal.recipe.name}
                              {meal.recipe.parentRecipe ? ` (${meal.recipe.parentRecipe.name} variation)` : ""}{" "}
                              ({meal.durationDays}d)
                            </span>
                          ))
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={async () => {
                          const actualMealName = window.prompt("What did you actually eat?") ?? "";
                          const firstPlanned = activeMeals[0];
                          await fetch("/api/history", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              date: dayKey,
                              plannedScheduledMealId: firstPlanned?.id,
                              plannedRecipeId: firstPlanned?.recipe.id,
                              actualMealName: actualMealName || firstPlanned?.recipe.name,
                            }),
                          });
                          await load();
                        }}
                      >
                        Mark eaten
                      </Button>
                      {activeMeals[0] ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          onClick={async () => {
                            await fetch("/api/schedule/push", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ mealId: activeMeals[0].id, days: 1 }),
                            });
                            await load();
                          }}
                        >
                          Push day +1
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
