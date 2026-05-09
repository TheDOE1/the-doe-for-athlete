// ─────────────────────────────────────────────────────────────────────────────
// AI Chat Engine — Keyword-pattern based simulated responses
// Evidence-based protocols for football coaching assistant
// ─────────────────────────────────────────────────────────────────────────────

export interface AISource {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
}

export interface AIResponse {
  content: string;
  sources: AISource[];
  showDisclaimer: boolean;
}

// ─── Pattern Definitions ──────────────────────────────────────────────────────

const patterns: Array<{
  keywords: string[];
  response: AIResponse;
}> = [
  // ── ISCHIOJAMBIERS / HAMSTRING ────────────────────────────────────────────
  {
    keywords: [
      "ischio",
      "hamstring",
      "ischiojambier",
      "ischios",
      "biceps fémoral",
      "déchirure",
      "claquage",
    ],
    response: {
      showDisclaimer: true,
      content: `**Protocole de Réathlétisation — Déchirure Ischio Grade 2**

La réathlétisation d'une déchirure ischiojambière grade 2 suit un protocole progressif en 5 phases. La durée moyenne est de **6 à 10 semaines** selon la localisation (biceps fémoral proximal = plus long).

---

**Phase 1 — Protection & Anti-inflammatoire (J0–J5)**
- Cryothérapie 3×15 min/jour
- Électrothérapie (TENS) pour analgésie
- Marche sans boiterie (béquilles si nécessaire)
- Étirements doux en position allongée (arrêt à la douleur)
- Objectif : résolution de l'hématome, mobilité complète indolore

**Phase 2 — Renforcement isométrique (J5–J14)**
- Contractions isométriques en position raccourcie (45° flexion genou)
- Progresser vers positions allongées
- Vélo stationnaire à faible résistance
- Aquajogging si disponible
- Objectif : tolérance à la charge sans douleur

**Phase 3 — Renforcement excentrique (J14–J28)**
- Nordic Hamstring Exercise progressif (van Dyk, 2019 : divise par 2 le taux de récidive)
- Romanian Deadlift unilatéral (contrôle de la charge)
- Pont fessier à une jambe
- Début jogging (rythme conversationnel)
- Objectif : >80% force excentrique côté sain

**Phase 4 — Réintroduction des intensités élevées (J28–J50)**
- Sprints progressifs : 50% → 70% → 85% vitesse max
- Exercices de décélération contrôlée
- Sauts et atterrissages unilatéraux
- Changements de direction progressifs
- Test H-test : résultat > 90% par rapport au côté sain requis

**Phase 5 — Retour au jeu (J50+)**
- Critères objectifs OBLIGATOIRES :
  - Force excentrique ischio ≥ 90% côté sain
  - Sprint max sans douleur ni inhibition
  - H-test > 90%
  - Rapport IJ/Q > 0.6 (ratio fonctionnel) en isocinétisme
- Entraînement collectif complet sans restriction

> **Attention à la récidive** : 24% des déchirures biceps fémoral proximal récidivent dans les 2 mois. Ne jamais anticiper le retour sur critères temporels seuls.`,
      sources: [
        {
          title: "Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries",
          authors: "van Dyk N et al.",
          journal: "British Journal of Sports Medicine",
          year: 2019,
          doi: "10.1136/bjsports-2018-100745",
        },
        {
          title: "Hamstring muscle injuries in professional football: the 10-year experience of the UEFA Elite Club Injury Study",
          authors: "Tol JL et al.",
          journal: "British Journal of Sports Medicine",
          year: 2014,
          doi: "10.1136/bjsports-2013-093038",
        },
        {
          title: "Understanding injury mechanisms: a key component of preventing injuries in sport",
          authors: "Bahr R, Krosshaug T",
          journal: "British Journal of Sports Medicine",
          year: 2005,
          doi: "10.1136/bjsm.2005.018341",
        },
      ],
    },
  },

  // ── LCA / CROISÉ ─────────────────────────────────────────────────────────
  {
    keywords: [
      "lca",
      "croisé",
      "ligament croisé",
      "anterior cruciate",
      "acl",
      "genou",
      "valgus",
    ],
    response: {
      showDisclaimer: true,
      content: `**Programme de Prévention LCA — Football**

Le LCA est la blessure la plus coûteuse en football (9-12 mois d'absence). Les femmes ont un risque 3-6× plus élevé, notamment en phase ovulatoire (hyperlaxité ligamentaire hormonale).

---

**Principes fondamentaux (Hewett, 2005)**
Le valgus dynamique du genou lors de la réception est le principal mécanisme de rupture. L'objectif est de corriger ce pattern via renforcement neuromusculaire.

---

**Programme FIFA 11+ (Gold Standard)**

Durée : **20 min**, 3×/semaine minimum. Divisé en 3 parties :

**Partie 1 — Activation (5 min)**
- Course avec variations : normale, vers l'arrière, diagonales
- Montées de genoux hautes, talons-fesses
- Sauts latéraux, changements de direction 90°

**Partie 2 — Renforcement (12 min)**
- *Gainage alterné* : planche frontale avec rotation 3×20s
- *Squat unilatéral* : 3×10 — contrôle genou au-dessus du 2e orteil
- *Nordic Hamstring* : 3×5 (progresser jusqu'à 3×10)
- *Arabesque à une jambe* : 3×10 chaque côté — genou fléchi, contrôle de cheville
- *Saut-réception* : focus atterrissage en triple flexion (hanche/genou/cheville)

**Partie 3 — Sprint & Spécifique (3 min)**
- Sprint 30m × 2
- Sprint avec changement de direction commandé

---

**Points d'attention pour les joueuses (phase ovulatoire J12-J16)**
- Réduire les exercices de COD (Changement de Direction) haute intensité
- Privilégier proprioception, gainage, équilibre
- Augmenter le volume de renforcement des abducteurs de hanche

**Résultat attendu :** -50% de blessures LCA en 1 saison (Hewett, 2005).`,
      sources: [
        {
          title: "Biomechanical measures of neuromuscular control and valgus loading of the knee predict ACL injury risk in female athletes",
          authors: "Hewett TE et al.",
          journal: "American Journal of Sports Medicine",
          year: 2005,
          doi: "10.1177/0363546504269591",
        },
        {
          title: "Muscle injuries in elite male and female football players: a prospective study in the UEFA Champions League",
          authors: "Larruskain J et al.",
          journal: "Scandinavian Journal of Medicine & Science in Sports",
          year: 2023,
          doi: "10.1111/sms.14292",
        },
        {
          title: "The Effect of Menstrual Cycle Phase on Exercise Performance in Eumenorrheic Women",
          authors: "McNulty KL et al.",
          journal: "Sports Medicine",
          year: 2020,
          doi: "10.1007/s40279-020-01319-3",
        },
      ],
    },
  },

  // ── RÉCUPÉRATION / FATIGUE ────────────────────────────────────────────────
  {
    keywords: [
      "récupération",
      "recovery",
      "fatigue",
      "repos",
      "régénération",
      "accumulation",
      "surmenage",
      "surcharge",
      "match tous",
      "congestion",
    ],
    response: {
      showDisclaimer: false,
      content: `**Protocole de Récupération — Congestion de Matchs**

En période de congestion (3 matchs/10 jours), la récupération devient la priorité absolue. Le processus de fatigue cumulative suit des cinétiques différentes selon le type de stress.

---

**Cinétiques de récupération post-match**
- **Dommages musculaires** (CK, myoglobine) : ↑ pendant 24-72h, retour à la baseline en 72h
- **Glycogène musculaire** : -40% post-match, récupération en 24-48h avec glucides suffisants
- **Fatigue neuromusculaire** : 24-48h pour récupération force explosive
- **Fatigue psychologique** : peut persister 72-96h (particulièrement chez les joueurs peu utilisés)

---

**Fenêtre immédiate (0-2h post-match)**
- Glucides : **1-1.2 g/kg** de poids corporel dès la fin du match
- Protéines : **20-40 g** de protéines rapidement assimilables (whey idéal)
- Hydratation : 150% du déficit hydrique (peser avant/après)
- Cryothérapie : bain froid à 10-15°C pendant 10-15 min (réduit les marqueurs de dommages musculaires)

**J+1 — Récupération active (si match dans 72h)**
- 20-25 min de vélo stationnaire à faible intensité (50-55% FCmax)
- Natation légère ou aquajogging 20 min
- Massage des membres inférieurs
- Étirements doux
- **Eviter** toute charge neuromusculaire intense

**J+1 — Séance légère (si match dans 96h+)**
- Activation technique basse intensité : 45 min max
- Jeux de petits côtés à faible pression (possession)
- Travail proprioceptif et de coordination

---

**ACWR comme indicateur (Gabbett, 2016)**
- Zone verte : **0.8–1.3** (risque blessure minimal)
- Zone orange : **1.3–1.5** (surveillance accrue)
- Zone rouge : **>1.5** (risque blessure ×2 — réduire la charge d'entraînement)

Calculer l'ACWR de chaque joueur chaque lundi pour ajuster les charges hebdomadaires.`,
      sources: [
        {
          title: "The training-injury prevention paradox: should athletes be training smarter and harder?",
          authors: "Gabbett TJ",
          journal: "British Journal of Sports Medicine",
          year: 2016,
          doi: "10.1136/bjsports-2015-095788",
        },
        {
          title: "Sleep and Athletic Performance: The Effects of Sleep Loss on Exercise Performance",
          authors: "Fullagar HH et al.",
          journal: "Sports Medicine",
          year: 2015,
          doi: "10.1007/s40279-014-0260-0",
        },
        {
          title: "High-intensity interval training, solutions to the programming puzzle",
          authors: "Buchheit M, Laursen PB",
          journal: "Sports Medicine",
          year: 2013,
          doi: "10.1007/s40279-013-0029-x",
        },
      ],
    },
  },

  // ── NUTRITION / FER ───────────────────────────────────────────────────────
  {
    keywords: [
      "nutrition",
      "fer",
      "ferritine",
      "alimentation",
      "carence",
      "anémie",
      "régime",
      "glucides",
      "protéines",
      "hydratation",
    ],
    response: {
      showDisclaimer: false,
      content: `**Guide Nutritionnel — Football de Haut Niveau**

La nutrition est un facteur de performance et de prévention des blessures souvent négligé. La carence en fer est la carence la plus fréquente dans le football féminin (30-40% des joueuses).

---

**Besoins énergétiques par phase de saison**

| Phase | Glucides | Protéines | Lipides |
|-------|----------|-----------|---------|
| Pré-saison | 6-8 g/kg/j | 1.8-2.2 g/kg/j | 20-25% |
| Saison (2 matchs/sem) | 7-10 g/kg/j | 1.6-2.0 g/kg/j | 20-30% |
| Trêve | 4-6 g/kg/j | 1.6-1.8 g/kg/j | 25-35% |

---

**Carence en Fer — Protocole de gestion**

*Facteurs de risque spécifiques foot féminin :*
- Pertes menstruelles importantes
- Faible disponibilité énergétique (RED-S)
- Régimes végétariens/végans
- Entraînements sur surfaces dures (hémolyse des pieds)

*Seuils de référence pour les athlètes :*
- Ferritine optimale : **>40 µg/L** (le seuil médical de 12 µg/L est insuffisant)
- Ferritine < 20 µg/L : supplementation obligatoire sous supervision médicale
- Hémoglobine : ≥ 12.5 g/dL (femmes), ≥ 14 g/dL (hommes)

*Stratégies alimentaires :*
- Privilégier le fer héminique (viande rouge, foie) : biodisponibilité 15-35%
- Associer fer non-héminique (légumineuses, épinards) + vitamine C : absorption ×3
- Éviter thé/café dans les 2h post-repas (tanins inhibent l'absorption)
- Bilan sanguine systématique en début et mi-saison

---

**Timing nutritionnel péri-match**
- **J-1 (chargement glucidique)** : +2 g/kg de glucides vs habituels
- **-3h avant match** : repas riche en glucides complexes (400-600 kcal)
- **-1h** : collation légère 30-60g glucides simples
- **Mi-temps** : 30-60g glucides + 300 mL eau
- **Post-match <30 min** : récupération glucido-protéique (ratio 3:1)`,
      sources: [
        {
          title: "Position of the Academy of Nutrition and Dietetics: Nutrition and Athletic Performance",
          authors: "Thomas DT et al.",
          journal: "Journal of the Academy of Nutrition and Dietetics",
          year: 2016,
          doi: "10.1016/j.jand.2015.12.006",
        },
        {
          title: "IOC consensus statement on relative energy deficiency in sport (RED-S): 2018 update",
          authors: "Mountjoy M et al.",
          journal: "British Journal of Sports Medicine",
          year: 2018,
          doi: "10.1136/bjsports-2018-099193",
        },
      ],
    },
  },

  // ── SPRINT / VITESSE ─────────────────────────────────────────────────────
  {
    keywords: [
      "sprint",
      "vitesse",
      "accélération",
      "rapidité",
      "vma",
      "alactique",
      "speed",
    ],
    response: {
      showDisclaimer: false,
      content: `**Programme de Développement de la Vitesse**

Le développement de la vitesse en football nécessite d'intervenir sur le profil Force-Vitesse (FV) individuel de chaque joueur. La puissance maximale de sprint est le produit de F0 (force horizontale max) × V0 (vitesse max théorique) / 4.

---

**Étape 1 — Évaluation du profil FV (Morin & Samozino, 2016)**

Protocole sprint étalé sur 40m avec chronomètre ou GPS à 100Hz :
1. 3 sprints maximaux avec récupération complète (5-7 min)
2. Calculer F0 (N/kg), V0 (m/s), Pmax (W/kg), Indice de Déficit FV (DFV%)
3. DFV% = (SFVopt - SFVact) / SFVopt × 100

*Interprétation :*
- **DFV% > +10%** : déficit en force → priorité musculation lourde
- **DFV% < -10%** : déficit en vitesse → priorité sprint max et pliométrie explosive
- **DFV% ±10%** : profil équilibré → conserver proportion actuelle

---

**Entraînement du sprint : les 3 phases**

**Phase 1 — Accélération (0-10m)**
- Résistances traînées (10% poids corporel)
- Hills sprints 5-8%
- Power Cleans, Trap Bar Deadlift lourds
- Objectif : augmenter F0 et DRF (Direction de Force horizontale)

**Phase 2 — Transition (10-30m)**
- Sprints résistés modérés (5% poids)
- Pliométrie multi-directionnelle : Depth Jump, bounding
- Squat jump chargé 30-40% 1RM

**Phase 3 — Vitesse maximale (30m+)**
- Sprints libres 40-60m après accélération lancée
- Flying 20s (20m accélération + 20m mesurés)
- Aucune résistance supplémentaire
- Travail technique : position corps, fréquence vs longueur de foulée

---

**Volume et récupération (Haugen, 2019)**
- Distance totale : **400-600m** de sprint max par séance
- Récupération entre répétitions : **1 min par 10m** de sprint
- Fréquence optimale : **2 séances/semaine** en période de préparation
- En saison : **1 séance** post-match, en J+4 minimum`,
      sources: [
        {
          title: "Individual acceleration-speed profile in-situ: more insights into the slow-force / fast-force continuum",
          authors: "Morin JB, Samozino P",
          journal: "International Journal of Sports Physiology and Performance",
          year: 2016,
          doi: "10.1123/ijspp.2015-0638",
        },
        {
          title: "Sprint mechanical properties in football players according to playing standard, position, age and sex",
          authors: "Haugen TA et al.",
          journal: "Journal of Sports Sciences",
          year: 2019,
          doi: "10.1080/02640414.2018.1502355",
        },
        {
          title: "Establishing the reliability and meaningful change of the load-velocity relationship in the squat",
          authors: "Jovanovic M, Flanagan EP",
          journal: "Journal of Australian Strength and Conditioning",
          year: 2014,
        },
      ],
    },
  },

  // ── FORCE / MUSCULATION ───────────────────────────────────────────────────
  {
    keywords: [
      "force",
      "musculation",
      "renforcement",
      "musculaire",
      "squat",
      "deadlift",
      "nordic",
      "poids",
      "rm",
    ],
    response: {
      showDisclaimer: false,
      content: `**Programme de Développement de la Force — Football**

L'entraînement de la force en football vise à développer la puissance musculaire applicable sur le terrain. L'intégration optimale en saison est de 2 séances/semaine (Ronnestad & Mujika, 2014).

---

**Principe du VBT (Velocity-Based Training)**

Mesurer la vitesse de barre permet d'individualiser la charge en temps réel (Jovanovic & Flanagan, 2014) :

| Qualité cible | Vitesse barre (squat) | % 1RM approx. |
|---------------|----------------------|----------------|
| Force max | 0.3-0.5 m/s | 85-100% |
| Puissance force | 0.5-0.75 m/s | 60-80% |
| Puissance vitesse | 0.75-1.0 m/s | 40-60% |
| Vitesse-endurance | > 1.0 m/s | < 40% |

**Arrêt de série quand la vitesse chute de 20%** → préserve le potentiel neuromusculaire

---

**Programme Hors-Saison (3 séances/semaine)**

**Séance A — Force / Jambes**
1. Squat barre haute : 4×4-6 @85%1RM (VBT : arrêt à -20%)
2. Romanian Deadlift : 3×8 @65-70%
3. Bulgarian Split Squat : 3×8 chaque jambe
4. Nordic Hamstring : 3×6 excentrique pur

**Séance B — Puissance / Explosivité**
1. Power Clean ou Hang Power Clean : 4×4 @70-80%
2. Squat Jump chargé : 4×5 @30%1RM — vitesse max
3. Trap Bar Deadlift : 3×5 @80%
4. Depth Jump : 3×6

**Séance C — Gainage / Prévention**
1. Planche 3×30-45s
2. Fentes dynamiques 3×10 chaque côté
3. Hip Thrust unilatéral 3×12
4. Core Stability circuit : side plank, pallof press, dead bug

---

**En saison (1-2 séances/semaine)**

Réduire le volume (-40%) en maintenant l'intensité. 2 séances par semaine maintiennent les gains ; 1 séance prévient la perte de force. Ne jamais faire de séance lourde en J-2 ou J-1 avant match.`,
      sources: [
        {
          title: "Optimizing strength training for running and cycling endurance performance",
          authors: "Ronnestad BR, Mujika I",
          journal: "Scandinavian Journal of Medicine & Science in Sports",
          year: 2014,
          doi: "10.1111/sms.12104",
        },
        {
          title: "Establishing the reliability and meaningful change of the load-velocity relationship in the squat",
          authors: "Jovanovic M, Flanagan EP",
          journal: "Journal of Australian Strength and Conditioning",
          year: 2014,
        },
        {
          title: "Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries",
          authors: "van Dyk N et al.",
          journal: "British Journal of Sports Medicine",
          year: 2019,
          doi: "10.1136/bjsports-2018-100745",
        },
      ],
    },
  },

  // ── CYCLE MENSTRUEL / FEMME ───────────────────────────────────────────────
  {
    keywords: [
      "cycle",
      "menstruel",
      "règles",
      "hormones",
      "féminin",
      "joueuse",
      "femme",
      "ovulation",
      "progesterone",
      "oestrogène",
    ],
    response: {
      showDisclaimer: false,
      content: `**Entraînement & Cycle Menstruel — Guide pour les coachs**

La physiologie féminine influence la performance et le risque de blessure. La variabilité inter-individuelle est élevée : surveiller et individualiser plutôt que généraliser (McNulty, 2020).

---

**Les 4 phases et leurs implications**

**Phase Menstruelle (J1-J5) — Volume réduit**
- Œstrogène et progestérone au plus bas
- Fatigue accrue, douleurs possibles
- ✓ Entraînement léger, technique, mobilité
- ✗ Éviter intensités maximales si symptômes sévères

**Phase Folliculaire (J5-J12) — Phase optimale**
- Œstrogène ↑ : anabolisme, récupération accélérée
- Tolérance maximale à l'entraînement intense
- ✓ Charges lourdes, HIIT, matchs importants
- Gain en force +3-5% possible vs autres phases

**Phase Ovulatoire (J12-J16) — ALERTE LCA**
- Pic d'œstrogène → hyperlaxité ligamentaire
- Risque de rupture LCA ×3 (Hewett, 2005)
- ✓ Proprioception, gainage, renforcement preventif
- ✗ Réduire COD haute intensité, réceptions de saut

**Phase Lutéale (J16-J28) — Fatigue neuromusculaire**
- Progestérone élevée → thermorégulation difficile
- Hydratation supplémentaire (+300-500 mL/jour)
- ✓ Maintien des charges, récupération renforcée
- Signes de syndrome prémenstruel après J20 : tolérance individuelle variable

---

**Implémentation pratique pour l'équipe**

1. Application de suivi du cycle pour chaque joueuse (en option, jamais forcé)
2. Marquage discret des phases dans le planning (code couleur)
3. Adaptation individuelle des intensités — ne jamais généraliser à toute l'équipe
4. Communication avec les joueuses sur les recommandations scientifiques`,
      sources: [
        {
          title: "The Effect of Menstrual Cycle Phase on Exercise Performance in Eumenorrheic Women: A Systematic Review and Meta-Analysis",
          authors: "McNulty KL et al.",
          journal: "Sports Medicine",
          year: 2020,
          doi: "10.1007/s40279-020-01319-3",
        },
        {
          title: "Biomechanical measures of neuromuscular control and valgus loading of the knee predict ACL injury risk",
          authors: "Hewett TE et al.",
          journal: "American Journal of Sports Medicine",
          year: 2005,
          doi: "10.1177/0363546504269591",
        },
        {
          title: "Monitoring the training load and match exposure of female academy soccer players over a 32-week period",
          authors: "Malone S et al.",
          journal: "Journal of Strength and Conditioning Research",
          year: 2017,
          doi: "10.1519/JSC.0000000000001683",
        },
      ],
    },
  },

  // ── HIIT / CARDIO ─────────────────────────────────────────────────────────
  {
    keywords: [
      "hiit",
      "interval",
      "cardio",
      "vma",
      "endurance",
      "aérobie",
      "vo2",
      "fcmax",
    ],
    response: {
      showDisclaimer: false,
      content: `**Programmation du HIIT en Football**

Le HIIT est la méthode d'entraînement la plus étudiée pour améliorer le VO2max et les capacités de répétition des efforts intenses en football (Buchheit & Laursen, 2013).

---

**Les 6 variables du HIIT (Buchheit & Laursen, 2013)**

1. **Intensité de travail** : 85-120% VMA
2. **Durée de travail** : 10s à 4 min
3. **Intensité de récupération** : passive (0%) à 70% VMA
4. **Durée de récupération** : rapport travail/repos de 1:1 à 1:4
5. **Mode d'exercice** : course, vélo, natation, petits-côtés
6. **Volume total** : 15-30 min de travail réel

---

**Formats recommandés pour le football**

**Short HIIT (10-10) — Développement navette**
- 10s sprint / 10s récup active × 20-30 rép
- Intensité : 95-100% VMA
- Objectif : puissance aérobie, tolérance lactique
- Idéal : J+4 après match en début de semaine

**Long Intervals (3-4 min) — Développement VO2max**
- 3-4 min @95%FCmax / 3 min @65%FCmax × 4-6 rép
- Progression sur 6 semaines
- Objectif : élévation durable du VO2max

**Petits côtés (SSG) — Application spécifique**
- 3v3 à 4v4 : intensité 90-95% FCmax automatiquement atteinte
- Intègre prises de décision + technique
- Volume : 4-8 matchs de 3 min avec 2-3 min récupération active

---

**Periodisation sur la semaine type**

- **J1 post-match** : récupération passive/active
- **J2** : HIIT court (10-10) ou SSG modéré
- **J3** : force/musculation
- **J4** : HIIT long ou SSG intensif
- **J5** : activation pré-match
- **J6** : match`,
      sources: [
        {
          title: "High-intensity interval training, solutions to the programming puzzle",
          authors: "Buchheit M, Laursen PB",
          journal: "Sports Medicine",
          year: 2013,
          doi: "10.1007/s40279-013-0029-x",
        },
        {
          title: "The training-injury prevention paradox: should athletes be training smarter and harder?",
          authors: "Gabbett TJ",
          journal: "British Journal of Sports Medicine",
          year: 2016,
          doi: "10.1136/bjsports-2015-095788",
        },
      ],
    },
  },
];

