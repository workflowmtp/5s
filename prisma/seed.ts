// prisma/seed.ts
// 5S Excellence — Complete demo data seed
import { PrismaClient, Role, EvalStatus, SuggestionStatus, ActionStatus, Priority, Urgency, Impact, Feasibility, IASource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================================
  // 1. SERVICES
  // ============================================================
  const serviceNames = [
    'Offset Étiquette', 'Offset Carton', 'Héliogravure Flexible',
    'Bouchon Couronne', 'Maintenance', 'Qualité',
    'Magasin / Logistique', 'Administration', 'Commercial', 'Direction Générale',
  ];

  const services: Record<string, any> = {};
  for (let i = 0; i < serviceNames.length; i++) {
    services[serviceNames[i]] = await prisma.service.upsert({
      where: { nom: serviceNames[i] },
      update: {},
      create: { nom: serviceNames[i], ordre: i },
    });
  }
  console.log(`  ✅ ${serviceNames.length} services`);

  // ============================================================
  // 2. ATELIERS / ZONES
  // ============================================================
  const atelierNames = [
    'Atelier Impression Étiquette', 'Atelier Découpe Étiquette',
    'Atelier Impression Carton', 'Atelier Façonnage Carton',
    'Atelier Hélio Impression', 'Atelier Hélio Complexage',
    'Atelier Bouchon Moulage', 'Atelier Bouchon Assemblage',
    'Magasin MP', 'Magasin PF',
    'Bureau Qualité', 'Bureau Maintenance',
    'Bureau Commercial', 'Bureau Administration', 'Direction',
  ];

  const ateliers: Record<string, any> = {};
  for (let i = 0; i < atelierNames.length; i++) {
    ateliers[atelierNames[i]] = await prisma.atelier.upsert({
      where: { nom: atelierNames[i] },
      update: {},
      create: { nom: atelierNames[i], ordre: i },
    });
  }
  console.log(`  ✅ ${atelierNames.length} ateliers`);

  // ============================================================
  // 3. CATEGORIES SUGGESTIONS
  // ============================================================
  const categories = [
    { nom: 'Sécurité', icone: '🛡️' }, { nom: 'Qualité', icone: '✅' },
    { nom: 'Production', icone: '🏭' }, { nom: 'Maintenance', icone: '🔧' },
    { nom: 'Coûts', icone: '💰' }, { nom: 'Économie matière', icone: '♻️' },
    { nom: 'Énergie', icone: '⚡' }, { nom: 'Organisation', icone: '📋' },
    { nom: 'Conditions de travail', icone: '👷' }, { nom: 'Logistique', icone: '🚛' },
    { nom: 'Innovation', icone: '🚀' }, { nom: 'Satisfaction client', icone: '😊' },
    { nom: 'Environnement', icone: '🌿' }, { nom: 'Autre', icone: '📌' },
  ];

  const cats: Record<string, any> = {};
  for (let i = 0; i < categories.length; i++) {
    cats[categories[i].nom] = await prisma.categorie.upsert({
      where: { nom: categories[i].nom },
      update: {},
      create: { ...categories[i], ordre: i },
    });
  }
  console.log(`  ✅ ${categories.length} catégories`);

  // ============================================================
  // 4. BADGES
  // ============================================================
  const badges = [
    { code: 'champion_5s', label: 'Champion 5S', icone: '🥇', condition: 'Score moyen 5S >= 90', type: '5S' },
    { code: 'discipline_exemplaire', label: 'Discipline exemplaire', icone: '⭐', condition: 'Shitsuke >= 90 sur 3 évaluations', type: '5S' },
    { code: 'poste_modele', label: 'Poste modèle', icone: '🏅', condition: 'Score 5S = 100', type: '5S' },
    { code: 'progression_5s', label: 'Progression 5S', icone: '📈', condition: 'Amélioration >= 15 points', type: '5S' },
    { code: 'regularite_5s', label: 'Régularité exemplaire', icone: '🔁', condition: '4 évals consécutives >= 80', type: '5S' },
    { code: 'idee_utile', label: 'Idée utile', icone: '💡', condition: 'Suggestion retenue', type: 'suggestion' },
    { code: 'fort_impact', label: 'Suggestion à fort impact', icone: '🎯', condition: 'Score suggestion >= 90', type: 'suggestion' },
    { code: 'innovateur', label: 'Innovateur interne', icone: '🚀', condition: '3 suggestions retenues', type: 'suggestion' },
    { code: 'contributeur_ac', label: 'Contributeur AC', icone: '🔄', condition: '5 suggestions score >= 70', type: 'suggestion' },
    { code: 'meilleure_mois', label: 'Meilleure suggestion du mois', icone: '🌟', condition: 'Meilleur score mensuel', type: 'suggestion' },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
  }
  console.log(`  ✅ ${badges.length} badges`);

  // ============================================================
  // 5. CONFIG
  // ============================================================
  const configs = [
    { cle: 'scoring_5s', valeur: { seiri: 20, seiton: 20, seiso: 20, seiketsu: 20, shitsuke: 20 } },
    { cle: 'scoring_suggestion', valeur: { clarte: 15, pertinence: 20, faisabilite: 20, impact: 25, originalite: 10, detail: 10 } },
    { cle: 'seuils', valeur: { critique: 40, alerte: 60, bon: 80, excellent: 90 } },
    { cle: 'periode_active', valeur: { debut: '2026-01-01', fin: '2026-12-31', label: 'Année 2026' } },
    { cle: 'ia', valeur: { model: 'claude-sonnet-4-20250514', actif: true } },
  ];

  for (const c of configs) {
    await prisma.config.upsert({
      where: { cle: c.cle },
      update: { valeur: c.valeur },
      create: c,
    });
  }
  console.log(`  ✅ ${configs.length} configs`);

  // ============================================================
  // 6. USERS
  // ============================================================
  const hashedDemo = await bcrypt.hash('demo', 10);
  const hashedAdmin = await bcrypt.hash('admin', 10);

  const seedUsers = [
    { matricule: 'EMP001', nom: 'Nguyen', prenom: 'Paul', role: Role.employe, service: 'Offset Étiquette', atelier: 'Atelier Impression Étiquette', fonction: 'Opérateur', tel: '690001001', pwd: hashedDemo },
    { matricule: 'EMP002', nom: 'Kamga', prenom: 'Marie', role: Role.employe, service: 'Héliogravure Flexible', atelier: 'Atelier Hélio Impression', fonction: 'Opératrice', tel: '690002002', pwd: hashedDemo },
    { matricule: 'EMP003', nom: 'Fotso', prenom: 'Jean', role: Role.employe, service: 'Bouchon Couronne', atelier: 'Atelier Bouchon Moulage', fonction: 'Agent de production', tel: '690003003', pwd: hashedDemo },
    { matricule: 'EMP004', nom: 'Tamba', prenom: 'Aline', role: Role.employe, service: 'Qualité', atelier: 'Bureau Qualité', fonction: 'Agent qualité', tel: '690004004', pwd: hashedDemo },
    { matricule: 'EMP005', nom: 'Mbarga', prenom: 'Eric', role: Role.employe, service: 'Maintenance', atelier: 'Bureau Maintenance', fonction: 'Agent maintenance', tel: '690005005', pwd: hashedDemo },
    { matricule: 'SUP001', nom: 'Nkoulou', prenom: 'David', role: Role.superviseur, service: 'Offset Étiquette', atelier: 'Atelier Impression Étiquette', fonction: "Chef d'équipe", tel: '690010010', pwd: hashedDemo },
    { matricule: 'SUP002', nom: 'Essomba', prenom: 'Chantal', role: Role.superviseur, service: 'Héliogravure Flexible', atelier: 'Atelier Hélio Impression', fonction: 'Superviseur', tel: '690010020', pwd: hashedDemo },
    { matricule: 'DIR001', nom: 'Tchoumi', prenom: 'Roger', role: Role.direction, service: 'Direction Générale', atelier: 'Direction', fonction: "Directeur d'usine", tel: '690020010', pwd: hashedDemo },
    { matricule: 'DIR002', nom: 'Belinga', prenom: 'Sylvie', role: Role.direction, service: 'Direction Générale', atelier: 'Direction', fonction: 'Responsable Qualité', tel: '690020020', pwd: hashedDemo },
    { matricule: 'ADM001', nom: 'Admin', prenom: 'Système', role: Role.admin, service: 'Administration', atelier: 'Bureau Administration', fonction: 'Administrateur', tel: '690099099', pwd: hashedAdmin },
  ];

  const users: Record<string, any> = {};
  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { matricule: u.matricule },
      update: {},
      create: {
        matricule: u.matricule,
        nom: u.nom,
        prenom: u.prenom,
        password: u.pwd,
        role: u.role,
        serviceId: services[u.service].id,
        atelierId: ateliers[u.atelier].id,
        fonction: u.fonction,
        telephone: u.tel,
      },
    });
    users[u.matricule] = user;
  }
  console.log(`  ✅ ${seedUsers.length} utilisateurs`);

  // ============================================================
  // 7. EVALUATIONS 5S
  // ============================================================
  const demoEvals = [
    { mat: 'EMP001', date: '2026-01-15', svc: 'Offset Étiquette', zone: 'Atelier Impression Étiquette', scores: [12,14,13,12,14], comment: 'Premier audit du poste.' },
    { mat: 'EMP001', date: '2026-02-10', svc: 'Offset Étiquette', zone: 'Atelier Impression Étiquette', scores: [15,16,14,14,16], comment: 'Nette amélioration du rangement.' },
    { mat: 'EMP001', date: '2026-02-28', svc: 'Offset Étiquette', zone: 'Atelier Impression Étiquette', scores: [16,17,16,15,17], comment: 'Bon maintien des progrès.' },
    { mat: 'EMP001', date: '2026-03-14', svc: 'Offset Étiquette', zone: 'Atelier Impression Étiquette', scores: [17,18,17,17,19], comment: 'Excellent progrès. Discipline exemplaire.' },
    { mat: 'EMP002', date: '2026-01-20', svc: 'Héliogravure Flexible', zone: 'Atelier Hélio Impression', scores: [17,16,17,16,16], comment: 'Poste bien tenu.' },
    { mat: 'EMP002', date: '2026-02-18', svc: 'Héliogravure Flexible', zone: 'Atelier Hélio Impression', scores: [18,17,18,17,17], comment: 'Amélioration continue.' },
    { mat: 'EMP002', date: '2026-03-10', svc: 'Héliogravure Flexible', zone: 'Atelier Hélio Impression', scores: [18,18,18,18,18], comment: 'Niveau exemplaire.' },
    { mat: 'EMP003', date: '2026-01-25', svc: 'Bouchon Couronne', zone: 'Atelier Bouchon Moulage', scores: [11,12,10,11,11], comment: 'Poste encombré.' },
    { mat: 'EMP003', date: '2026-02-22', svc: 'Bouchon Couronne', zone: 'Atelier Bouchon Moulage', scores: [12,13,12,12,13], comment: 'Légère amélioration.' },
    { mat: 'EMP003', date: '2026-03-12', svc: 'Bouchon Couronne', zone: 'Atelier Bouchon Moulage', scores: [14,14,13,13,14], comment: 'Progrès réguliers.' },
    { mat: 'EMP004', date: '2026-01-18', svc: 'Qualité', zone: 'Bureau Qualité', scores: [17,17,18,16,17], comment: 'Bureau bien organisé.' },
    { mat: 'EMP004', date: '2026-02-15', svc: 'Qualité', zone: 'Bureau Qualité', scores: [18,18,19,18,18], comment: 'Très bon maintien.' },
    { mat: 'EMP004', date: '2026-03-15', svc: 'Qualité', zone: 'Bureau Qualité', scores: [19,19,19,19,19], comment: 'Niveau quasi parfait.' },
    { mat: 'EMP005', date: '2026-02-05', svc: 'Maintenance', zone: 'Bureau Maintenance', scores: [9,8,9,8,8], comment: 'Atelier très encombré.' },
    { mat: 'EMP005', date: '2026-03-08', svc: 'Maintenance', zone: 'Bureau Maintenance', scores: [10,11,10,10,11], comment: 'Efforts visibles mais insuffisants.' },
    { mat: 'SUP001', date: '2026-01-22', svc: 'Offset Étiquette', zone: 'Atelier Impression Étiquette', scores: [15,16,15,14,15], comment: 'Zone équipe bien tenue.' },
    { mat: 'SUP001', date: '2026-02-20', svc: 'Offset Étiquette', zone: 'Atelier Découpe Étiquette', scores: [16,16,16,15,16], comment: 'Bonne organisation.' },
    { mat: 'SUP001', date: '2026-03-16', svc: 'Offset Étiquette', zone: 'Atelier Impression Étiquette', scores: [17,17,16,16,16], comment: 'Progression stable.' },
    { mat: 'SUP002', date: '2026-02-12', svc: 'Héliogravure Flexible', zone: 'Atelier Hélio Complexage', scores: [17,17,16,17,17], comment: 'Zone bien supervisée.' },
    { mat: 'SUP002', date: '2026-03-11', svc: 'Héliogravure Flexible', zone: 'Atelier Hélio Impression', scores: [18,17,17,18,17], comment: 'Maintien du niveau.' },
  ];

  function getApprec(total: number) {
    if (total >= 90) return 'Excellent';
    if (total >= 80) return 'Très satisfaisant';
    if (total >= 70) return 'Satisfaisant';
    if (total >= 60) return 'À améliorer';
    return 'Insuffisant';
  }

  for (const de of demoEvals) {
    const total = de.scores.reduce((a, b) => a + b, 0);
    await prisma.evaluation.create({
      data: {
        userId: users[de.mat].id,
        date: new Date(de.date),
        serviceId: services[de.svc].id,
        zoneId: ateliers[de.zone].id,
        commentaireGeneral: de.comment,
        scoreSeiri: de.scores[0],
        scoreSeiton: de.scores[1],
        scoreSeiso: de.scores[2],
        scoreSeiketsu: de.scores[3],
        scoreShitsuke: de.scores[4],
        scoreTotal: total,
        appreciation: getApprec(total),
        commentaireIA: total >= 80
          ? 'Très bonne évaluation. Le poste présente un bon niveau de conformité 5S.'
          : total >= 60
            ? 'Évaluation en dessous des attentes. Des améliorations sont nécessaires.'
            : 'Évaluation insuffisante. Action corrective recommandée.',
        forces: total >= 80
          ? ['Bon niveau de discipline.', 'Standards respectés.']
          : ['Volonté d\'amélioration.'],
        faiblesses: total >= 80
          ? ['Maintenir la constance.']
          : ['Propreté insuffisante.', 'Standards non visibles.'],
        actionsRecommandees: total >= 80
          ? ['Partager les bonnes pratiques.']
          : ['Mettre en place un planning de nettoyage.', 'Afficher les standards visuels.'],
        syntheseManageriale: total >= 80
          ? 'Collaborateur engagé avec de bons résultats 5S.'
          : 'Accompagnement ciblé nécessaire.',
        niveauPriorite: total >= 80 ? Priority.basse : total >= 60 ? Priority.moyenne : Priority.haute,
        iaSource: IASource.local,
        reponses: {},
        statut: EvalStatus.analysee,
      },
    });
  }
  console.log(`  ✅ ${demoEvals.length} évaluations 5S`);

  // ============================================================
  // 8. SUGGESTIONS
  // ============================================================
  const demoSuggs = [
    { mat: 'EMP001', date: '2026-01-20', titre: 'Installer des bacs de tri sélectif', cat: 'Environnement', svc: 'Offset Étiquette', score: 82, statut: SuggestionStatus.retenue, urgence: Urgency.moyenne, impact: Impact.fort, faisab: Feasibility.facile, prob: 'Les déchets sont mélangés dans une seule poubelle.', sugg: 'Installer 3 bacs de tri identifiés par couleur.', benef: 'Réduction des coûts de traitement.' },
    { mat: 'EMP001', date: '2026-02-15', titre: 'Créer un tableau de suivi visuel des OF', cat: 'Production', svc: 'Offset Étiquette', score: 91, statut: SuggestionStatus.mise_en_oeuvre, urgence: Urgency.haute, impact: Impact.fort, faisab: Feasibility.facile, prob: 'Pas de visibilité sur l\'état des OF.', sugg: 'Mettre en place un tableau blanc magnétique avec étiquettes colorées.', benef: 'Meilleure visibilité et autonomie des opérateurs.' },
    { mat: 'EMP002', date: '2026-01-28', titre: 'Réduire le temps de changement de série', cat: 'Production', svc: 'Héliogravure Flexible', score: 88, statut: SuggestionStatus.planifiee, urgence: Urgency.haute, impact: Impact.tres_fort, faisab: Feasibility.moderee, prob: 'Le changement prend 45 minutes en moyenne.', sugg: 'Appliquer la méthode SMED avec chariot dédié.', benef: 'Réduction à 25 minutes. Gain de productivité.' },
    { mat: 'EMP002', date: '2026-03-05', titre: 'Système de consignation des bobines', cat: 'Économie matière', svc: 'Héliogravure Flexible', score: 85, statut: SuggestionStatus.retenue, urgence: Urgency.moyenne, impact: Impact.fort, faisab: Feasibility.facile, prob: 'Bobines partiellement utilisées non identifiées.', sugg: 'Étiqueter chaque bobine entamée avec métrage restant.', benef: 'Économie matière 5-8% sur les bobines film.' },
    { mat: 'EMP003', date: '2026-02-10', titre: 'Améliorer l\'éclairage zone bouchon', cat: 'Conditions de travail', svc: 'Bouchon Couronne', score: 72, statut: SuggestionStatus.soumise, urgence: Urgency.haute, impact: Impact.moyen, faisab: Feasibility.facile, prob: 'Éclairage faible dans la zone de contrôle visuel.', sugg: 'Installer des néons LED supplémentaires.', benef: 'Meilleure détection des défauts.' },
    { mat: 'EMP004', date: '2026-01-30', titre: 'Digitaliser les fiches de contrôle qualité', cat: 'Qualité', svc: 'Qualité', score: 78, statut: SuggestionStatus.en_revue, urgence: Urgency.moyenne, impact: Impact.tres_fort, faisab: Feasibility.complexe, prob: 'Fiches de contrôle encore sur papier.', sugg: 'Formulaire digital sur tablette avec alertes automatiques.', benef: 'Traçabilité complète. Alertes immédiates.' },
    { mat: 'EMP004', date: '2026-03-01', titre: 'Référentiel photo des défauts types', cat: 'Qualité', svc: 'Qualité', score: 86, statut: SuggestionStatus.retenue, urgence: Urgency.moyenne, impact: Impact.fort, faisab: Feasibility.moderee, prob: 'Critères visuels de défaut non standardisés.', sugg: 'Catalogue photo des défauts par famille de produits.', benef: 'Standardisation du contrôle qualité.' },
    { mat: 'EMP005', date: '2026-02-20', titre: 'Planning maintenance préventive affiché', cat: 'Maintenance', svc: 'Maintenance', score: 74, statut: SuggestionStatus.soumise, urgence: Urgency.moyenne, impact: Impact.moyen, faisab: Feasibility.facile, prob: 'Planning non visible par les opérateurs.', sugg: 'Afficher un planning mensuel à côté de chaque machine.', benef: 'Meilleure anticipation.' },
    { mat: 'SUP001', date: '2026-02-25', titre: 'Réunion quotidienne 5 minutes', cat: 'Organisation', svc: 'Offset Étiquette', score: 89, statut: SuggestionStatus.mise_en_oeuvre, urgence: Urgency.moyenne, impact: Impact.fort, faisab: Feasibility.facile, prob: 'Informations transmises de manière informelle.', sugg: 'Réunion debout de 5 min avec tableau d\'animation.', benef: 'Alignement de l\'équipe. Communication structurée.' },
    { mat: 'EMP003', date: '2026-03-10', titre: 'Protections anti-bruit machines moulage', cat: 'Sécurité', svc: 'Bouchon Couronne', score: 68, statut: SuggestionStatus.a_preciser, urgence: Urgency.haute, impact: Impact.fort, faisab: Feasibility.complexe, prob: 'Niveau sonore dépasse 85 dB.', sugg: 'Capots insonorisants et panneaux absorbants.', benef: 'Réduction du bruit de 10-15 dB.' },
    { mat: 'SUP002', date: '2026-03-08', titre: 'Automatiser relevé compteurs production', cat: 'Innovation', svc: 'Héliogravure Flexible', score: 76, statut: SuggestionStatus.soumise, urgence: Urgency.faible, impact: Impact.tres_fort, faisab: Feasibility.difficile, prob: 'Compteurs relevés manuellement 3 fois/jour.', sugg: 'Capteurs IoT avec transmission automatique.', benef: 'Données en temps réel.' },
  ];

  function getApprecSugg(score: number) {
    if (score >= 90) return 'Suggestion remarquable';
    if (score >= 80) return 'Très bonne suggestion';
    if (score >= 70) return 'Bonne suggestion';
    if (score >= 60) return 'Intéressante, à préciser';
    return 'Faible ou trop vague';
  }

  for (const ds of demoSuggs) {
    const isRetained = ds.statut === SuggestionStatus.retenue || ds.statut === SuggestionStatus.mise_en_oeuvre || ds.statut === SuggestionStatus.planifiee;
    await prisma.suggestion.create({
      data: {
        userId: users[ds.mat].id,
        date: new Date(ds.date),
        titre: ds.titre,
        categorieId: cats[ds.cat].id,
        serviceConcerneId: services[ds.svc].id,
        lieu: '',
        probleme: ds.prob,
        suggestion: ds.sugg,
        benefices: ds.benef,
        urgence: ds.urgence,
        impactEstime: ds.impact,
        faisabiliteEstimee: ds.faisab,
        scoreClarte: Math.round(ds.score * 0.15),
        scorePertinence: Math.round(ds.score * 0.20),
        scoreFaisabilite: Math.round(ds.score * 0.18),
        scoreImpact: Math.round(ds.score * 0.25),
        scoreOriginalite: Math.round(ds.score * 0.10),
        scoreDetail: Math.round(ds.score * 0.10),
        scoreTotal: ds.score,
        appreciation: getApprecSugg(ds.score),
        commentaireIA: ds.score >= 85
          ? 'Suggestion de qualité à traiter en priorité.'
          : 'Suggestion intéressante méritant une étude complémentaire.',
        forces: ['Problème clairement identifié.', 'Solution concrète.'],
        limites: ds.score < 80 ? ['Coût à affiner.'] : ['Surveiller le ROI.'],
        actionsRecommandees: ['Soumettre au superviseur.', 'Chiffrer le coût.'],
        syntheseManageriale: ds.score >= 85
          ? 'Suggestion de qualité à traiter en priorité.'
          : 'Étude complémentaire recommandée.',
        niveauPriorite: ds.urgence === Urgency.haute ? Priority.haute : Priority.moyenne,
        iaSource: IASource.local,
        statut: ds.statut,
        avisSuperviseur: isRetained ? 'recommandee' : null,
        commentaireSuperviseur: isRetained ? 'Bonne idée. Faisable sur le terrain.' : null,
        decisionDirection: isRetained ? 'retenue' : null,
        commentaireDirection: isRetained ? 'Approuvé.' : null,
      },
    });
  }
  console.log(`  ✅ ${demoSuggs.length} suggestions`);

  // ============================================================
  // 9. ACTIONS CORRECTIVES
  // ============================================================
  const demoActions = [
    { desc: 'Afficher les standards 5S dans l\'atelier Bouchon Moulage', resp: 'EMP003', ech: '2026-03-25', statut: ActionStatus.en_cours, prio: Priority.haute, avance: 40, orig: '5S' },
    { desc: 'Évacuer les pièces obsolètes de l\'atelier maintenance', resp: 'EMP005', ech: '2026-03-20', statut: ActionStatus.ouverte, prio: Priority.critique, avance: 0, orig: '5S' },
    { desc: 'Installer les bacs de tri sélectif', resp: 'SUP001', ech: '2026-04-05', statut: ActionStatus.en_cours, prio: Priority.moyenne, avance: 60, orig: 'suggestion' },
    { desc: 'Former l\'équipe Bouchon aux bonnes pratiques 5S', resp: 'SUP002', ech: '2026-04-15', statut: ActionStatus.ouverte, prio: Priority.haute, avance: 0, orig: '5S' },
    { desc: 'Mettre en place le tableau de suivi OF', resp: 'SUP001', ech: '2026-03-01', statut: ActionStatus.terminee, prio: Priority.haute, avance: 100, orig: 'suggestion' },
    { desc: 'Réparer l\'éclairage défectueux zone moulage', resp: 'EMP005', ech: '2026-03-10', statut: ActionStatus.terminee, prio: Priority.haute, avance: 100, orig: '5S' },
    { desc: 'Commander les chariots SMED pour l\'hélio', resp: 'SUP002', ech: '2026-04-10', statut: ActionStatus.en_cours, prio: Priority.moyenne, avance: 30, orig: 'suggestion' },
    { desc: 'Auditer le rangement de tous les postes Offset', resp: 'SUP001', ech: '2026-03-30', statut: ActionStatus.ouverte, prio: Priority.basse, avance: 0, orig: '5S' },
  ];

  for (const da of demoActions) {
    await prisma.action.create({
      data: {
        description: da.desc,
        responsableId: users[da.resp].id,
        echeance: new Date(da.ech),
        statut: da.statut,
        priorite: da.prio,
        avancement: da.avance,
        origineType: da.orig,
      },
    });
  }
  console.log(`  ✅ ${demoActions.length} actions correctives`);

  // ============================================================
  // 10. PERMISSIONS
  // ============================================================
  const permissionsDef = [
    // Dashboard
    { code: 'dashboard_view', label: 'Voir le tableau de bord', module: 'dashboard' },
    { code: 'dashboard_stats', label: 'Voir les statistiques globales', module: 'dashboard' },

    // Évaluations 5S
    { code: 'eval_view', label: 'Voir les évaluations', module: 'evaluations' },
    { code: 'eval_create', label: 'Créer une évaluation', module: 'evaluations' },
    { code: 'eval_edit', label: 'Modifier une évaluation', module: 'evaluations' },
    { code: 'eval_delete', label: 'Supprimer une évaluation', module: 'evaluations' },
    { code: 'eval_analyze', label: 'Lancer l\'analyse IA', module: 'evaluations' },
    { code: 'eval_export', label: 'Exporter les évaluations', module: 'evaluations' },

    // Suggestions
    { code: 'suggestion_view', label: 'Voir les suggestions', module: 'suggestions' },
    { code: 'suggestion_create', label: 'Créer une suggestion', module: 'suggestions' },
    { code: 'suggestion_edit', label: 'Modifier une suggestion', module: 'suggestions' },
    { code: 'suggestion_delete', label: 'Supprimer une suggestion', module: 'suggestions' },
    { code: 'suggestion_review', label: 'Donner un avis superviseur', module: 'suggestions' },
    { code: 'suggestion_decide', label: 'Décision direction', module: 'suggestions' },
    { code: 'suggestion_analyze', label: 'Lancer l\'analyse IA suggestion', module: 'suggestions' },

    // Actions correctives
    { code: 'action_view', label: 'Voir les actions correctives', module: 'actions' },
    { code: 'action_create', label: 'Créer une action corrective', module: 'actions' },
    { code: 'action_edit', label: 'Modifier une action', module: 'actions' },
    { code: 'action_delete', label: 'Supprimer une action', module: 'actions' },

    // Classements
    { code: 'classement_view', label: 'Voir les classements', module: 'classements' },

    // Historique
    { code: 'historique_view', label: 'Voir l\'historique', module: 'historique' },

    // Profil
    { code: 'profil_view', label: 'Voir son profil', module: 'profil' },
    { code: 'profil_edit', label: 'Modifier son profil', module: 'profil' },

    // Administration
    { code: 'admin_users', label: 'Gérer les utilisateurs', module: 'admin' },
    { code: 'admin_users_role', label: 'Changer le rôle d\'un utilisateur', module: 'admin' },
    { code: 'admin_users_assign', label: 'Assigner service/atelier/fonction', module: 'admin' },
    { code: 'admin_services', label: 'Gérer les services', module: 'admin' },
    { code: 'admin_ateliers', label: 'Gérer les ateliers', module: 'admin' },
    { code: 'admin_categories', label: 'Gérer les catégories', module: 'admin' },
    { code: 'admin_permissions', label: 'Gérer les permissions', module: 'admin' },
    { code: 'admin_config', label: 'Gérer la configuration', module: 'admin' },
    { code: 'admin_export', label: 'Export global des données', module: 'admin' },

    // Superviseur
    { code: 'superviseur_dashboard', label: 'Tableau de bord superviseur', module: 'superviseur' },
    { code: 'superviseur_team', label: 'Voir l\'équipe', module: 'superviseur' },

    // Direction
    { code: 'direction_dashboard', label: 'Tableau de bord direction', module: 'direction' },
    { code: 'direction_reports', label: 'Rapports direction', module: 'direction' },
  ];

  const permMap: Record<string, string> = {};
  for (const p of permissionsDef) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: { label: p.label, module: p.module },
      create: p,
    });
    permMap[p.code] = perm.id;
  }
  console.log(`  ✅ ${permissionsDef.length} permissions`);

  // ============================================================
  // 11. ROLE-PERMISSION ASSIGNMENTS
  // ============================================================
  const rolePerms: Record<string, string[]> = {
    employe: [
      'dashboard_view', 'eval_view', 'eval_create',
      'suggestion_view', 'suggestion_create',
      'action_view', 'classement_view', 'historique_view',
      'profil_view', 'profil_edit',
    ],
    superviseur: [
      'dashboard_view', 'dashboard_stats',
      'eval_view', 'eval_create', 'eval_edit', 'eval_analyze', 'eval_export',
      'suggestion_view', 'suggestion_create', 'suggestion_edit', 'suggestion_review', 'suggestion_analyze',
      'action_view', 'action_create', 'action_edit',
      'classement_view', 'historique_view',
      'profil_view', 'profil_edit',
      'superviseur_dashboard', 'superviseur_team',
    ],
    direction: [
      'dashboard_view', 'dashboard_stats',
      'eval_view', 'eval_create', 'eval_edit', 'eval_analyze', 'eval_export',
      'suggestion_view', 'suggestion_create', 'suggestion_edit', 'suggestion_review', 'suggestion_decide', 'suggestion_analyze',
      'action_view', 'action_create', 'action_edit', 'action_delete',
      'classement_view', 'historique_view',
      'profil_view', 'profil_edit',
      'superviseur_dashboard', 'superviseur_team',
      'direction_dashboard', 'direction_reports',
      'admin_export',
    ],
    admin: Object.keys(permMap), // admin gets ALL permissions
  };

  for (const [role, codes] of Object.entries(rolePerms)) {
    // Delete existing then insert
    await prisma.rolePermission.deleteMany({ where: { role: role as any } });
    for (const code of codes) {
      if (permMap[code]) {
        await prisma.rolePermission.create({
          data: { role: role as any, permissionId: permMap[code] },
        });
      }
    }
  }
  console.log(`  ✅ Permissions assignées aux 4 rôles`);

  console.log('\n🎉 Seed completed!');
  console.log('   Demo accounts:');
  console.log('   EMP001 / demo  (Employé)');
  console.log('   SUP001 / demo  (Superviseur)');
  console.log('   DIR001 / demo  (Direction)');
  console.log('   ADM001 / admin (Administrateur)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
