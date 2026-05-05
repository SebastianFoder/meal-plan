"use client";

import { addDays, eachDayOfInterval, format, isWithinInterval } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Template = {
  id: string;
  name: string;
};

type ScheduledMeal = {
  id: string;
  startDate: string;
  durationDays: number;
  mealTemplate: { id: string; name: string };
};

type MealHistory = {
  id: string;
  date: string;
  actualMealName: string | null;
  actualTemplate: { name: string } | null;
};

export default function TimelinePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [scheduledMeals, setScheduledMeals] = useState<ScheduledMeal[]>([]);
  const [history, setHistory] = useState<MealHistory[]>([]);
  const [mealTemplateId, setMealTemplateId] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [durationDays, setDurationDays] = useState("1");

  const load = async () => {
    const [tRes, sRes, hRes] = await Promise.all([
      fetch("/api/templates"),
      fetch("/api/schedule"),
      fetch("/api/history"),
    ]);
    setTemplates((await tRes.json()) as Template[]);
    setScheduledMeals((await sRes.json()) as ScheduledMeal[]);
    setHistory((await hRes.json()) as MealHistory[]);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const days = useMemo(() => {
    const now = new Date();
    return eachDayOfInterval({ start: now, end: addDays(now, 13) });
  }, []);

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <h1 className="text-xl font-semibold">Schedule meal</h1>
        <div className="grid gap-3 md:grid-cols-4">
          <select
            className="h-10 rounded-xl border border-white/10 bg-[#111113] px-3 text-sm text-white"
            value={mealTemplateId}
            onChange={(e) => setMealTemplateId(e.target.value)}
          >
            <option value="">Select template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
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
                  mealTemplateId,
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
        <h2 className="text-lg font-semibold">Upcoming timeline (14 days)</h2>
        <div className="space-y-2">
          {days.map((day) => {
            const activeMeals = scheduledMeals.filter((meal) =>
              isWithinInterval(day, {
                start: new Date(meal.startDate),
                end: addDays(new Date(meal.startDate), meal.durationDays - 1),
              }),
            );
            const dayKey = format(day, "yyyy-MM-dd");
            const eaten = history.find((entry) => format(new Date(entry.date), "yyyy-MM-dd") === dayKey);

            return (
              <div
                key={dayKey}
                className="rounded-xl border border-white/10 bg-[#161618] p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{format(day, "EEE, MMM d")}</p>
                  {eaten ? (
                    <p className="text-xs text-zinc-300">
                      Ate: {eaten.actualTemplate?.name ?? eaten.actualMealName ?? "Logged"}
                    </p>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeMeals.length === 0 ? (
                    <span className="text-zinc-500">No meal planned</span>
                  ) : (
                    activeMeals.map((meal) => (
                      <span
                        key={meal.id}
                        className="rounded-lg border border-white/10 bg-white/10 px-2 py-1"
                      >
                        {meal.mealTemplate.name} ({meal.durationDays}d)
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
                        plannedTemplateId: firstPlanned?.mealTemplate.id,
                        actualMealName: actualMealName || firstPlanned?.mealTemplate.name,
                      }),
                    });
                    await load();
                  }}
                >
                  Mark eaten
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold">Push forward</h2>
        <p className="text-sm text-zinc-400">Use this when you skip a day.</p>
        <div className="flex flex-wrap gap-2">
          {scheduledMeals.slice(0, 8).map((meal) => (
            <Button
              key={meal.id}
              variant="secondary"
              size="sm"
              onClick={async () => {
                await fetch("/api/schedule/push", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ mealId: meal.id, days: 1 }),
                });
                await load();
              }}
            >
              Push {meal.mealTemplate.name} +1 day
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
