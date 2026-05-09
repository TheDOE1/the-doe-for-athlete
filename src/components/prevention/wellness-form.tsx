"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Zap, Flame, Brain, Smile } from "lucide-react";

interface WellnessFormProps {
  onSubmit: (data: WellnessData) => void;
  isLoading?: boolean;
}

interface WellnessData {
  sleep: number;
  fatigue: number;
  soreness: number;
  stress: number;
  mood: number;
  notes: string;
}

const METRICS = [
  { key: "sleep" as const, label: "Sommeil", icon: Moon, color: "text-indigo-500" },
  { key: "fatigue" as const, label: "Fatigue", icon: Zap, color: "text-amber-500" },
  { key: "soreness" as const, label: "Douleur", icon: Flame, color: "text-red-500" },
  { key: "stress" as const, label: "Stress", icon: Brain, color: "text-purple-500" },
  { key: "mood" as const, label: "Humeur", icon: Smile, color: "text-emerald-500" },
];

function RatingSelector({
  value,
  onChange,
  invertColor,
}: {
  value: number;
  onChange: (v: number) => void;
  invertColor?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const isSelected = n <= value;
        let bgClass = "";
        if (isSelected) {
          if (invertColor) {
            // Higher = worse (fatigue, soreness, stress)
            bgClass =
              n <= 3
                ? "bg-emerald-500"
                : n <= 6
                  ? "bg-amber-500"
                  : "bg-red-500";
          } else {
            // Higher = better (sleep, mood)
            bgClass =
              n <= 3
                ? "bg-red-500"
                : n <= 6
                  ? "bg-amber-500"
                  : "bg-emerald-500";
          }
        }

        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-8 w-8 rounded-md text-xs font-bold transition-all ${
              isSelected
                ? `${bgClass} text-white scale-105`
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

export function WellnessForm({ onSubmit, isLoading }: WellnessFormProps) {
  const [data, setData] = useState<WellnessData>({
    sleep: 5,
    fatigue: 5,
    soreness: 5,
    stress: 5,
    mood: 5,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Questionnaire Wellness</CardTitle>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Saisie quotidienne — {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            const invertColor = ["fatigue", "soreness", "stress"].includes(
              metric.key
            );
            return (
              <div key={metric.key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {metric.label}
                  </label>
                  <span className="ml-auto text-sm font-bold text-zinc-900 dark:text-white">
                    {data[metric.key]}/10
                  </span>
                </div>
                <RatingSelector
                  value={data[metric.key]}
                  onChange={(v) => setData({ ...data, [metric.key]: v })}
                  invertColor={invertColor}
                />
              </div>
            );
          })}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notes (optionnel)
            </label>
            <textarea
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              placeholder="Sensation générale, qualité du sommeil..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
