"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeekData {
  week: string;
  totalLoad: number;
  planned?: number;
}

interface LoadChartProps {
  data: WeekData[];
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

interface TooltipPayload {
  payload?: { week: string; totalLoad: number; planned?: number };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: WeekData }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]!.payload;
  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-semibold text-zinc-400 mb-2">{d.week}</p>
      <p className="text-sm text-white">
        Charge réelle :{" "}
        <span className="font-bold text-blue-400">
          {Math.round(d.totalLoad).toLocaleString()} UA
        </span>
      </p>
      {d.planned && (
        <p className="text-sm text-zinc-400">
          Planifiée :{" "}
          <span className="font-bold text-purple-400">
            {Math.round(d.planned).toLocaleString()} UA
          </span>
        </p>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LoadChart({ data }: LoadChartProps) {
  if (!data.length) {
    return (
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Charge Planifiée vs Réalisée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">
            Aucune donnée de charge disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  // Average for reference line
  const avg =
    data.reduce((s, d) => s + d.totalLoad, 0) / Math.max(1, data.length);

  return (
    <Card glass>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Charge Hebdomadaire (sRPE)
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-blue-500" />
              Réalisée
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-purple-500/60" />
              Planifiée
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -8, bottom: 4 }}
            barGap={2}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <ReferenceLine
              y={avg}
              stroke="rgba(99,102,241,0.4)"
              strokeDasharray="6 3"
              label={{
                value: "moy",
                fill: "rgba(99,102,241,0.7)",
                fontSize: 10,
              }}
            />
            {data.some((d) => d.planned) && (
              <Bar
                dataKey="planned"
                fill="rgba(168,85,247,0.3)"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            )}
            <Bar
              dataKey="totalLoad"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.totalLoad > avg * 1.3
                      ? "#f97316"
                      : entry.totalLoad > avg * 1.1
                      ? "#3b82f6"
                      : "#22c55e"
                  }
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
