// ─────────────────────────────────────────────────────────────────────────────
// Female Physiology — Scientific Data for Elite Female Module
// References: Constantini et al. (2005), Sung et al. (2019), Lebrun et al. (1995),
//   De Souza et al. (2014) RED-S, Hewett et al. (2005) ACL biomechanics,
//   Mountjoy et al. (2018) IOC RED-S Consensus
// ─────────────────────────────────────────────────────────────────────────────

export type CyclePhase = "follicular" | "ovulatory" | "luteal" | "menstrual";

// ─── Cycle Phase Definitions ─────────────────────────────────────────────────

export interface CyclePhaseData {
  id: CyclePhase;
  name: string;
  days: string;            // e.g. "J1–J14"
  daysRange: [number, number];
  color: string;           // Tailwind color token
  accent: string;          // Hex for SVG
  icon: string;            // emoji or single char
  alertLevel: "green" | "orange" | "red" | "gray";
  hormones: string[];
  physiologicalEffects: string[];
  trainingRecommendations: TrainingRec;
  nutrition: string[];
  hydration: string;
  scienceNote: string;
}

export interface TrainingRec {
  sessionTypes: string[];
  intensityLabel: string;
  intensityModifier: -1 | 0 | 1;   // -1 = reduce, 0 = normal, 1 = increase
  warnings: string[];
  greenLight: boolean;
  redFlags: string[];
}

