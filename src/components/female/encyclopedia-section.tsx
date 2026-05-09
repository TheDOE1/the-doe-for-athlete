"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NUTRITION_MARKERS, EQUIPMENT_GUIDES } from "@/lib/data/female-physiology";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, BookOpen, Droplets, ShoppingBag, Beaker } from "lucide-react";

// ─── Nutrition Marker Card ────────────────────────────────────────────────────

function NutritionMarkerCard({ marker }: { marker: typeof NUTRITION_MARKERS[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card glass className="overflow-hidden border-zinc-700/50">
      <div className="bg-gradient-to-r from-pink-950/20 to-purple-950/10 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Beaker className="h-4 w-4 text-pink-400 shrink-0" />
            <h3 className="font-semibold text-white text-sm">{marker.name}</h3>
          </div>
          <span className="text-xs text-zinc-500">{marker.unit}</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded bg-zinc-800/60 px-2 py-1.5">
            <p className="text-zinc-500 mb-0.5">Population</p>
            <p className="text-zinc-300 font-medium text-[11px]">{marker.optimalRange}</p>
          </div>
          <div className="rounded bg-emerald-950/30 border border-emerald-800/30 px-2 py-1.5">
            <p className="text-emerald-500 mb-0.5">Athlète</p>
            <p className="text-emerald-300 font-medium text-[11px]">{marker.athleteOptimal}</p>
          </div>
          <div className="rounded bg-red-950/30 border border-red-800/30 px-2 py-1.5">
            <p className="text-red-500 mb-0.5">Alerte</p>
            <p className="text-red-300 font-medium text-[11px]">{marker.deficiencyThreshold}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Symptoms */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-400">Symptômes de carence :</p>
          <div className="flex flex-wrap gap-1">
            {marker.symptoms.map((s, i) => (
              <span key={i} className="rounded-full bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-400">
                {s}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">{marker.specificity}</p>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors"
        >
          <Droplets className="h-3 w-3" />
          {expanded ? "Masquer" : "Voir"} sources & supplémentation
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {expanded && (
          <div className="space-y-3 border-t border-zinc-700/50 pt-3">
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-300">Sources alimentaires :</p>
              <ul className="space-y-0.5">
                {marker.foodSources.map((s, i) => (
                  <li key={i} className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                    <span className="text-pink-500 mt-0.5">·</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-purple-950/20 border border-purple-800/30 p-3">
              <p className="mb-1 text-xs font-medium text-purple-300">Supplémentation :</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{marker.supplementation}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Equipment Guide Card ─────────────────────────────────────────────────────

function EquipmentCard({ guide }: { guide: typeof EQUIPMENT_GUIDES[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card glass className="overflow-hidden border-zinc-700/50">
      <div className="bg-gradient-to-r from-purple-950/20 to-pink-950/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag className="h-4 w-4 text-purple-400" />
          <h3 className="font-semibold text-white text-sm">{guide.category}</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">{guide.problem}</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="rounded-lg bg-emerald-950/10 border border-emerald-800/20 p-3">
          <p className="text-xs font-medium text-emerald-300 mb-1">Solution recommandée :</p>
          <p className="text-xs text-zinc-300">{guide.solution}</p>
        </div>

        <p className="text-xs text-zinc-500 italic leading-relaxed">{guide.scientificBasis}</p>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          {expanded ? "Masquer" : "Voir"} les recommandations pratiques
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {expanded && (
          <div className="space-y-1.5 border-t border-zinc-700/50 pt-3">
            {guide.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                <span className="text-purple-400 font-bold mt-0.5 shrink-0">→</span>
                {rec}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Main Encyclopedia Section ────────────────────────────────────────────────

export function EncyclopediaSection() {
  const [activeTab, setActiveTab] = useState<"nutrition" | "equipment">("nutrition");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-purple-500/10 p-2.5">
          <BookOpen className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Encyclopédie Bio-Mécanique</h2>
          <p className="text-sm text-zinc-400">
            Profil sanguin, nutrition spécifique & guide équipement féminin
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl bg-zinc-800/50 p-1">
        <button
          onClick={() => setActiveTab("nutrition")}
          className={cn(
            "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
            activeTab === "nutrition"
              ? "bg-pink-700 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Nutrition & Sang
        </button>
        <button
          onClick={() => setActiveTab("equipment")}
          className={cn(
            "flex-1 rounded-lg py-2 text-sm font-medium transition-all",
            activeTab === "equipment"
              ? "bg-purple-700 text-white shadow-sm"
              : "text-zinc-400 hover:text-white"
          )}
        >
          Équipement
        </button>
      </div>

      {activeTab === "nutrition" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {NUTRITION_MARKERS.map((marker, i) => (
            <NutritionMarkerCard key={i} marker={marker} />
          ))}
        </div>
      )}

      {activeTab === "equipment" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {EQUIPMENT_GUIDES.map((guide, i) => (
            <EquipmentCard key={i} guide={guide} />
          ))}
        </div>
      )}
    </div>
  );
}
