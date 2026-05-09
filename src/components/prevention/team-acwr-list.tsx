"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PlayerACWR {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    position: string | null;
  };
  acwr: {
    ratio: number;
    zone: "green" | "orange" | "red";
    acuteLoad: number;
    chronicLoad: number;
    date: string;
  } | null;
}

interface TeamACWRListProps {
  players: PlayerACWR[];
  onSelectPlayer?: (playerId: string) => void;
}

function getZoneBadge(zone: "green" | "orange" | "red") {
  switch (zone) {
    case "green":
      return <Badge variant="success">Optimal</Badge>;
    case "orange":
      return <Badge variant="warning">Attention</Badge>;
    case "red":
      return <Badge variant="danger">Danger</Badge>;
  }
}

function getRatioIcon(ratio: number) {
  if (ratio > 1.3) return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (ratio < 0.8) return <TrendingDown className="h-4 w-4 text-amber-500" />;
  return <Minus className="h-4 w-4 text-emerald-500" />;
}

export function TeamACWRList({ players, onSelectPlayer }: TeamACWRListProps) {
  const alerts = players.filter((p) => p.acwr?.zone === "red");
  const warnings = players.filter((p) => p.acwr?.zone === "orange");

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <Card className="border-red-500/30 bg-red-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-400">
                {alerts.length} joueur{alerts.length > 1 ? "s" : ""} en zone
                danger
              </p>
              <p className="mt-1 text-xs text-red-400/70">
                Recommandation : réduire le volume de -30% minimum pour{" "}
                {alerts.map((a) => a.player.lastName).join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player List */}
      <Card glass>
        <CardHeader>
          <CardTitle>Vue Équipe — ACWR</CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {players.length} joueurs • {alerts.length} alertes • {warnings.length} avertissements
          </p>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {players.map(({ player, acwr }) => (
              <button
                key={player.id}
                onClick={() => onSelectPlayer?.(player.id)}
                className="flex w-full items-center gap-4 px-2 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg"
              >
                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {player.position ?? "—"}
                  </p>
                </div>

                {/* ACWR ratio */}
                {acwr ? (
                  <>
                    <div className="flex items-center gap-2">
                      {getRatioIcon(acwr.ratio)}
                      <span
                        className={`text-lg font-bold tabular-nums ${
                          acwr.zone === "red"
                            ? "text-red-500"
                            : acwr.zone === "orange"
                              ? "text-amber-500"
                              : "text-emerald-500"
                        }`}
                      >
                        {acwr.ratio.toFixed(2)}
                      </span>
                    </div>
                    {getZoneBadge(acwr.zone)}
                  </>
                ) : (
                  <span className="text-xs text-zinc-400">Pas de données</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