// ─── Default response ─────────────────────────────────────────────────────────

const DEFAULT_RESPONSE: AIResponse = {
  showDisclaimer: false,
  content: `**Assistant Coach IA — The Doe For Athlete**

Je suis votre assistant coach scientifique spécialisé en football. Je peux vous aider sur les thèmes suivants :

- **Réathlétisation** : protocoles ischiojambiers, LCA, cheville
- **Prévention** : programmes spécifiques, analyse des risques
- **Récupération** : protocoles post-match, congestion calendaire
- **Nutrition** : besoins énergétiques, carence en fer, timing nutritionnel
- **Développement vitesse** : profil Force-Vitesse, sprint, accélération
- **Renforcement** : VBT, programmation force, Nordic Hamstring
- **Physiologie féminine** : cycle menstruel, prévention LCA, RED-S
- **HIIT** : formats, périodisation, SSG

Posez-moi une question spécifique pour obtenir un protocole détaillé avec ses références scientifiques.`,
  sources: [],
};

// ─── Main engine ──────────────────────────────────────────────────────────────

export function processMessage(message: string): AIResponse {
  const lower = message.toLowerCase();

  for (const pattern of patterns) {
    if (pattern.keywords.some((kw) => lower.includes(kw))) {
      return pattern.response;
    }
  }

  return DEFAULT_RESPONSE;
}

export function generateConversationTitle(firstMessage: string): string {
  const lower = firstMessage.toLowerCase();
  if (lower.includes("ischio") || lower.includes("hamstring")) {
    return "Réathlétisation ischiojambiers";
  }
  if (lower.includes("lca") || lower.includes("croisé")) {
    return "Prévention LCA";
  }
  if (lower.includes("récupération") || lower.includes("fatigue")) {
    return "Protocole de récupération";
  }
  if (lower.includes("nutrition") || lower.includes("fer")) {
    return "Nutrition sportive";
  }
  if (lower.includes("sprint") || lower.includes("vitesse")) {
    return "Développement de la vitesse";
  }
  if (lower.includes("force") || lower.includes("musculation")) {
    return "Renforcement musculaire";
  }
  if (lower.includes("cycle") || lower.includes("féminin")) {
    return "Physiologie féminine";
  }
  if (lower.includes("hiit") || lower.includes("cardio")) {
    return "Programmation HIIT";
  }
  return firstMessage.slice(0, 45) + (firstMessage.length > 45 ? "..." : "");
}