export const CYCLE_PHASES: CyclePhaseData[] = [
  {
    id: "follicular",
    name: "Phase Folliculaire",
    days: "J1–J14",
    daysRange: [1, 14],
    color: "emerald",
    accent: "#10b981",
    icon: "↑",
    alertLevel: "green",
    hormones: ["Œstrogènes ↑↑", "FSH ↑", "LH normal"],
    physiologicalEffects: [
      "Meilleure récupération post-effort",
      "Force maximale augmentée (œstrogènes activent les fibres IIx)",
      "Utilisation préférentielle des glucides — énergie explosive disponible",
      "Anabolisme protéique facilité",
      "Seuil douleur plus élevé",
      "Récupération cardiovasculaire optimale",
    ],
    trainingRecommendations: {
      sessionTypes: [
        "Séances lourdes (force max, puissance)",
        "Entraînements haute intensité (HIIT, sprints)",
        "Travail technique intensif",
        "Small-Sided Games compétitifs",
      ],
      intensityLabel: "Intensité MAXIMALE autorisée",
      intensityModifier: 1,
      warnings: [],
      greenLight: true,
      redFlags: [],
    },
    nutrition: [
      "Privilégier les glucides complexes pré-entraînement",
      "Fenêtre anabolique post-entraînement à exploiter (protéines 0.3g/kg)",
      "Antioxydants pour soutenir la récupération cellulaire",
    ],
    hydration: "Besoins hydriques standards",
    scienceNote:
      "Les œstrogènes augmentent l'activation des unités motrices à seuil élevé et améliorent la récupération musculaire (Enns & Tiidus, 2010). C'est la fenêtre optimale pour les adaptations neuromusculaires.",
  },
  {
    id: "ovulatory",
    name: "Phase Ovulatoire",
    days: "J14–J16",
    daysRange: [14, 16],
    color: "red",
    accent: "#ef4444",
    icon: "⚠",
    alertLevel: "red",
    hormones: ["Pic Œstrogènes +++", "Pic LH", "Relaxine ↑↑"],
    physiologicalEffects: [
      "Hyperlaxité ligamentaire due à la RELAXINE — ligaments ACL plus souples",
      "Risque de rupture du LCA multiplié par 3 (Wojtys et al., 2002)",
      "Valgus dynamique du genou augmenté lors des atterrissages",
      "Proprioception légèrement altérée",
      "Pic de performance physique (court terme)",
      "Temps de réaction neuromusculaire légèrement allongé",
    ],
    trainingRecommendations: {
      sessionTypes: [
        "Travail technique sans changements de direction explosifs",
        "Proprioception et équilibre unilatéral",
        "Natation / vélo (pas d'impact)",
        "Éviter les sauts et réceptions non contrôlés",
      ],
      intensityLabel: "REMPLACER les COD par proprioception",
      intensityModifier: -1,
      warnings: [
        "Remplacer TOUT exercice avec changement de direction explosif",
        "Interdire les réceptions asymétriques (1 jambe)",
        "Supervision biomécanique renforcée si entraînement maintenu",
      ],
      greenLight: false,
      redFlags: [
        "Douleur ligamentaire genou/cheville → arrêt immédiat",
        "Instabilité ressentie → arrêt et consultation",
      ],
    },
    nutrition: [
      "Anti-inflammatoires naturels : oméga-3, curcuma, cerise acidulée",
      "Hydratation accrue (+15%)",
      "Magnésium pour la qualité musculaire",
    ],
    hydration: "+15% volume habituel",
    scienceNote:
      "La relaxine, pic pendant l'ovulation, diminue la raideur ligamentaire jusqu'à 30%. L'ACL féminin est déjà anatomiquement plus à risque (angle Q, échancrure intercondylienne). La combinaison multiplie le risque ×2.4 à ×3.1 (Hewett et al., 2005 ; ACL Research Retreat).",
  },
  {
    id: "luteal",
    name: "Phase Lutéale",
    days: "J17–J28",
    daysRange: [17, 28],
    color: "amber",
    accent: "#f59e0b",
    icon: "~",
    alertLevel: "orange",
    hormones: ["Progestérone ↑↑", "Œstrogènes modérés", "Température +0.3–0.5°C"],
    physiologicalEffects: [
      "Température corporelle basale augmentée de 0.3 à 0.5°C → stress thermique accru",
      "Fréquence cardiaque sous-maximale augmentée (~5–7 bpm)",
      "Utilisation préférentielle des lipides comme substrat",
      "Légère rétention d'eau (sodium et eau)",
      "Seuil de lactate légèrement diminué",
      "Humeur et sommeil potentiellement altérés (SPM)",
    ],
    trainingRecommendations: {
      sessionTypes: [
        "Endurance basse intensité (Z1–Z2)",
        "Travail aérobie long",
        "Renforcement musculaire modéré",
        "Yoga / mobilité / récupération active",
      ],
      intensityLabel: "Privilégier l'endurance, éviter les séances cardio HIIT intenses",
      intensityModifier: 0,
      warnings: [
        "Surveiller la fréquence cardiaque — les FC cibles peuvent être atteintes plus tôt",
        "Ventilation accrue peut mimer un état de fatigue",
        "Adapter si symptômes SPM importants",
      ],
      greenLight: true,
      redFlags: ["SPM sévère (notation 8–10/10) → réduire intensité de 30%"],
    },
    nutrition: [
      "Augmenter les lipides de qualité (avocats, noix, huile d'olive)",
      "Réduire légèrement les glucides simples (sensibilité à l'insuline moindre)",
      "Calcium + Magnésium pour réduire les crampes",
      "Vitamine B6 pour la régulation de l'humeur",
    ],
    hydration: "+20% volume habituel (thermorégulation augmentée)",
    scienceNote:
      "La progestérone élève la ventilation par stimulation des centres respiratoires, augmentant la perception d'effort. La thermorégulation est compromise (+0.3–0.5°C), imposant une charge cardiovasculaire supplémentaire estimée à 5–8% en conditions chaudes (Kolka & Stephenson, 1997).",
  },
  {
    id: "menstrual",
    name: "Phase Menstruelle",
    days: "J1–J5",
    daysRange: [1, 5],
    color: "zinc",
    accent: "#71717a",
    icon: "●",
    alertLevel: "gray",
    hormones: ["Prostaglandines ↑↑", "Œstrogènes ↓", "Progestérone ↓"],
    physiologicalEffects: [
      "Prostaglandines pro-inflammatoires → douleurs pelviennes et musculaires",
      "Fatigue générale due à la perte de sang (↓ hémoglobine transitoire)",
      "Inflammation systémique légère",
      "Qualité du sommeil souvent perturbée (J1–J2)",
      "Tolérance à la douleur diminuée",
    ],
    trainingRecommendations: {
      sessionTypes: [
        "Adapter l'intensité selon la tolérance individuelle",
        "Travail technique léger ou récupération active",
        "Étirements doux, yoga, mobilité",
        "Maintenir si asymptomatique — certaines joueuses performent très bien",
      ],
      intensityLabel: "Adapter selon symptômes individuels",
      intensityModifier: -1,
      warnings: [
        "Ne jamais forcer si douleurs pelviennes > 6/10",
        "Surveiller la fatigue liée à l'anémie légère",
      ],
      greenLight: true,
      redFlags: [
        "Douleurs invalidantes > 7/10 → arrêt + consultation médicale",
        "Saignements abondants → bilan hématologique",
      ],
    },
    nutrition: [
      "Fer héminique prioritaire (viande rouge, boudin) — pertes ferriques accrues",
      "Vitamine C pour faciliter l'absorption du fer",
      "Anti-inflammatoires naturels : oméga-3, gingembre",
      "Hydratation : compenser les pertes",
    ],
    hydration: "Compenser les pertes — eau + électrolytes",
    scienceNote:
      "Les prostaglandines provoquent des contractions utérines et une inflammation systémique. L'activité physique modérée RÉDUIT les douleurs menstruelles (Daley, 2008, Cochrane Review) via la libération d'endorphines et la vasodilatation. L'arrêt systématique n'est pas recommandé.",
  },
];

