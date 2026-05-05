"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type StatPoint = { name?: string; week?: string; count: number };

export function StatsBarChart({
  data,
  xKey,
}: {
  data: StatPoint[];
  xKey: "name" | "week";
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey={xKey} stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip
            contentStyle={{
              borderRadius: "1rem",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "#111113",
            }}
          />
          <Bar dataKey="count" fill="#71717a" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
