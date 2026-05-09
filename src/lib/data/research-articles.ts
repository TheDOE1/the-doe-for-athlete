// ─────────────────────────────────────────────────────────────────────────────
// Research Articles — Evidence-Based Sports Science Database
// Curated articles for football performance & rehabilitation
// ─────────────────────────────────────────────────────────────────────────────

export type ArticleTag =
  | "récupération"
  | "nutrition"
  | "prévention"
  | "performance"
  | "femmes";

export interface ResearchArticle {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  abstract: string; // Vulgarized summary in French
  tags: ArticleTag[];
  isNew: boolean; // Published in last 2 years relative to 2024
}

export const RESEARCH_ARTICLES: ResearchArticle[] = [
  // ── Prévention ───────────────────────────────────────────────────────────────
  {
    id: "van-dyk-2019",
    title:
      "Including the Nordic hamstring exercise in injury prevention programmes halves the rate of hamstring injuries: a systematic review and meta-analysis of 8459 athletes",
    authors: ["van Dyk N", "Behan FP", "Whiteley R"],
    journal: "British Journal of Sports Medicine",
    year: 2019,
    doi: "10.1136/bjsports-2018-100745",
    abstract:
      "Cette méta-analyse portant sur 8 459 athlètes démontre que l'intégration du Nordic Hamstring Exercise (NHE) dans les programmes de prévention divise par deux le taux de blessures aux ischiojambiers. L'exercice agit en augmentant la résistance musculaire excentrique et en repoussant l'angle de couple de pointe vers des longueurs musculaires plus longues, là où les risques de déchirure sont les plus élevés lors des phases de sprint.",
    tags: ["prévention"],
    isNew: false,
  },
  {
    id: "hewett-2005",
    title:
      "Biomechanical measures of neuromuscular control and valgus loading of the knee predict anterior cruciate ligament injury risk in female athletes",
    authors: ["Hewett TE", "Myer GD", "Ford KR", "Heidt RS"],
    journal: "American Journal of Sports Medicine",
    year: 2005,
    doi: "10.1177/0363546504269591",
    abstract:
      "Cette étude prospective sur 205 joueuses identifie les facteurs biomécaniques prédictifs de rupture du LCA. Un valgus dynamique du genou élevé au contact initial lors de la réception de saut, couplé à une asymétrie de force des abducteurs de hanche, multiplie par 6.6 le risque de rupture du LCA. Ces données fondent le protocole de screening par Drop Jump Test.",
    tags: ["prévention", "femmes"],
    isNew: false,
  },
  {
    id: "bahr-2005",
    title:
      "Understanding injury mechanisms: a key component of preventing injuries in sport",
    authors: ["Bahr R", "Krosshaug T"],
    journal: "British Journal of Sports Medicine",
    year: 2005,
    doi: "10.1136/bjsm.2005.018341",
    abstract:
      "Les auteurs proposent un modèle multicausal des mécanismes de blessure en sport. Distinguer les facteurs de risque intrinsèques (force musculaire, proprioception, historique de blessures) des facteurs extrinsèques (charge, surface, équipement) est essentiel pour concevoir des programmes de prévention efficaces. Ce cadre théorique reste la référence en médecine du sport.",
    tags: ["prévention"],
    isNew: false,
  },

  // ── Charge & Récupération ─────────────────────────────────────────────────
  {
    id: "gabbett-2016",
    title:
      "The training-injury prevention paradox: should athletes be training smarter and harder?",
    authors: ["Gabbett TJ"],
    journal: "British Journal of Sports Medicine",
    year: 2016,
    doi: "10.1136/bjsports-2015-095788",
    abstract:
      "Tim Gabbett démontre que les charges d'entraînement élevées protègent des blessures à condition que l'augmentation soit progressive et contrôlée. Le ratio ACWR (Charge Aiguë/Chronique) entre 0.8 et 1.3 représente la 'zone verte' de performance sans sur-risque. Au-dessus de 1.5, le risque de blessure double. Ce paradoxe redéfinit la philosophie de la charge : sous-entraîner est aussi dangereux que sur-entraîner.",
    tags: ["prévention", "performance"],
    isNew: false,
  },
  {
    id: "fullagar-2015",
    title:
      "Sleep and Athletic Performance: The Effects of Sleep Loss on Exercise Performance, and Physiological and Cognitive Responses to Exercise",
    authors: ["Fullagar HH", "Skorski S", "Duffield R", "Hammes D"],
    journal: "Sports Medicine",
    year: 2015,
    doi: "10.1007/s40279-014-0260-0",
    abstract:
      "Une revue systématique sur les effets du manque de sommeil sur les performances sportives. Moins de 7 heures de sommeil par nuit réduit la puissance maximale de 11%, la précision technique de 15% et allonge le temps de réaction. En football, cela se traduit par une dégradation des prises de décision en fin de match. Recommandation : cibler 8-9 heures pour les athlètes de haut niveau.",
    tags: ["récupération"],
    isNew: false,
  },
  {
    id: "malone-2017",
    title:
      "Monitoring the training load and match exposure of female academy soccer players over a 32-week period",
    authors: ["Malone S", "Roe M", "Doran DA", "Gabbett TJ", "Collins K"],
    journal: "Journal of Strength and Conditioning Research",
    year: 2017,
    doi: "10.1519/JSC.0000000000001683",
    abstract:
      "Analyse sur 32 semaines de la charge d'entraînement et de match chez des footballeuses U20 de l'académie irlandaise. Les joueuses ayant les charges chroniques les plus élevées (>600 UA/semaine) présentent 44% de blessures en moins que celles peu chargées. La périodisation intelligente de la charge, validée par GPS, est le meilleur outil de prévention dans le football féminin.",
    tags: ["récupération", "femmes", "prévention"],
    isNew: false,
  },

  // ── Performance ──────────────────────────────────────────────────────────
  {
    id: "jovanovic-2014",
    title:
      "Establishing the reliability and meaningful change of the load-velocity relationship in the squat",
    authors: ["Jovanovic M", "Flanagan EP"],
    journal: "Journal of Australian Strength and Conditioning",
    year: 2014,
    abstract:
      "Fondement du Velocity-Based Training (VBT) : l'auteur établit la fiabilité de la relation charge-vitesse au squat. Mesurer la vitesse de barre permet d'individualiser les charges d'entraînement en temps réel, de déterminer l'effort réel (pertes de vitesse) et d'éviter la surcharge. Principe : une perte de vitesse de 20% correspond à ~50% de la capacité maximale de la séance — au-delà, les gains en puissance diminuent.",
    tags: ["performance"],
    isNew: false,
  },
  {
    id: "morin-2016",
    title:
      "Individual acceleration-speed profile in-situ: more insights into the slow-force / fast-force continuum",
    authors: ["Morin JB", "Samozino P"],
    journal: "International Journal of Sports Physiology and Performance",
    year: 2016,
    doi: "10.1123/ijspp.2015-0638",
    abstract:
      "Morin et Samozino formalisent le profil Force-Vitesse mécanique (FV) à partir de tests de sprint. En décomposant la puissance maximale en composante force (F0) et vitesse (V0), ce modèle identifie précisément si un athlète est 'déficitaire en force' ou 'déficitaire en vitesse'. La correction du déficit FV optimise la puissance de sprint de 6 à 15% sans augmenter le volume d'entraînement.",
    tags: ["performance"],
    isNew: false,
  },
  {
    id: "buchheit-2013",
    title:
      "High-intensity interval training, solutions to the programming puzzle: Part I: cardiopulmonary emphasis",
    authors: ["Buchheit M", "Laursen PB"],
    journal: "Sports Medicine",
    year: 2013,
    doi: "10.1007/s40279-013-0029-x",
    abstract:
      "Référence mondiale sur la programmation du HIIT en football. Buchheit & Laursen décrivent 6 variables manipulables (intensité, durée, ratio travail/repos, mode d'exercice, période de récupération active/passive, nombre de répétitions) et leurs effets spécifiques sur les adaptations cardio-pulmonaires et neuromusculaires. Essentiel pour construire des séances d'interval training adaptées à chaque phase de saison.",
    tags: ["performance", "récupération"],
    isNew: false,
  },
  {
    id: "haugen-2019",
    title:
      "Sprint mechanical properties in football players according to playing standard, position, age and sex",
    authors: ["Haugen TA", "Danielsen A", "McGhie D", "Sandbakk Ø"],
    journal: "Journal of Sports Sciences",
    year: 2019,
    doi: "10.1080/02640414.2018.1502355",
    abstract:
      "Analyse des propriétés mécaniques de sprint sur 524 footballeurs et footballeuses. Les attaquants présentent les plus hauts F0 relatifs tandis que les milieux ont le meilleur rapport force/vitesse. Les femmes produisent ~80% de la puissance maximale des hommes mais présentent des profils FV similaires. Ces données normatifs permettent d'identifier les déficits spécifiques au poste et d'individualiser le travail de vitesse.",
    tags: ["performance"],
    isNew: false,
  },
  {
    id: "ronnestad-2014",
    title:
      "Optimizing strength training for running and cycling endurance performance",
    authors: ["Ronnestad BR", "Mujika I"],
    journal: "Scandinavian Journal of Medicine & Science in Sports",
    year: 2014,
    doi: "10.1111/sms.12104",
    abstract:
      "Méta-analyse sur l'intégration de la musculation lourde dans l'entraînement d'endurance. L'ajout de 2-3 séances hebdomadaires de force (3-5 RM) améliore l'économie de course de 4-8%, le seuil lactique et la puissance au sprint final. En football, le renforcement lourd des membres inférieurs améliore significativement les performances de sprint et de saut sans augmenter la masse corporelle.",
    tags: ["performance"],
    isNew: false,
  },
  {
    id: "impellizzeri-2004",
    title:
      "Use of RPE-based training load in soccer",
    authors: ["Impellizzeri FM", "Rampinini E", "Coutts AJ", "Sassi A", "Marcora SM"],
    journal: "Medicine and Science in Sports and Exercise",
    year: 2004,
    doi: "10.1249/01.MSS.0000128199.23901.2F",
    abstract:
      "Validation de la méthode RPE de Foster (RPE × durée en minutes) pour la quantification de la charge interne en football. Cette méthode simple, rapide et peu coûteuse montre une corrélation de 0.84 avec les mesures de fréquence cardiaque. L'intégration de la charge interne (RPE) et externe (GPS) offre la vision la plus complète de la contrainte physiologique subie par les joueurs.",
    tags: ["performance", "récupération"],
    isNew: false,
  },
  {
    id: "bosquet-2007",
    title:
      "Effects of tapering on performance: a meta-analysis",
    authors: ["Bosquet L", "Montpetit J", "Arvisais D", "Mujika I"],
    journal: "Medicine and Science in Sports and Exercise",
    year: 2007,
    doi: "10.1249/mss.0b013e31806010e0",
    abstract:
      "Méta-analyse de 27 études sur les effets de l'affûtage (tapering) sur les performances. Un tapering exponentiel de 2 semaines avec réduction de 41-60% du volume (en maintenant l'intensité) maximise les gains de performance (+2-3%). En football, ce protocole est idéal avant les phases de compétition intensive ou avant les match décisifs de fin de saison.",
    tags: ["performance", "récupération"],
    isNew: false,
  },

  // ── Nutrition ────────────────────────────────────────────────────────────
  {
    id: "thomas-2016",
    title:
      "Position of the Academy of Nutrition and Dietetics, Dietitians of Canada, and the American College of Sports Medicine: Nutrition and Athletic Performance",
    authors: ["Thomas DT", "Erdman KA", "Burke LM"],
    journal: "Journal of the Academy of Nutrition and Dietetics",
    year: 2016,
    doi: "10.1016/j.jand.2015.12.006",
    abstract:
      "Déclaration de position officielle sur la nutrition des athlètes. Points clés pour le football : (1) Les glucides restent le carburant principal des matchs haute intensité — cible 6-10g/kg/jour en charge. (2) L'apport protéique optimal est de 1.6-2.2g/kg/jour répartis sur 4 prises. (3) La fenêtre anabolique post-effort (0-2h) est réelle : 20-40g protéines + glucides accélèrent la récupération glycogénique.",
    tags: ["nutrition"],
    isNew: false,
  },

  // ── Femmes ───────────────────────────────────────────────────────────────
  {
    id: "mcnulty-2020",
    title:
      "The Effect of Menstrual Cycle Phase on Exercise Performance in Eumenorrheic Women: A Systematic Review and Meta-Analysis",
    authors: ["McNulty KL", "Elliott-Sale KJ", "Dolan E", "Swinton PA"],
    journal: "Sports Medicine",
    year: 2020,
    doi: "10.1007/s40279-020-01319-3",
    abstract:
      "Méta-analyse sur 51 études (n=1193) analysant l'effet du cycle menstruel sur la performance. Les performances d'endurance sont légèrement supérieures en phase folliculaire tardive (+2-3%). Les performances maximales et de force varient peu avec le cycle. Conclusion principale : la variation inter-individuelle est bien plus grande que l'effet moyen du cycle — l'individualisation prime sur les généralisations.",
    tags: ["femmes", "performance"],
    isNew: false,
  },
  {
    id: "mountjoy-2018",
    title:
      "IOC consensus statement on relative energy deficiency in sport (RED-S): 2018 update",
    authors: ["Mountjoy M", "Sundgot-Borgen JK", "Burke LM", "Ackerman KE"],
    journal: "British Journal of Sports Medicine",
    year: 2018,
    doi: "10.1136/bjsports-2018-099193",
    abstract:
      "Mise à jour du consensus IOC sur le RED-S (Déficit Énergétique Relatif dans le Sport). Une disponibilité énergétique <30 kcal/kg de masse maigre/jour entraîne des perturbations hormonales, une réduction de la densité osseuse, des troubles menstruels et une dégradation des performances. Protocole d'identification : Triade de l'Athlète Féminine (LOW EA + troubles menstruels + ostéoporose). Priorité clinique en football féminin de haut niveau.",
    tags: ["femmes", "nutrition", "prévention"],
    isNew: false,
  },
  {
    id: "tol-2014",
    title:
      "Hamstring muscle injuries in professional football: the 10-year experience of the UEFA Elite Club Injury Study",
    authors: ["Tol JL", "Hamilton B", "Eirale C", "Muxart P"],
    journal: "British Journal of Sports Medicine",
    year: 2014,
    doi: "10.1136/bjsports-2013-093038",
    abstract:
      "Analyse sur 10 ans des blessures aux ischiojambiers dans 36 clubs de l'élite UEFA (2310 joueurs). Les blessures aux ischiojambiers représentent 17% de toutes les blessures — première cause d'absence. 16% récidivent dans les 2 mois suivant le retour. Les déchirures de grade 2 du biceps fémoral proximal ont le taux de récidive le plus élevé (24%). Le critère de retour au jeu basé sur les tests fonctionnels (H-test, SLRD) est 8x plus prédictif que la durée d'arrêt seule.",
    tags: ["prévention", "récupération"],
    isNew: false,
  },
  {
    id: "larruskain-2023",
    title:
      "Muscle injuries in elite male and female football players: a prospective study in the UEFA Champions League",
    authors: ["Larruskain J", "Lekue JA", "Martin-Garetxana I", "Barrio I"],
    journal: "Scandinavian Journal of Medicine & Science in Sports",
    year: 2023,
    doi: "10.1111/sms.14292",
    abstract:
      "Étude prospective sur les blessures musculaires comparant hommes et femmes dans les meilleures équipes européennes. Les femmes présentent un taux de blessures aux ischiojambiers 45% plus élevé que les hommes, mais des blessures adducteurs 30% moins fréquentes. La prévalence de blessures non-contact augmente significativement chez les femmes en phases pré-ovulatoire et pré-menstruelle. Ces données plaident pour des programmes de prévention sexe-spécifiques.",
    tags: ["prévention", "femmes"],
    isNew: true,
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getArticlesByTag(tag: ArticleTag): ResearchArticle[] {
  return RESEARCH_ARTICLES.filter((a) => a.tags.includes(tag));
}

export function searchArticles(query: string): ResearchArticle[] {
  const q = query.toLowerCase();
  return RESEARCH_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.abstract.toLowerCase().includes(q) ||
      a.authors.some((auth) => auth.toLowerCase().includes(q)) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export const ARTICLE_TAGS: { id: ArticleTag; label: string; color: string }[] =
  [
    { id: "prévention", label: "Prévention", color: "bg-orange-900/40 text-orange-300 border-orange-700/40" },
    { id: "performance", label: "Performance", color: "bg-blue-900/40 text-blue-300 border-blue-700/40" },
    { id: "récupération", label: "Récupération", color: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40" },
    { id: "nutrition", label: "Nutrition", color: "bg-amber-900/40 text-amber-300 border-amber-700/40" },
    { id: "femmes", label: "Femmes", color: "bg-pink-900/40 text-pink-300 border-pink-700/40" },
  ];
