// ─── Muscle Database — The Doe For Athlete ───────────────────────────────────
// 22 muscle groups with full anatomical, physiological & football data

export interface CommonInjury {
  name: string;
  mechanism: string;
}

export interface Exercise {
  name: string;
  sets: string;
}

export interface MuscleData {
  id: string;
  name: string;
  nameEn: string;
  group: string;
  subMuscles: string[];
  // Anatomy
  origin: string;
  insertion: string;
  pennationAngle: string;
  innervation: string;
  // Physiology
  fiberTypeI: number; // % Type I (slow-twitch, endurance)
  fiberTypeII: number; // % Type II (fast-twitch, power)
  // Football
  footballRole: string;
  footballActions: string[];
  // Myers Anatomy Trains
  myofascialLine: string;
  myofascialLineId: "SBL" | "SFL" | "LL" | "SPL" | "DFL" | "AL";
  connectedMuscles: string[];
  // Injuries
  commonInjuries: CommonInjury[];
  // Prevention
  preventionExercises: Exercise[];
  // Color for 3D model
  groupColor: string;
}

export const MUSCLES: MuscleData[] = [
  // ─── QUADRICEPS ───────────────────────────────────────────────────────────
  {
    id: "quadriceps",
    name: "Quadriceps",
    nameEn: "Quadriceps Femoris",
    group: "Cuisse Antérieure",
    subMuscles: [
      "Droit fémoral (Rectus femoris)",
      "Vaste latéral (Vastus lateralis)",
      "Vaste médial (Vastus medialis)",
      "Vaste intermédiaire (Vastus intermedius)",
    ],
    origin:
      "Épine iliaque antéro-inférieure (droit fémoral) ; face antérieure du fémur (vastes)",
    insertion: "Tubérosité tibiale via le ligament patellaire",
    pennationAngle: "0–15° (unipenné à bipenné selon les chefs)",
    innervation: "Nerf fémoral (L2-L4)",
    fiberTypeI: 48,
    fiberTypeII: 52,
    footballRole:
      "Moteur principal de l'extension de genou — frappe, sprint, décélération",
    footballActions: [
      "Frappe de balle : extension explosive du genou (phase concentrique)",
      "Phase propulsive du sprint : force de propulsion au sol",
      "Freinage lors des décélérations et réceptions de saut",
      "Stabilisation du genou lors des pivots et changements de direction",
    ],
    myofascialLine: "Ligne Frontale Superficielle (SFL)",
    myofascialLineId: "SFL",
    connectedMuscles: [
      "Tibialis anterior",
      "Rectus abdominis",
      "Sternomastoïdien",
    ],
    commonInjuries: [
      {
        name: "Déchirure du droit fémoral",
        mechanism:
          "Extension explosive avec hanche fléchie (frappe à pleine vitesse)",
      },
      {
        name: "Tendinopathie patellaire",
        mechanism: "Surcharge en volume/intensité (sauts répétés, sprints)",
      },
      {
        name: "Contusion quadricipitale (charley horse)",
        mechanism: "Traumatisme direct sur la cuisse (contact)",
      },
    ],
    preventionExercises: [
      { name: "Reverse Nordic Curl", sets: "3×8-10 reps" },
      { name: "Spanish Squat isométrique", sets: "3×45 s" },
      { name: "Bulgarian Split Squat", sets: "3×10 (chaque jambe)" },
      { name: "Leg Extension excentrique", sets: "3×8 reps lentes (4-0-1)" },
    ],
    groupColor: "#3b82f6",
  },

  // ─── ISCHIO-JAMBIERS ──────────────────────────────────────────────────────
  {
    id: "hamstrings",
    name: "Ischio-jambiers",
    nameEn: "Hamstrings",
    group: "Cuisse Postérieure",
    subMuscles: [
      "Biceps fémoral — chef long",
      "Biceps fémoral — chef court",
      "Semi-tendineux",
      "Semi-membraneux",
    ],
    origin:
      "Tubérosité ischiatique (chef long, ST, SM) ; ligne âpre du fémur (chef court)",
    insertion:
      "Tête du péroné (biceps fémoral) ; tibia médial (semi-tendineux, semi-membraneux)",
    pennationAngle: "8–25° (bipenné pour le biceps fémoral)",
    innervation: "Nerf sciatique — division tibiale (L5-S2)",
    fiberTypeI: 48,
    fiberTypeII: 52,
    footballRole:
      "Freinateur principal du sprint — contrôle excentrique lors de la phase terminale de balancement",
    footballActions: [
      "Contrôle excentrique en fin de phase de balancement du sprint",
      "Extension de hanche en phase propulsive",
      "Décélération active lors des arrêts à grande vitesse",
      "Stabilisation dynamique du genou lors des réceptions",
    ],
    myofascialLine: "Ligne Dorsale Superficielle (SBL)",
    myofascialLineId: "SBL",
    connectedMuscles: [
      "Grand fessier",
      "Érecteurs du rachis",
      "Fascia plantaire",
    ],
    commonInjuries: [
      {
        name: "Claquage ischio-jambier (Grade I-III)",
        mechanism:
          "Charge excentrique dépassant la capacité — sprint à haute vitesse (>90% Vmax)",
      },
      {
        name: "Tendinopathie proximale (ischiatique)",
        mechanism:
          "Traction répétée à l'origine ischiatique (accélérations, hurdling)",
      },
      {
        name: "Avulsion de la tubérosité ischiatique",
        mechanism:
          "Arrachement osseux chez les jeunes lors d'un effort maximal",
      },
    ],
    preventionExercises: [
      { name: "Nordic Hamstring Curl", sets: "3×6-10 reps (excentrique)" },
      {
        name: "Razor Curl (version allégée)",
        sets: "3×8 reps avec partenaire",
      },
      {
        name: "Deadlift roumain unilatéral",
        sets: "3×10 (chaque jambe, charge progressive)",
      },
      { name: "Sprints avec résistance élastique", sets: "5×30 m" },
    ],
    groupColor: "#f97316",
  },

  // ─── ADDUCTEURS ──────────────────────────────────────────────────────────
  {
    id: "adductors",
    name: "Adducteurs",
    nameEn: "Hip Adductors",
    group: "Cuisse Interne",
    subMuscles: [
      "Grand adducteur",
      "Long adducteur",
      "Court adducteur",
      "Gracile (droit interne)",
      "Pectiné",
    ],
    origin:
      "Pubis, branche ilio-pubienne, branche ischio-pubienne (selon le chef)",
    insertion:
      "Ligne âpre et condyle médial du fémur (grand adducteur) ; tibia médial (gracile)",
    pennationAngle: "0–15°",
    innervation:
      "Nerf obturateur (L2-L4) ; nerf tibial pour le grand adducteur (partie postérieure)",
    fiberTypeI: 54,
    fiberTypeII: 46,
    footballRole:
      "Stabilisateurs du bassin lors des frappes et des changements de direction — zone de lésion #1 en football",
    footballActions: [
      "Fermeture de hanche lors des frappes croisées intérieur du pied",
      "Stabilisation du bassin lors de la phase d'appui unipodale",
      "Accélération latérale et changements de direction",
      "Freinage lors des pas chassés défensifs",
    ],
    myofascialLine: "Ligne Frontale Profonde (DFL)",
    myofascialLineId: "DFL",
    connectedMuscles: ["Psoas-iliaque", "Transverse de l'abdomen", "Pectiné"],
    commonInjuries: [
      {
        name: "Élongation/déchirure des adducteurs",
        mechanism: "Écart forcé ou frappe en extension avec contraction",
      },
      {
        name: "Pubalgie (ostéite pubienne)",
        mechanism:
          "Déséquilibre chronique adducteurs/abdominaux — surcharge en compétition",
      },
      {
        name: "Tendinopathie adducteur long",
        mechanism:
          "Traction répétée au pubis (accélérations, changements de direction)",
      },
    ],
    preventionExercises: [
      { name: "Copenhagen Adductor Exercise", sets: "3×8-12 reps" },
      {
        name: "Side-Lying Adduction excentrique",
        sets: "3×12 reps avec charge",
      },
      { name: "Sumo Deadlift", sets: "3×8 reps" },
      { name: "Élastique adduction debout", sets: "3×15 reps chaque côté" },
    ],
    groupColor: "#a855f7",
  },

  // ─── GRAND FESSIER ────────────────────────────────────────────────────────
  {
    id: "glute_max",
    name: "Grand Fessier",
    nameEn: "Gluteus Maximus",
    group: "Fessiers",
    subMuscles: [
      "Chef supérieur (extension + abduction)",
      "Chef inférieur (extension + adduction)",
    ],
    origin: "Face postérieure de l'ilion, sacrum, coccyx, ligament sacro-tubéral",
    insertion:
      "Tractus ilio-tibial (chef superficiel) ; tubérosité glutéale du fémur",
    pennationAngle: "5–10°",
    innervation: "Nerf glutéal inférieur (L5-S2)",
    fiberTypeI: 52,
    fiberTypeII: 48,
    footballRole:
      "Moteur de l'extension de hanche — source principale de puissance en sprint et en frappe",
    footballActions: [
      "Extension explosive de hanche lors du sprint (phase propulsive)",
      "Armé de la jambe lors des tirs",
      "Réception d'impulsion lors des sauts et des atterrissages",
      "Stabilisation lombo-pelvienne lors de la course",
    ],
    myofascialLine: "Ligne Dorsale Superficielle (SBL)",
    myofascialLineId: "SBL",
    connectedMuscles: [
      "Ischio-jambiers",
      "Tractus ilio-tibial",
      "Érecteurs du rachis",
    ],
    commonInjuries: [
      {
        name: "Tendinopathie glutéale",
        mechanism:
          "Compression du tendon lors des positions en adduction croisée (assis jambes croisées)",
      },
      {
        name: "Syndrome du piriforme",
        mechanism: "Compression du nerf sciatique par le piriforme adjacent",
      },
    ],
    preventionExercises: [
      { name: "Hip Thrust barbell", sets: "4×8-12 reps" },
      { name: "Single-Leg Romanian Deadlift", sets: "3×10 reps" },
      { name: "Clamshell avec élastique", sets: "3×15 reps" },
      { name: "Squat profond", sets: "4×8-10 reps" },
    ],
    groupColor: "#ef4444",
  },

  // ─── MOYEN FESSIER ────────────────────────────────────────────────────────
  {
    id: "glute_med",
    name: "Moyen Fessier",
    nameEn: "Gluteus Medius",
    group: "Fessiers",
    subMuscles: ["Portion antérieure (fléchisseur/RI)", "Portion postérieure (extenseur/RE)"],
    origin: "Face externe de l'ilion (entre les lignes glutéales antérieure et postérieure)",
    insertion: "Face latérale du grand trochanter",
    pennationAngle: "0–8°",
    innervation: "Nerf glutéal supérieur (L4-S1)",
    fiberTypeI: 55,
    fiberTypeII: 45,
    footballRole:
      "Stabilisateur frontal du bassin lors de la phase unipodal du sprint — déficit = cause principale des blessures en chaîne",
    footballActions: [
      "Stabilisation du bassin lors de chaque foulée (évite le Trendelenburg)",
      "Contrôle du genou en valgus lors des réceptions",
      "Abduction active lors des pas chassés latéraux",
      "Rotation interne/externe de hanche lors des pivots",
    ],
    myofascialLine: "Ligne Latérale (LL)",
    myofascialLineId: "LL",
    connectedMuscles: ["TFL", "Tractus ilio-tibial", "Péronier latéral"],
    commonInjuries: [
      {
        name: "Tendinopathie du moyen fessier",
        mechanism:
          "Compression répétée du tendon lors des appuis unilatéraux en adduction",
      },
      {
        name: "Bursopathie trochantérienne",
        mechanism: "Friction répétée sur le grand trochanter",
      },
    ],
    preventionExercises: [
      { name: "Side-Lying Hip Abduction", sets: "3×15 reps avec élastique" },
      { name: "Single-Leg Squat (Bulgarian)", sets: "3×10 reps" },
      { name: "Lateral Band Walk", sets: "3×12 pas chaque direction" },
      { name: "Monster Walk (élastique)", sets: "3×10 m" },
    ],
    groupColor: "#f59e0b",
  },

  // ─── MOLLETS ─────────────────────────────────────────────────────────────
  {
    id: "calves",
    name: "Mollets",
    nameEn: "Triceps Surae",
    group: "Jambe Postérieure",
    subMuscles: [
      "Gastrocnémien médial",
      "Gastrocnémien latéral",
      "Soléaire",
    ],
    origin:
      "Condyles fémoraux médial et latéral (gastrocnémiens) ; face postérieure du tibia/péroné (soléaire)",
    insertion: "Calcanéum via le tendon d'Achille",
    pennationAngle: "15–25° (bipenné pour les gastrocnémiens, multipenné pour le soléaire)",
    innervation: "Nerf tibial (S1-S2)",
    fiberTypeI: 58,
    fiberTypeII: 42,
    footballRole:
      "Propulsion finale lors du départ de sprint — stabilisation de la cheville à l'appui",
    footballActions: [
      "Flexion plantaire explosive (poussée finale du sprint)",
      "Absorption des forces d'impact lors des atterrissages",
      "Stabilisation de la cheville lors des changements de direction",
      "Participation à la frappe via la chaîne cinétique distale",
    ],
    myofascialLine: "Ligne Dorsale Superficielle (SBL)",
    myofascialLineId: "SBL",
    connectedMuscles: [
      "Fascia plantaire",
      "Ischio-jambiers",
      "Biceps fémoral",
    ],
    commonInjuries: [
      {
        name: "Rupture du tendon d'Achille",
        mechanism:
          "Charge excentrique brutale (démarrage explosif, réception de saut)",
      },
      {
        name: "Tendinopathie achilléenne",
        mechanism: "Surcharge progressive (volume/intensité d'entraînement)",
      },
      {
        name: "Déchirure du gastrocnémien médial (Tennis Leg)",
        mechanism: "Extension brutale du genou avec flexion dorsale de cheville",
      },
    ],
    preventionExercises: [
      { name: "Heel Raise excentrique (Alfredson)", sets: "3×15 reps (genou tendu puis fléchi)" },
      { name: "Single-Leg Calf Raise", sets: "3×15 reps" },
      { name: "Isométrie anti-Achille (45°)", sets: "3×45 s" },
      { name: "Jump Rope (corde à sauter)", sets: "3×60 s" },
    ],
    groupColor: "#06b6d4",
  },

  // ─── PSOAS-ILIAQUE ────────────────────────────────────────────────────────
  {
    id: "psoas",
    name: "Psoas-Iliaque",
    nameEn: "Iliopsoas",
    group: "Fléchisseurs de Hanche",
    subMuscles: [
      "Grand psoas",
      "Petit psoas (inconstant)",
      "Iliaque",
    ],
    origin:
      "Corps vertébraux et processus transverses de T12-L4 (psoas) ; fosse iliaque (iliaque)",
    insertion: "Petit trochanter du fémur",
    pennationAngle: "5–15°",
    innervation:
      "Rameaux directs du plexus lombaire (L1-L4) ; nerf fémoral pour l'iliaque",
    fiberTypeI: 56,
    fiberTypeII: 44,
    footballRole:
      "Accélérateur du membre inférieur en phase de balancement — hissage du genou dans le sprint",
    footballActions: [
      "Flexion de hanche explosive (phase de balancement du sprint)",
      "Montée du genou lors des courses à haute vitesse",
      "Frappe : armé et accélération du membre inférieur",
      "Stabilisation lombaire lors des déséquilibres en jeu",
    ],
    myofascialLine: "Ligne Frontale Profonde (DFL)",
    myofascialLineId: "DFL",
    connectedMuscles: [
      "Diaphragme",
      "Transverse de l'abdomen",
      "Adducteurs",
    ],
    commonInjuries: [
      {
        name: "Tendinopathie du psoas",
        mechanism:
          "Friction du tendon sur le relief ilio-pubien (snapping hip)",
      },
      {
        name: "Contracture chronique du psoas",
        mechanism: "Position assise prolongée + volume élevé de sprints",
      },
    ],
    preventionExercises: [
      { name: "Fente basse avec rotation (stretch psoas)", sets: "3×60 s chaque côté" },
      { name: "Straight Leg Raise (renforcement)", sets: "3×15 reps avec charge" },
      { name: "Dragon Flag (gainage abdominal)", sets: "3×5-8 reps" },
      { name: "Hanging Leg Raise", sets: "3×10-12 reps" },
    ],
    groupColor: "#10b981",
  },

  // ─── TFL ─────────────────────────────────────────────────────────────────
  {
    id: "tfl",
    name: "Tenseur du Fascia Lata",
    nameEn: "Tensor Fasciae Latae",
    group: "Hanche Latérale",
    subMuscles: ["TFL (muscle unique)"],
    origin: "Épine iliaque antéro-supérieure (EIAS) et lèvre externe de la crête iliaque",
    insertion: "Tractus ilio-tibial → condyle latéral du tibia (tubercule de Gerdy)",
    pennationAngle: "0°",
    innervation: "Nerf glutéal supérieur (L4-L5)",
    fiberTypeI: 60,
    fiberTypeII: 40,
    footballRole:
      "Stabilisateur latéral du genou en course — tendon d'IT Band comme ressort de stockage d'énergie",
    footballActions: [
      "Stabilisation latérale du genou lors du sprint",
      "Tension du tractus ilio-tibial pendant la course",
      "Abduction et rotation interne de hanche",
      "Rôle passif dans le stockage/restitution d'énergie élastique",
    ],
    myofascialLine: "Ligne Latérale (LL)",
    myofascialLineId: "LL",
    connectedMuscles: ["Moyen fessier", "Tractus ilio-tibial", "Vaste latéral"],
    commonInjuries: [
      {
        name: "Syndrome de la bandelette ilio-tibiale (SBIT)",
        mechanism:
          "Friction répétée du IT band sur le condyle fémoral latéral (runners/sprinters)",
      },
      {
        name: "Contracture TFL avec compression fémoro-trochantérienne",
        mechanism: "Surcharge en abduction lors des changements de direction",
      },
    ],
    preventionExercises: [
      { name: "IT Band Foam Roll", sets: "2×60 s chaque côté" },
      { name: "Hip Abduction élastique debout", sets: "3×15 reps" },
      { name: "Side Plank avec abduction", sets: "3×30 s" },
      { name: "Clamshell élastique", sets: "3×15 reps" },
    ],
    groupColor: "#f59e0b",
  },

  // ─── RECTUS ABDOMINIS ─────────────────────────────────────────────────────
  {
    id: "rectus_abdominis",
    name: "Droit de l'Abdomen",
    nameEn: "Rectus Abdominis",
    group: "Core Antérieur",
    subMuscles: [
      "Droit de l'abdomen (segmenté par intersections tendineuses)",
    ],
    origin: "Symphyse pubienne et crête pubienne",
    insertion: "Cartilages costaux 5-6-7 et processus xiphoïde",
    pennationAngle: "0°",
    innervation: "Nerfs intercostaux T5-T12",
    fiberTypeI: 55,
    fiberTypeII: 45,
    footballRole:
      "Transmetteur de force entre membres inférieurs et supérieurs — rôle clé dans la frappe et les duels aériens",
    footballActions: [
      "Transfert de puissance lors de la frappe (lien membres inf/sup)",
      "Stabilisation en hyper-extension lors des duels aériens (têtes)",
      "Contrôle postural lors des réceptions de ballon",
      "Freinage de la rotation du tronc (couplage avec obliques)",
    ],
    myofascialLine: "Ligne Frontale Superficielle (SFL)",
    myofascialLineId: "SFL",
    connectedMuscles: [
      "Quadriceps (droit fémoral)",
      "Sternomastoïdien",
      "Intercostaux",
    ],
    commonInjuries: [
      {
        name: "Élongation/déchirure du droit de l'abdomen",
        mechanism: "Extension lombaire forcée en course ou frappe puissante",
      },
      {
        name: "Pubalgie (composante abdominale)",
        mechanism:
          "Déséquilibre entre traction pubienne abdominale et adducteurs",
      },
    ],
    preventionExercises: [
      { name: "Hollow Body Hold", sets: "3×30-45 s" },
      { name: "Ab Wheel Rollout", sets: "3×8-10 reps" },
      { name: "Hanging Knee/Leg Raise", sets: "3×12 reps" },
      { name: "Cable Crunch", sets: "3×15 reps" },
    ],
    groupColor: "#22d3ee",
  },

  // ─── OBLIQUES ─────────────────────────────────────────────────────────────
  {
    id: "obliques",
    name: "Obliques Abdominaux",
    nameEn: "Abdominal Obliques",
    group: "Core Latéral",
    subMuscles: [
      "Oblique externe (grand oblique)",
      "Oblique interne (petit oblique)",
    ],
    origin:
      "Crête iliaque et EIAS (oblique interne) ; 8 dernières côtes (oblique externe)",
    insertion:
      "Côtes, ligne blanche, crête iliaque et pubis (fibres croisées)",
    pennationAngle: "45–60° (fibre oblique caractéristique)",
    innervation: "Nerfs intercostaux T8-T12 et nerf ilio-hypogastrique",
    fiberTypeI: 57,
    fiberTypeII: 43,
    footballRole:
      "Générateurs de rotation du tronc — essentiels dans les frappes courbes, les passes longues et les changements de direction",
    footballActions: [
      "Rotation explosive du tronc lors des frappes à mi-volée",
      "Anticipation rotatoire lors des passes en pivot",
      "Résistance aux forces latérales en défense",
      "Freinage de la rotation lors des réceptions en déséquilibre",
    ],
    myofascialLine: "Ligne Spirale (SPL)",
    myofascialLineId: "SPL",
    connectedMuscles: [
      "Dentelé antérieur",
      "Rhomboïde",
      "Grand fessier controlatéral",
    ],
    commonInjuries: [
      {
        name: "Déchirure oblique",
        mechanism:
          "Rotation explosive avec tronc en hyper-extension (frappe ou dribble)",
      },
      {
        name: "Élongation latérale",
        mechanism: "Étirement rapide en position instable (déséquilibre aérien)",
      },
    ],
    preventionExercises: [
      { name: "Pallof Press", sets: "3×12 reps chaque côté" },
      { name: "Side Plank (isométrie)", sets: "3×30-45 s" },
      { name: "Wood Chop (câble)", sets: "3×12 reps chaque côté" },
      { name: "Russian Twist avec charge", sets: "3×20 reps" },
    ],
    groupColor: "#8b5cf6",
  },

  // ─── TRANSVERSE DE L'ABDOMEN ──────────────────────────────────────────────
  {
    id: "transverse_abdominis",
    name: "Transverse de l'Abdomen",
    nameEn: "Transversus Abdominis",
    group: "Core Profond",
    subMuscles: ["Transverse de l'abdomen (muscle unique)"],
    origin: "Face interne des 7-12e cartilages costaux, fascia thoraco-lombaire, crête iliaque",
    insertion: "Ligne blanche (aponévrose) et pubis",
    pennationAngle: "Fibres horizontales (0°)",
    innervation: "Nerfs intercostaux T7-T12, nerf ilio-hypogastrique et ilio-inguinal",
    fiberTypeI: 70,
    fiberTypeII: 30,
    footballRole:
      "Corset musculaire profond — pré-activation réflexe avant chaque mouvement des membres pour stabiliser la colonne",
    footballActions: [
      "Stabilisation lombaire avant chaque sprint et frappe (pré-activation)",
      "Augmentation de la pression intra-abdominale protectrice",
      "Contrôle de la position lombaire lors des déséquilibres",
      "Rôle clé dans la prévention des lombalgies du footballeur",
    ],
    myofascialLine: "Ligne Frontale Profonde (DFL)",
    myofascialLineId: "DFL",
    connectedMuscles: ["Diaphragme", "Multifidus", "Psoas-iliaque"],
    commonInjuries: [
      {
        name: "Lombalgie par déficit de gainage",
        mechanism: "Insuffisance de pré-activation en situation de fatigue",
      },
      {
        name: "Hernie inguinale sportive",
        mechanism:
          "Pression intrabdominale excessive avec déficit du transverse",
      },
    ],
    preventionExercises: [
      { name: "Planche (gainage frontal)", sets: "3×60 s" },
      { name: "Dead Bug", sets: "3×8 reps (bras + jambe opposés)" },
      { name: "Bird Dog", sets: "3×10 reps alternés" },
      { name: "Activation hypopressive", sets: "3×20 respirations" },
    ],
    groupColor: "#6ee7b7",
  },
];

