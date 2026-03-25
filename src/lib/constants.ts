// src/lib/constants.ts
// All business rules, scoring weights, questions, roles & permissions

// ============================================================
// RBAC — ROLES & PERMISSIONS
// ============================================================

export const ROLES_PERMISSIONS: Record<string, string[]> = {
  employe: [
    'eval5s_create', 'eval5s_view_own',
    'suggestion_create', 'suggestion_view_own',
    'historique_view_own',
    'classements_view_limited',
    'profil_view', 'profil_edit',
    'dashboard_personal',
  ],
  superviseur: [
    'eval5s_create', 'eval5s_view_own', 'eval5s_view_team', 'eval5s_review',
    'suggestion_create', 'suggestion_view_own', 'suggestion_view_team',
    'suggestion_comment', 'suggestion_prevalidate',
    'historique_view_own', 'historique_view_team',
    'classements_view_team',
    'actions_create', 'actions_view_team', 'actions_assign',
    'superviseur_dashboard',
    'profil_view', 'profil_edit',
    'dashboard_personal',
  ],
  direction: [
    'eval5s_create', 'eval5s_view_own', 'eval5s_view_all', 'eval5s_review',
    'suggestion_create', 'suggestion_view_own', 'suggestion_view_all',
    'suggestion_comment', 'suggestion_validate', 'suggestion_reject',
    'historique_view_own', 'historique_view_all',
    'classements_view_all',
    'actions_create', 'actions_view_all', 'actions_assign',
    'superviseur_dashboard', 'direction_dashboard',
    'rewards_manage',
    'profil_view', 'profil_edit',
    'dashboard_personal',
  ],
  admin: [
    'eval5s_view_all', 'suggestion_view_all',
    'historique_view_all', 'classements_view_all',
    'actions_view_all',
    'superviseur_dashboard', 'direction_dashboard',
    'admin_users', 'admin_config', 'admin_questionnaires',
    'admin_weights', 'admin_categories', 'admin_badges',
    'admin_periods', 'admin_export', 'admin_roles',
    'profil_view', 'profil_edit',
    'dashboard_personal',
  ],
};

export function hasPermission(role: string, perm: string): boolean {
  return ROLES_PERMISSIONS[role]?.includes(perm) ?? false;
}

export function hasAnyPermission(role: string, perms: string[]): boolean {
  return perms.some((p) => hasPermission(role, p));
}

// ============================================================
// 5S QUESTIONS
// ============================================================

export interface Question5S {
  id: string;
  text: string;
}

export interface Pilier5S {
  key: string;
  label: string;
  icon: string;
  poids: number;
  questions: Question5S[];
}