// ─── Biomechanics & ACL Prevention ───────────────────────────────────────────

export interface BiomechanicsFactor {
  id: string;
  name: string;
  shortName: string;
  description: string;
  normalValue: string;
  riskValue: string;
  riskRatio: string;
  explanation: string;
  exercises: BiomechanicsExercise[];
}

export interface BiomechanicsExercise {
  name: string;
  sets: number;
  reps: string;
  cues: string[];
  phase: string;
}

export const BIOMECHANICS_FACTORS: BiomechanicsFactor[] = [
  {
    id: "q_angle",
    name: "Angle Q (Quadriceps)",
    shortName: "Angle Q",
    description:
      "Angle formé entre l'axe épine iliaque antéro-supérieure→rotule et l'axe rotule→tubérosité tibiale. Plus grand chez la femme en raison du bassin plus large.",
    normalValue: "Homme : 10–15°",
    riskValue: "Femme > 18° : risque accru",
    riskRatio: "Femme moyenne : 17–22° vs Homme : 12–16°",
    explanation:
      "Un angle Q élevé augmente le valgus de genou lors des activités fonctionnelles, créant une force de cisaillement latérale sur le LCA. Le bassin féminin plus large est la cause anatomique principale.",
    exercises: [
      {
        name: "Squat unilatéral avec contrôle valgus (miroir)",
        sets: 3,
        reps: "8 × jambe",
        cues: ["Genou dans l'axe du 2e orteil", "Hanche rétractée", "Poids sur toute la plante du pied"],
        phase: "Proprioception",
      },
      {
        name: "Step-down excentrique",
        sets: 3,
        reps: "10 × jambe",
        cues: ["Contrôle lent (3 sec)", "Surveiller le valgus au miroir"],
        phase: "Force excentrique",
      },
    ],
  },
  {
    id: "dynamic_valgus",
    name: "Valgus Dynamique du Genou",
    shortName: "Valgus Dyn.",
    description:
      "Effondrement médial du genou lors des atterrissages, réceptions de saut, et décélérations. Principal mécanisme de lésion du LCA sans contact.",
    normalValue: "Genou aligné sur l'axe du pied",
    riskValue: "Genou en dedans de la cheville à l'atterrissage",
    riskRatio: "×2.5 risque LCA si valgus > 10° à l'atterrissage",
    explanation:
      "Causé par la faiblesse du moyen fessier (abducteur principal), la rotation interne tibiale excessive, et les ischio-jambiers insuffisamment forts pour contrer l'activation quadricipitale dominante (ratio H:Q).",
    exercises: [
      {
        name: "Pont fessier unilatéral avec bande élastique",
        sets: 3,
        reps: "15 × jambe",
        cues: ["Bande au-dessus des genoux", "Pousser contre la bande", "Talon appuyé"],
        phase: "Activation moyen fessier",
      },
      {
        name: "Clamshell avec bande (hip abduction)",
        sets: 3,
        reps: "20",
        cues: ["Rotation externe pure", "Ne pas compenser avec le tronc"],
        phase: "Moyen fessier",
      },
      {
        name: "Nordic Curl (excentrique ischio-jambiers)",
        sets: 3,
        reps: "6–8",
        cues: ["Descente très contrôlée 4 sec", "Partner holds ankles"],
        phase: "Renforcement IJ excentrique",
      },
      {
        name: "Réception à 1 jambe (drop landing)",
        sets: 3,
        reps: "8 × jambe",
        cues: ["Atterrissage silencieux", "Genou fléchi >30°", "Tronc droit"],
        phase: "Biomécanique atterrissage",
      },
    ],
  },
  {
    id: "intercondylar_notch",
    name: "Échancrure Intercondylienne",
    shortName: "Échancrure",
    description:
      "Espace osseux entre les condyles fémoraux par lequel passe le LCA. Plus étroite chez la femme (env. 18 mm vs 21 mm chez l'homme), augmentant les contraintes mécaniques sur le ligament.",
    normalValue: "Largeur ≥ 20 mm",
    riskValue: "Largeur < 16 mm → risque très élevé",
    riskRatio: "Femmes : 18–19 mm en moyenne (30% plus étroit)",
    explanation:
      "Une échancrure étroite comprime le LCA lors des mouvements extrêmes (valgus + rotation interne + extension). Facteur anatomique non modifiable, mais la prévention musculaire peut compenser partiellement.",
    exercises: [
      {
        name: "Proprioception plateau instable unilatéral",
        sets: 3,
        reps: "30 sec × jambe",
        cues: ["Yeux fermés progression", "Variantes : ballon lancé pendant l'exercice"],
        phase: "Proprioception avancée",
      },
      {
        name: "Saut avec contrôle d'atterrissage (jump-landing)",
        sets: 4,
        reps: "6",
        cues: ["Genoux > 60° à l'atterrissage", "Fléchisseurs de hanche actifs", "Pas de valgus"],
        phase: "Biomécanique saut",
      },
    ],
  },
  {
    id: "quad_dominant",
    name: "Profil Quad-Dominant",
    shortName: "Quad-Dom.",
    description:
      "Pattern de recrutement musculaire où les quadriceps activent massivement avant les ischio-jambiers, créant une translation tibiale antérieure non contrôlée — tension directe sur le LCA.",
    normalValue: "Ratio H:Q ≥ 0.60 (force IJ ≥ 60% de la force quad)",
    riskValue: "H:Q < 0.55 → risque élevé",
    riskRatio: "Les femmes présentent H:Q moyen 0.52 vs 0.60 chez l'homme",
    explanation:
      "La dominance quadricipitale produit une force de cisaillement antérieur sur le tibia lors des freinages et réceptions. C'est le principal facteur neuromusculaire modifiable par l'entraînement.",
    exercises: [
      {
        name: "Nordic Curl excentrique progressif",
        sets: 3,
        reps: "6–10",
        cues: ["Phase excentrique 4–6 secondes", "Réduction du risque IJ de 51% (Van der Horst, 2015)"],
        phase: "Renforcement IJ",
      },
      {
        name: "Romanian Deadlift unilatéral",
        sets: 3,
        reps: "8 × jambe",
        cues: ["Chargement avec haltère controlatéral", "Dos neutre", "Genou semi-fléchi"],
        phase: "Chaîne postérieure",
      },
      {
        name: "Good Morning avec bande élastique",
        sets: 3,
        reps: "15",
        cues: ["Activation fessiers et IJ simultanée", "Colonne neutre"],
        phase: "Activation chaîne post.",
      },
    ],
  },
];