// ─── Fascial Chains ────────────────────────────────────────────────────────

export interface FascialChain {
  id: "SBL" | "SFL" | "LL" | "SPL" | "DFL" | "AL";
  name: string;
  nameEn: string;
  color: string;
  description: string;
  muscleIds: string[];
}

export const FASCIAL_CHAINS: FascialChain[] = [
  {
    id: "SBL",
    name: "Ligne Dorsale Superficielle",
    nameEn: "Superficial Back Line",
    color: "#f97316",
    description:
      "Relie la face plantaire du pied jusqu'au cuir chevelu par la face postérieure du corps.",
    muscleIds: ["calves", "hamstrings", "glute_max"],
  },
  {
    id: "SFL",
    name: "Ligne Frontale Superficielle",
    nameEn: "Superficial Front Line",
    color: "#22d3ee",
    description:
      "Relie le dessus du pied jusqu'au crâne par la face antérieure du corps.",
    muscleIds: ["quadriceps", "rectus_abdominis"],
  },
  {
    id: "LL",
    name: "Ligne Latérale",
    nameEn: "Lateral Line",
    color: "#a855f7",
    description:
      "Relie la face latérale du pied jusqu'au crâne par le flanc du corps.",
    muscleIds: ["tfl", "glute_med", "obliques"],
  },
  {
    id: "SPL",
    name: "Ligne Spirale",
    nameEn: "Spiral Line",
    color: "#f59e0b",
    description:
      "Enroule le corps en diagonale, coordonnant les rotations du tronc avec les membres.",
    muscleIds: ["obliques", "tfl", "adductors"],
  },
  {
    id: "DFL",
    name: "Ligne Frontale Profonde",
    nameEn: "Deep Front Line",
    color: "#4ade80",
    description:
      "Ligne stabilisatrice centrale reliant la voûte plantaire aux structures profondes du cou.",
    muscleIds: ["psoas", "adductors", "transverse_abdominis"],
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────

export function getMuscleById(id: string): MuscleData | undefined {
  return MUSCLES.find((m) => m.id === id);
}

export function getMusclesByChain(chainId: string): MuscleData[] {
  const chain = FASCIAL_CHAINS.find((c) => c.id === chainId);
  if (!chain) return [];
  return chain.muscleIds
    .map((id) => getMuscleById(id))
    .filter(Boolean) as MuscleData[];
}