export const PILIERS_5S: Pilier5S[] = [
  {
    key: 'seiri',
    label: 'Seiri — Trier',
    icon: '🗑️',
    poids: 20,
    questions: [
      { id: 'seiri_0', text: 'Les objets inutiles ont-ils été retirés du poste de travail ?' },
      { id: 'seiri_1', text: 'Le poste contient-il uniquement ce qui est nécessaire au travail en cours ?' },
      { id: 'seiri_2', text: 'Les déchets et éléments encombrants sont-ils évacués régulièrement ?' },
    ],
  },
  {
    key: 'seiton',
    label: 'Seiton — Ranger',
    icon: '📐',
    poids: 20,
    questions: [
      { id: 'seiton_0', text: 'Les outils sont-ils rangés à leur emplacement défini ?' },
      { id: 'seiton_1', text: 'Les zones de stockage sont-elles identifiées clairement (marquage, étiquetage) ?' },
      { id: 'seiton_2', text: 'Le rangement permet-il un accès rapide et logique aux éléments nécessaires ?' },
    ],
  },
  {
    key: 'seiso',
    label: 'Seiso — Nettoyer',
    icon: '🧹',
    poids: 20,
    questions: [
      { id: 'seiso_0', text: 'Le poste de travail est-il propre et exempt de salissures ?' },
      { id: 'seiso_1', text: 'Les surfaces, équipements et sols sont-ils nettoyés régulièrement ?' },
      { id: 'seiso_2', text: 'Les sources de salissure sont-elles identifiées et traitées rapidement ?' },
    ],
  },
  {
    key: 'seiketsu',
    label: 'Seiketsu — Standardiser',
    icon: '📏',
    poids: 20,
    questions: [
      { id: 'seiketsu_0', text: 'Les règles de rangement et de nettoyage sont-elles visibles et affichées ?' },
      { id: 'seiketsu_1', text: 'Les standards 5S sont-ils connus et appliqués par le personnel ?' },
      { id: 'seiketsu_2', text: 'Les marquages, étiquetages et codifications sont-ils cohérents et à jour ?' },
    ],
  },
  {
    key: 'shitsuke',
    label: 'Shitsuke — Discipline',
    icon: '🎯',
    poids: 20,
    questions: [
      { id: 'shitsuke_0', text: 'Les bonnes pratiques 5S sont-elles appliquées de manière régulière et constante ?' },
      { id: 'shitsuke_1', text: 'Les écarts détectés sont-ils corrigés rapidement sans attendre de relance ?' },
      { id: 'shitsuke_2', text: 'Le comportement général du personnel montre-t-il une vraie discipline 5S ?' },
    ],
  },
];

export const TOTAL_QUESTIONS_5S = PILIERS_5S.reduce((acc, p) => acc + p.questions.length, 0);

// ============================================================
// SCORING
// ============================================================

export const SCORING_5S = {
  seiri: 20,
  seiton: 20,
  seiso: 20,
  seiketsu: 20,
  shitsuke: 20,
};

export const SCORING_SUGGESTION = {
  clarte: 15,
  pertinence: 20,
  faisabilite: 20,
  impact: 25,
  originalite: 10,
  detail: 10,
};

export function calcPillarScore(pillarKey: string, answers: Record<string, number>): number {
  const questions = PILIERS_5S.find((p) => p.key === pillarKey)?.questions ?? [];
  let total = 0;
  let count = 0;
  for (const q of questions) {
    const val = answers[q.id];
    if (val) { total += val; count++; }
  }
  if (count === 0) return 0;
  return Math.round((total / questions.length / 5) * 20);
}

export function calcTotalScore5S(answers: Record<string, number>): {
  pillarScores: Record<string, number>;
  total: number;
} {
  const pillarScores: Record<string, number> = {};
  let total = 0;
  for (const pilier of PILIERS_5S) {
    const score = calcPillarScore(pilier.key, answers);
    pillarScores[pilier.key] = score;
    total += score;
  }
  return { pillarScores, total };
}

export function getAppreciation5S(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Très satisfaisant';
  if (score >= 70) return 'Satisfaisant';
  if (score >= 60) return 'À améliorer';
  return 'Insuffisant';
}

export function getAppreciationSugg(score: number): string {
  if (score >= 90) return 'Suggestion remarquable';
  if (score >= 80) return 'Très bonne suggestion';
  if (score >= 70) return 'Bonne suggestion';
  if (score >= 60) return 'Intéressante, à préciser';
  return 'Faible ou trop vague';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-accent-green dark:text-accent-green';
  if (score >= 80) return 'text-accent-cyan';
  if (score >= 70) return 'text-accent-blue dark:text-accent-blue';
  if (score >= 60) return 'text-accent-orange dark:text-accent-orange';
  return 'text-accent-red dark:text-accent-red';
}