// Anti-Valgus Program
export interface AntiValgusProgram {
  name: string;
  frequency: string;
  duration: string;
  phases: { name: string; exercises: { name: string; protocol: string; focus: string }[] }[];
  evidence: string;
}

export const ANTI_VALGUS_PROGRAM: AntiValgusProgram = {
  name: "Programme Anti-Valgus FIFA 11+ Féminin Adapté",
  frequency: "3× / semaine (préférable jours non consécutifs)",
  duration: "20–25 minutes",
  phases: [
    {
      name: "Activation Fessière (5 min)",
      exercises: [
        { name: "Clamshell bande élastique", protocol: "3 × 20", focus: "Moyen fessier" },
        { name: "Monster Walk bande", protocol: "3 × 15m", focus: "Abducteurs hanche" },
        { name: "Pont fessier unilatéral", protocol: "3 × 12 × jambe", focus: "Grand + moyen fessier" },
      ],
    },
    {
      name: "Renforcement IJ Excentrique (8 min)",
      exercises: [
        { name: "Nordic Curl", protocol: "3 × 6–8 (progression 2 semaines)", focus: "IJ excentrique — réduction LCA 51%" },
        { name: "Romanian DL unilatéral", protocol: "3 × 8 × côté", focus: "Chaîne postérieure" },
        { name: "Good Morning bande", protocol: "3 × 15", focus: "IJ + érecteurs lombaires" },
      ],
    },
    {
      name: "Biomécanique Atterrissage (7 min)",
      exercises: [
        { name: "Drop Landing contrôlé", protocol: "4 × 8 × jambe", focus: "Atterrissage silencieux — contrôle valgus" },
        { name: "Proprioception plateau instable", protocol: "3 × 30 sec × jambe", focus: "Stabilité ligamentaire" },
        { name: "Saut continu avec contrôle", protocol: "4 × 10", focus: "Pattern neuromusculaire sûr" },
      ],
    },
    {
      name: "Renforcement Core Anti-Rotation (5 min)",
      exercises: [
        { name: "Pallof Press", protocol: "3 × 12 × côté", focus: "Anti-rotation — stabilité pelvi-lombaire" },
        { name: "Planche dynamique alternée", protocol: "3 × 20 sec", focus: "Gainage fonctionnel" },
        { name: "Bird-Dog lent", protocol: "3 × 10 × côté", focus: "Stabilisation lombaire" },
      ],
    },
  ],
  evidence:
    "Programme basé sur FIFA 11+ (Soligard et al., 2008) et l'ACL Injury Prevention Program (Myklebust & Bahr, 2005). Réduction LCA documentée : 50–64% en équipes féminines (Sugimoto et al., 2015, meta-analyse).",
};

