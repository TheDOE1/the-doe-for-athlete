"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, ChevronRight } from "lucide-react";

interface Protocol {
  id: string;
  type: "nordic" | "copenhagen" | "reverse_nordic";
  complianceRate: number | null;
  frequency: number;
  exercises: Array<{ name: string; sets: number; reps: number; load?: string }>;
  startDate: string;
}

interface ProtocolTridentProps {
  protocols: Protocol[];
}

const PROTOCOL_INFO = {
  nordic: {
    title: "Nordic Hamstring",
    description: "Prévention ischio-jambiers — excentrique",
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    progressColor: "blue" as const,
  },
  copenhagen: {
    title: "Copenhagen Adductor",
    description: "Prévention adducteurs — stabilisation",
    color: "text-purple-500",
    bgColor: "bg-purple-500",
    progressColor: "blue" as const,
  },
  reverse_nordic: {
    title: "Reverse Nordic",
    description: "Prévention quadriceps — excentrique",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
    progressColor: "green" as const,
  },
};

function ProtocolCard({ protocol }: { protocol: Protocol | null; type: keyof typeof PROTOCOL_INFO }) {
  const type = protocol?.type ?? ("nordic" as const);
  const info = PROTOCOL_INFO[type];
  const compliance = protocol?.complianceRate ?? 0;

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white/50 p-4 backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/50">
      <div className="flex items-center gap-2 mb-3">
        <Shield className={`h-5 w-5 ${info.color}`} />
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
          {info.title}
        </h4>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
        {info.description}
      </p>

      {protocol ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Compliance
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {compliance.toFixed(0)}%
            </span>
          </div>
          <Progress value={compliance} color={compliance > 80 ? "green" : compliance > 50 ? "orange" : "red"} />
          <div className="mt-3 flex items-center justify-between">
            <Badge variant={compliance > 80 ? "success" : compliance > 50 ? "warning" : "danger"}>
              {compliance > 80 ? "Excellent" : compliance > 50 ? "Moyen" : "Insuffisant"}
            </Badge>
            <span className="text-xs text-zinc-400">
              {protocol.frequency}x/sem
            </span>
          </div>
          {protocol.exercises.length > 0 && (
            <div className="mt-3 space-y-1">
              {protocol.exercises.slice(0, 3).map((ex, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <ChevronRight className="h-3 w-3" />
                  <span>{ex.name}</span>
                  <span className="ml-auto font-mono">{ex.sets}x{ex.reps}</span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center py-4">
          <p className="text-xs text-zinc-400">Aucun protocole actif</p>
        </div>
      )}
    </div>
  );
}

export function ProtocolTrident({ protocols }: ProtocolTridentProps) {
  const nordic = protocols.find((p) => p.type === "nordic") ?? null;
  const copenhagen = protocols.find((p) => p.type === "copenhagen") ?? null;
  const reverseNordic = protocols.find((p) => p.type === "reverse_nordic") ?? null;

  return (
    <Card glass>
      <CardHeader>
        <CardTitle>Trident de Prévention</CardTitle>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Protocoles actifs et compliance
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ProtocolCard protocol={nordic} type="nordic" />
          <ProtocolCard protocol={copenhagen} type="copenhagen" />
          <ProtocolCard protocol={reverseNordic} type="reverse_nordic" />
        </div>
      </CardContent>
    </Card>
  );
}
