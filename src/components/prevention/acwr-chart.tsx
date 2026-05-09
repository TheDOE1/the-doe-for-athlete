"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ACWRDataPoint {
  date: string;
  ratio: number;
  acuteLoad: number;
  chronicLoad: number;
  zone: "green" | "orange" | "red";
}

interface ACWRChartProps {
  data: ACWRDataPoint[];
  playerName?: string;
}

export function ACWRChart({ data, playerName }: ACWRChartProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      ...entry,
      date: new Date(entry.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
    }));

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>
          ACWR Ratio{playerName ? ` — ${playerName}` : ""}
        </CardTitle>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Ratio Charge Aiguë / Charge Chronique (EWMA)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="acwrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
              {/* Danger zone background */}
              <ReferenceArea y1={1.5} y2={2.5} fill="#ef4444" fillOpacity={0.05} />
              {/* Warning zone background */}
              <ReferenceArea y1={1.3} y2={1.5} fill="#f59e0b" fillOpacity={0.05} />
              {/* Optimal zone background */}
              <ReferenceArea y1={0.8} y2={1.3} fill="#10b981" fillOpacity={0.05} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                stroke="#3f3f46"
              />
              <YAxis
                domain={[0, 2.5]}
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                stroke="#3f3f46"
                ticks={[0, 0.5, 0.8, 1.0, 1.3, 1.5, 2.0, 2.5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#fafafa" }}
                formatter={(value) => [Number(value).toFixed(2), "Ratio"]}
              />
              {/* Threshold lines */}
              <ReferenceLine
                y={1.5}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "Danger", fill: "#ef4444", fontSize: 10, position: "right" }}
              />
              <ReferenceLine
                y={1.3}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: "Attention", fill: "#f59e0b", fontSize: 10, position: "right" }}
              />
              <ReferenceLine
                y={0.8}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: "Sous-entraîné", fill: "#10b981", fontSize: 10, position: "right" }}
              />
              <Area
                type="monotone"
                dataKey="ratio"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#acwrGradient)"
                activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