// ─── RED-S (Relative Energy Deficiency in Sport) ──────────────────────────────

export interface REDSSignal {
  category: string;
  signals: { label: string; severity: "warning" | "critical" }[];
}

export const REDS_SIGNALS: REDSSignal[] = [
  {
    category: "Cycle Menstruel",
    signals: [
      { label: "Cycles irréguliers (>35 j ou <21 j)", severity: "warning" },
      { label: "Aménorrhée 1–2 mois", severity: "warning" },
      { label: "Aménorrhée ≥ 3 mois", severity: "critical" },
    ],
  },
  {
    category: "Osseux & Douleurs",
    signals: [
      { label: "Fractures de stress répétées", severity: "critical" },
      { label: "Douleurs osseuses inexpliquées", severity: "warning" },
      { label: "T-score densité osseuse < -1.0", severity: "critical" },
    ],
  },
  {
    category: "Energie & Nutrition",
    signals: [
      { label: "Disponibilité énergétique < 30 kcal/kg MLG/j", severity: "critical" },
      { label: "Ferritine < 20 µg/L", severity: "warning" },
      { label: "Ferritine < 12 µg/L", severity: "critical" },
      { label: "Perte de poids involontaire > 5%", severity: "warning" },
    ],
  },
  {
    category: "Performance & Récupération",
    signals: [
      { label: "Fatigue chronique inexpliquée", severity: "warning" },
      { label: "Baisse de performance persistante (> 3 semaines)", severity: "warning" },
      { label: "Fréquence blessures musculaires augmentée", severity: "warning" },
      { label: "Temps de récupération allongé", severity: "warning" },
    ],
  },
  {
    category: "Psychologique",
    signals: [
      { label: "Restriction alimentaire contrôlante", severity: "warning" },
      { label: "Anxiété autour de la nourriture", severity: "warning" },
      { label: "Image corporelle négative persistante", severity: "critical" },
    ],
  },
];

export interface REDSProtocol {
  riskLevel: "low" | "moderate" | "high";
  label: string;
  color: string;
  actions: string[];
  trainingRestrictions: string[];
}

