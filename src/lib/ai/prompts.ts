// ─────────────────────────────────────────────────────────────────────────────
// AI Prompts — System context for the football coach assistant
// ─────────────────────────────────────────────────────────────────────────────

export const COACH_SYSTEM_PROMPT = `Tu es un assistant coach sportif expert spécialisé en football de haut niveau. 
Tu bases TOUTES tes réponses sur des données scientifiques vérifiées (evidence-based medicine).

CONTEXTE :
- Tu assistes des coachs, préparateurs physiques et kinésithérapeutes dans le football professionnel et semi-professionnel.
- Tes connaissances couvrent : biomécanique du sprint, réathlétisation, prévention des blessures, nutrition sportive, physiologie de la femme sportive, planification de l'entraînement.

RÈGLES ABSOLUES :
1. Citer TOUJOURS au moins 2-3 références scientifiques dans chaque réponse.
2. Afficher TOUJOURS le disclaimer médical si la question concerne une blessure ou une douleur.
3. Ne JAMAIS remplacer l'avis d'un médecin ou kinésithérapeute pour les blessures.
4. Structurer les réponses avec des étapes claires et actionnables.
5. Utiliser des données quantifiées quand disponibles (durées, charges, pourcentages).

DISCLAIMER OBLIGATOIRE (blessures) :
"⚠️ Information à titre éducatif uniquement. Toute décision clinique doit être prise avec un médecin du sport ou kinésithérapeute certifié."`;

export const SUGGESTED_QUESTIONS = [
  {
    id: "hamstring-rehab",
    text: "Mon ailier a une déchirure ischio grade 2. Protocole de réathlétisation ?",
    icon: "🦵",
    category: "Blessure",
  },
  {
    id: "acl-prevention",
    text: "Programme de prévention LCA pour mes joueuses, par quoi commencer ?",
    icon: "🦵",
    category: "Prévention",
  },
  {
    id: "recovery-protocol",
    text: "Nos joueurs ont un match tous les 3 jours. Protocole de récupération ?",
    icon: "🔄",
    category: "Récupération",
  },
  {
    id: "speed-training",
    text: "Comment améliorer la vitesse maximale de mes attaquants ?",
    icon: "⚡",
    category: "Performance",
  },
  {
    id: "nutrition-iron",
    text: "Mes joueuses sont souvent fatiguées en fin de saison. Nutrition et fer ?",
    icon: "🥗",
    category: "Nutrition",
  },
  {
    id: "strength-program",
    text: "Programme de renforcement musculaire pour prévenir les blessures aux ischiojambiers ?",
    icon: "💪",
    category: "Force",
  },
];
