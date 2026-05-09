export type UserRole = "admin" | "head_coach" | "coach" | "physio" | "athlete";

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  description: string;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    description: "Vue d'ensemble",
    roles: ["admin", "head_coach", "coach", "physio", "athlete"],
  },
  {
    title: "Effectif",
    href: "/roster",
    icon: "Users",
    description: "Gestion des joueurs",
    roles: ["admin", "head_coach", "coach", "physio"],
  },
  {
    title: "Wellness",
    href: "/wellness",
    icon: "HeartPulse",
    description: "Saisie quotidienne",
    roles: ["admin", "head_coach", "coach", "physio"],
  },
  {
    title: "Séances",
    href: "/sessions",
    icon: "Dumbbell",
    description: "Gestion des entraînements",
    roles: ["admin", "head_coach", "coach"],
  },
  {
    title: "Anatomie 3D",
    href: "/anatomy",
    icon: "Bone",
    description: "Modèle anatomique interactif",
    roles: ["admin", "head_coach", "coach", "physio"],
  },
  {
    title: "Planification",
    href: "/planning",
    icon: "Calendar",
    description: "Matrice de périodisation",
    roles: ["admin", "head_coach", "coach"],
  },
  {
    title: "Pré-Saison",
    href: "/preseason",
    icon: "Zap",
    description: "Master pré-saison",
    roles: ["admin", "head_coach", "coach"],
  },
  {
    title: "Elite Féminine",
    href: "/female",
    icon: "Heart",
    description: "Module spécifique féminin",
    roles: ["admin", "head_coach", "coach", "physio"],
  },
  {
    title: "Prévention",
    href: "/prevention",
    icon: "Shield",
    description: "Bouclier de prévention",
    roles: ["admin", "head_coach", "coach", "physio"],
  },
  {
    title: "Laboratoire",
    href: "/lab",
    icon: "FlaskConical",
    description: "Force-Vitesse & exercices",
    roles: ["admin", "head_coach", "coach"],
  },
  {
    title: "Science & IA",
    href: "/ai",
    icon: "Brain",
    description: "Assistant coach IA",
    roles: ["admin", "head_coach", "coach", "physio"],
  },
];