export const REDS_PROTOCOLS: REDSProtocol[] = [
  {
    riskLevel: "low",
    label: "Risque Faible",
    color: "emerald",
    actions: [
      "Surveillance mensuelle des indicateurs",
      "Éducation nutritionnelle préventive",
      "Suivi bilan sanguin annuel (fer, ferritine)",
    ],
    trainingRestrictions: [],
  },
  {
    riskLevel: "moderate",
    label: "Risque Modéré",
    color: "amber",
    actions: [
      "Consultation nutritionniste sous 2 semaines",
      "Bilan sanguin complet (ferritine, fer, hémoglobine, vitamine D)",
      "Augmenter la disponibilité énergétique (+300–500 kcal/j)",
      "Surveillance du cycle menstruel mensuelle",
      "Réduction des séances haute intensité de 20%",
    ],
    trainingRestrictions: [
      "Réduire volume total de 20–30%",
      "Supprimer séances double-jour",
    ],
  },
  {
    riskLevel: "high",
    label: "Risque Élevé — ACTION IMMÉDIATE",
    color: "red",
    actions: [
      "ALERTE STAFF MÉDICAL IMMÉDIATE",
      "Consultation médecin du sport sous 48h",
      "Consultation psychologue / psychiatre si TCA suspecté",
      "Bilan complet densité osseuse (ostéodensitométrie)",
      "Plan de réalimentation supervisé",
      "Suivi journalier par le staff",
    ],
    trainingRestrictions: [
      "BLOQUER tous les impacts lourds (sauts, sprints, courses longues)",
      "INTERDIRE les séances haute intensité",
      "Autoriser uniquement : natation, vélo, renforcement léger",
      "Notification obligatoire coach principal",
    ],
  },
];

// ─── Nutrition & Blood Profile ────────────────────────────────────────────────

export interface NutritionMarker {
  name: string;
  unit: string;
  optimalRange: string;
  athleteOptimal: string;
  deficiencyThreshold: string;
  symptoms: string[];
  foodSources: string[];
  supplementation: string;
  specificity: string;
}

export const NUTRITION_MARKERS: NutritionMarker[] = [
  {
    name: "Ferritine (réserves fer)",
    unit: "µg/L",
    optimalRange: "20–200 µg/L (population)",
    athleteOptimal: "> 40 µg/L pour performance optimale",
    deficiencyThreshold: "< 12 µg/L = anémie ferriprive",
    symptoms: [
      "Fatigue inexpliquée",
      "Baisse VO2max",
      "Récupération allongée",
      "Pâleur, essoufflement à l'effort",
      "Troubles de la concentration",
    ],
    foodSources: [
      "Viande rouge (fer héminique — absorption 15–35%)",
      "Boudin noir (source concentrée)",
      "Légumineuses + vitamine C (absorption ×3)",
      "Graines de courge, sésame",
      "Tofu ferme",
    ],
    supplementation:
      "Supplémentation 60–200 mg fer élémentaire/jour sur prescription médicale. Éviter avec thé, café (polyphénols réduisent l'absorption). Préférer le matin à jeun.",
    specificity:
      "Les footballeuses perdent 1–2 mg de fer supplémentaires par jour via l'hémolyse plantaire (impact répété) et les pertes menstruelles. Surveillance indispensable en début de saison.",
  },
  {
    name: "Fer sérique",
    unit: "µmol/L",
    optimalRange: "10–30 µmol/L",
    athleteOptimal: "15–25 µmol/L",
    deficiencyThreshold: "< 7 µmol/L",
    symptoms: ["Faiblesse musculaire", "Essoufflement à l'effort"],
    foodSources: ["Voir ferritine"],
    supplementation: "Sur prescription uniquement, jamais en automédication.",
    specificity:
      "Le fer sérique fluctue selon les repas ; la ferritine est le marqueur de référence pour les athlètes.",
  },
  {
    name: "Densité Osseuse (T-score)",
    unit: "T-score (écart-types)",
    optimalRange: "> -1.0 (normal)",
    athleteOptimal: "> 0.5 (os denses — effet mécanique sport)",
    deficiencyThreshold: "< -2.5 = ostéoporose",
    symptoms: [
      "Fractures de stress répétées",
      "Douleurs osseuses inexpliquées",
      "Fractures pour traumatisme mineur",
    ],
    foodSources: [
      "Produits laitiers (calcium)",
      "Sardines avec arêtes",
      "Légumes à feuilles vertes",
      "Amandes",
      "Exposition solaire (vitamine D)",
    ],
    supplementation:
      "Vitamine D3 1000–2000 UI/jour en hiver. Calcium 1000–1200 mg/jour (alimentaire prioritaire). Consultation ostéodensitométrie si RED-S suspecté.",
    specificity:
      "L'aménorrhée de 6+ mois réduit la densité osseuse de 2–6% par an, non entièrement récupérable. La prévention est prioritaire.",
  },
  {
    name: "Disponibilité Énergétique (DE)",
    unit: "kcal/kg MLG/jour",
    optimalRange: "≥ 45 kcal/kg MLG/j",
    athleteOptimal: "45–50 kcal/kg MLG/j",
    deficiencyThreshold: "< 30 kcal/kg MLG/j = RED-S déclenché",
    symptoms: [
      "Fatigue chronique",
      "Aménorrhée fonctionnelle",
      "Réponse immune diminuée",
      "Perte de masse maigre",
    ],
    foodSources: ["Glucides complexes", "Lipides qualité", "Protéines complètes"],
    supplementation: "Augmentation calories totales en priorisant glucides et lipides essentiels.",
    specificity:
      "La DE = (Apport énergétique total - Dépense entraînement) / Masse maigre (kg). C'est l'indicateur central du RED-S. Mesure difficile en pratique — utiliser les symptômes comme proxy.",
  },
];