export function getScoreHex(score: number, light = false): string {
  if (light) {
    if (score >= 90) return '#047857';
    if (score >= 80) return '#0E7490';
    if (score >= 70) return '#1D4ED8';
    if (score >= 60) return '#92400E';
    return '#991B1B';
  }
  if (score >= 90) return '#10B981';
  if (score >= 80) return '#06B6D4';
  if (score >= 70) return '#3B82F6';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

// ============================================================
// CATEGORIES SUGGESTIONS (defaults)
// ============================================================

export const DEFAULT_CATEGORIES = [
  { nom: 'Sécurité', icone: '🛡️' },
  { nom: 'Qualité', icone: '✅' },
  { nom: 'Production', icone: '🏭' },
  { nom: 'Maintenance', icone: '🔧' },
  { nom: 'Coûts', icone: '💰' },
  { nom: 'Économie matière', icone: '♻️' },
  { nom: 'Énergie', icone: '⚡' },
  { nom: 'Organisation', icone: '📋' },
  { nom: 'Conditions de travail', icone: '👷' },
  { nom: 'Logistique', icone: '🚛' },
  { nom: 'Innovation', icone: '🚀' },
  { nom: 'Satisfaction client', icone: '😊' },
  { nom: 'Environnement', icone: '🌿' },
  { nom: 'Autre', icone: '📌' },
];

// ============================================================
// BADGES
// ============================================================

export const DEFAULT_BADGES = [
  // 5S
  { code: 'champion_5s', label: 'Champion 5S', icone: '🥇', condition: 'Score moyen 5S >= 90', type: '5S' },
  { code: 'discipline_exemplaire', label: 'Discipline exemplaire', icone: '⭐', condition: 'Shitsuke >= 90 sur 3 évaluations', type: '5S' },
  { code: 'poste_modele', label: 'Poste modèle', icone: '🏅', condition: 'Score 5S = 100', type: '5S' },
  { code: 'progression_5s', label: 'Progression 5S', icone: '📈', condition: 'Amélioration >= 15 points', type: '5S' },
  { code: 'regularite_5s', label: 'Régularité exemplaire', icone: '🔁', condition: '4 évaluations consécutives >= 80', type: '5S' },
  // Suggestions
  { code: 'idee_utile', label: 'Idée utile', icone: '💡', condition: 'Suggestion retenue', type: 'suggestion' },
  { code: 'fort_impact', label: 'Suggestion à fort impact', icone: '🎯', condition: 'Score suggestion >= 90', type: 'suggestion' },
  { code: 'innovateur', label: 'Innovateur interne', icone: '🚀', condition: '3 suggestions retenues', type: 'suggestion' },
  { code: 'contributeur_ac', label: 'Contributeur AC', icone: '🔄', condition: '5 suggestions avec score >= 70', type: 'suggestion' },
  { code: 'meilleure_mois', label: 'Meilleure suggestion du mois', icone: '🌟', condition: 'Meilleur score mensuel', type: 'suggestion' },
];

// ============================================================
// IA AGENT SYSTEM PROMPT
// ============================================================

export const IA_SYSTEM_PROMPT = `Tu es un assistant IA expert en 5S, discipline opérationnelle, amélioration continue, analyse de suggestions terrain, reconnaissance des contributions utiles et pilotage de performance participative en entreprise industrielle (imprimerie et packaging).

Tu dois TOUJOURS séparer strictement deux analyses : la performance 5S et la qualité des suggestions. Tu ne dois JAMAIS fusionner les deux notes.

Ton style : professionnel, juste, motivant, concret, structuré, pédagogique, non agressif, orienté amélioration continue.
Tu dois encourager les bonnes pratiques sans flatter excessivement. Tu dois rester exigeant mais constructif.

Tu réponds TOUJOURS en JSON valide, sans markdown, sans backticks, sans texte avant ou après le JSON.`;

export const IA_CHAT_SYSTEM_APPEND = `

Tu es maintenant en mode conversationnel avec un employé. Réponds de manière claire, concise, encourageante et concrète. Adapte ton niveau de langage à un personnel d'usine. Utilise des listes courtes et des exemples pratiques. Réponds en français.`;