// ─── Equipment Guide ──────────────────────────────────────────────────────────

export interface EquipmentGuide {
  category: string;
  problem: string;
  solution: string;
  scientificBasis: string;
  recommendations: string[];
}

export const EQUIPMENT_GUIDES: EquipmentGuide[] = [
  {
    category: "Crampons",
    problem:
      "Les crampons traditionnels sont conçus pour la morphologie masculine. Le pied féminin est proportionnellement plus étroit au talon et plus large au niveau de l'avant-pied, avec un angle différent au niveau de l'hallux.",
    solution: "Crampons féminins spécifiques ou crampons avec \"women's fit\"",
    scientificBasis:
      "Un mauvais appui podal modifie toute la chaîne biomécanique : angle Q, valgus genou, et stabilité à l'atterrissage. L'hémolyse plantaire liée aux chocs inadaptés aggrave les carences en fer.",
    recommendations: [
      "Mesurer la largeur de l'avant-pied, pas seulement la longueur",
      "Semelle intérieure correctrice si pronation excessive",
      "Crampons Firm Ground pour contrôle proprioceptif optimum",
      "Renouveler les crampons tous les 6–8 mois (amortissement dégradé)",
    ],
  },
  {
    category: "Brassière Sport",
    problem:
      "Une brassière inadaptée crée des mouvements mammaires excessifs (jusqu'à 21 cm selon la taille). Cela altère la biomécanique respiratoire, la posture, et peut provoquer des douleurs lombaires et cervicales chroniques.",
    solution: "Brassière encapsulante haute intensité avec maintien ≥ 8/10",
    scientificBasis:
      "Mason et al. (2021) : une brassière inadaptée réduit la capacité respiratoire de 8–12% et augmente la consommation d'O2 à intensité donnée. Le maintien mammaire réduit également la flexion de tronc inconsciente des joueuses.",
    recommendations: [
      "Choisir brassière encapsulante (pas compression seule) pour sport haute intensité",
      "Essayer à l'entraînement avant la compétition",
      "Vérifier la bande thoracique (2 doigts passent = trop lâche)",
      "Bretelles larges pour répartir les contraintes sur l'épaule",
      "Matière respirante (polyester/nylon — pas coton)",
    ],
  },
];

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getCyclePhase(dayOfCycle: number): CyclePhase {
  if (dayOfCycle <= 5) return "menstrual";
  if (dayOfCycle <= 14) return "follicular";
  if (dayOfCycle <= 16) return "ovulatory";
  return "luteal";
}

export function getPhaseData(phase: CyclePhase): CyclePhaseData {
  return CYCLE_PHASES.find((p) => p.id === phase)!;
}

export function calculateREDSRisk(params: {
  amenorrheaMonths: number;
  ferritin?: number | null;
  boneDensityScore?: number | null;
  energyAvailability?: number | null;
}): "low" | "moderate" | "high" {
  let score = 0;

  if (params.amenorrheaMonths >= 3) score += 3;
  else if (params.amenorrheaMonths >= 1) score += 1;

  if (params.ferritin !== null && params.ferritin !== undefined) {
    if (params.ferritin < 12) score += 3;
    else if (params.ferritin < 20) score += 2;
    else if (params.ferritin < 40) score += 1;
  }

  if (params.boneDensityScore !== null && params.boneDensityScore !== undefined) {
    if (params.boneDensityScore < -2.5) score += 3;
    else if (params.boneDensityScore < -1.0) score += 2;
  }

  if (params.energyAvailability !== null && params.energyAvailability !== undefined) {
    if (params.energyAvailability < 30) score += 3;
    else if (params.energyAvailability < 40) score += 1;
  }

  if (score >= 5) return "high";
  if (score >= 2) return "moderate";
  return "low";
}
