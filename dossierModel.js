// =====================================================================
// ARCHITECTURE MVC — MODÈLE : DOSSIER (dossierModel.js)
// Responsabilité : Données, Types, Règles de gestion & Piste d'Audit
// Service Régional des Soldes et Pensions (SRSP) Ambositra
// =====================================================================

export const STAGES = [
  "Accueil",
  "Vérification",
  "Contrôle",
  "Traité"
];

export const STAGE_LABELS = {
  fr: {
    "Accueil": "1. Réception (Guichet)",
    "Vérification": "2. Étude (Vérification & Liquidation)",
    "Contrôle": "3. Contrôle",
    "Traité": "4. Traité",
    "Paiement": "4. Traité"
  },
  mg: {
    "Accueil": "1. Fandraisana (Guichet)",
    "Vérification": "2. Fandinihana (Vérification & Liquidation)",
    "Contrôle": "3. Fanaraha-maso (Contrôle)",
    "Traité": "4. Voakarakara (Traité)",
    "Paiement": "4. Voakarakara (Traité)"
  }
};

export const MINISTERES = [
  "MINISTERE DE L'EDUCATION NATIONALE",
  "MINISTERE DE LA SANTE PUBLIQUE",
  "MINISTERE DE L'ECONOMIE ET DES FINANCES",
  "MINISTERE DE LA JUSTICE",
  "MINISTERE DE LA DEFENSE NATIONALE",
  "MINISTERE DE L'ENSEIGNEMENT SUPERIEUR",
  "MINISTERE DE L'INTERIEUR ET DE LA DECENTRALISATION",
  "MINISTERE DE L'AGRICULTURE ET DE L'ELEVAGE",
  "AUTRE MINISTERE OU INSTITUTION PUBLIQUE"
];

export const CATEGORIES = {
  Solde: [
    { value: "13 AVANCEMENT DE CLASSE OU ECHELON", label: "Avancement d'échelon / classe" },
    { value: "11 INTEGRATION ET 1ERE PRISE EN CHARGE", label: "Intégration & 1ère prise en charge" },
    { value: "15 RAPPEL DIFFERENTIEL DE SOLDE", label: "Rappel différentiel de solde" },
    { value: "12 INDEMNITE DE DIRECTION ET SUJETION", label: "Indemnités de fonction & sujétion" },
    { value: "14 VALIDATION DE SERVICES PRECAIRES", label: "Validation de services auxiliaires" }
  ],
  Pension: [
    { value: "01 PENSION D'ANCIENNETE (RETRAITE)", label: "Pension d'ancienneté (Retraite normale)" },
    { value: "03 REVERSION DE PENSION CIVILE", label: "Pension de réversion (Veuves & Orphelins)" },
    { value: "02 PENSION PROPORTIONNELLE", label: "Pension proportionnelle" },
    { value: "04 PENSION D'INVALIDITE", label: "Pension d'invalidité temporaire ou définitive" },
    { value: "05 CAPITAL DECES ET SECOURS", label: "Capital décès et secours immédiat" }
  ],
  Visa: [
    { value: "08 CONGE DE LONGUE DUREE (CLD)", label: "Visa Congé de longue durée (CLD)" },
    { value: "09 DETACHEMENT OU DISPONIBILITE", label: "Visa Détachement / Disponibilité" },
    { value: "10 VISA D'ENGAGEMENT COMPTABLE", label: "Visa préalable d'engagement comptable" },
    { value: "07 AFFECTATION ET MUTATION REGIONALE", label: "Visa Affectation et mutation" }
  ]
};

// Données mensuelles pour les statistiques & graphiques
export const MONTHLY_PROCESSING_DATA = [
  { mois: 'Jan', moisLong: 'Janvier 2026', moisMg: 'Janoary', solde: 54, pension: 38, visa: 26, total: 118, delaiMoyen: 6.4, delaiCible: 3.0, conformes: 92, nonConformes: 26 },
  { mois: 'Fév', moisLong: 'Février 2026', moisMg: 'Febroary', solde: 62, pension: 41, visa: 29, total: 132, delaiMoyen: 5.8, delaiCible: 3.0, conformes: 108, nonConformes: 24 },
  { mois: 'Mar', moisLong: 'Mars 2026', moisMg: 'Martsa', solde: 71, pension: 47, visa: 34, total: 152, delaiMoyen: 5.1, delaiCible: 3.0, conformes: 129, nonConformes: 23 },
  { mois: 'Avr', moisLong: 'Avril 2026', moisMg: 'Aprily', solde: 68, pension: 44, visa: 31, total: 143, delaiMoyen: 4.6, delaiCible: 3.0, conformes: 126, nonConformes: 17 },
  { mois: 'Mai', moisLong: 'Mai 2026', moisMg: 'Mey', solde: 79, pension: 52, visa: 39, total: 170, delaiMoyen: 4.0, delaiCible: 3.0, conformes: 151, nonConformes: 19 },
  { mois: 'Juin', moisLong: 'Juin 2026', moisMg: 'Jona', solde: 85, pension: 58, visa: 42, total: 185, delaiMoyen: 3.5, delaiCible: 3.0, conformes: 168, nonConformes: 17 },
  { mois: 'Juil', moisLong: 'Juillet 2026', moisMg: 'Jolay', solde: 88, pension: 61, visa: 45, total: 194, delaiMoyen: 3.2, delaiCible: 3.0, conformes: 180, nonConformes: 14 },
  { mois: 'Août', moisLong: 'Août 2026', moisMg: 'Aogositra', solde: 94, pension: 64, visa: 48, total: 206, delaiMoyen: 2.9, delaiCible: 3.0, conformes: 194, nonConformes: 12 },
  { mois: 'Sept', moisLong: 'Septembre 2026', moisMg: 'Septambra', solde: 98, pension: 69, visa: 51, total: 218, delaiMoyen: 2.6, delaiCible: 3.0, conformes: 209, nonConformes: 9 },
  { mois: 'Oct', moisLong: 'Octobre 2026', moisMg: 'Oktobra', solde: 106, pension: 74, visa: 57, total: 237, delaiMoyen: 2.3, delaiCible: 3.0, conformes: 230, nonConformes: 7 }
];

export const createAuditLogEntry = ({
  action,
  type = 'statut',
  ancienStatut,
  nouveauStatut,
  etape,
  utilisateur,
  motif,
  ip = "Poste SRSP Ambositra"
}) => {
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} à ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  return {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now.toISOString(),
    date: dateFormatted,
    action,
    type,
    ancienStatut: ancienStatut || "Non spécifié",
    nouveauStatut: nouveauStatut || "Non spécifié",
    etape: etape || "Accueil",
    utilisateur: {
      nom: utilisateur?.name || "Agent SRSP",
      role: utilisateur?.role || "Agent administratif",
      username: utilisateur?.username || "agent.srsp",
      dept: utilisateur?.dept || "Service Régional des Soldes et Pensions"
    },
    motif: motif || "Modification effectuée conformément aux procédures administratives en vigueur.",
    ip: utilisateur?.ip || ip
  };
};

export const buildInitialAuditTrail = (dossier) => {
  const baseDate = dossier.date || "24/09/2026";
  const logs = [];

  logs.push({
    id: `AUDIT-${dossier.id}-01`,
    timestamp: "2026-09-24T08:30:00Z",
    date: `${baseDate} à 08:30`,
    action: "Enregistrement & Dépôt Initial au Guichet",
    type: "depot",
    ancienStatut: "Non enregistré",
    nouveauStatut: "En attente",
    etape: "Accueil",
    utilisateur: {
      nom: "R. Razafy Michel",
      role: "Agent d'Accueil & Guichet",
      username: "accueil.srsp",
      dept: "Guichet d'Ordre & Réception SRSP Ambositra"
    },
    motif: `Dépôt physique des pièces sous bordereau d'envoi n° ${dossier.be || 'BE-01'}. Récépissé officiel généré et remis avec QR Code d'identification.`,
    ip: "Poste 01 • Guichet Central SRSP"
  });

  if (dossier.stage !== "Accueil" || dossier.etat !== "En attente") {
    logs.push({
      id: `AUDIT-${dossier.id}-02`,
      timestamp: "2026-09-24T10:15:00Z",
      date: `${baseDate} à 10:15`,
      action: "Prise en charge & Début de Liquidation",
      type: "instruction",
      ancienStatut: "En attente",
      nouveauStatut: "En cours",
      etape: "Vérification",
      utilisateur: {
        nom: "R. Jean-Luc Rakoto",
        role: "Contrôleur Liquidateur",
        username: "liquidateur.srsp",
        dept: "Division de la Solde et des Pensions"
      },
      motif: "Contrôle de complétude du dossier, calcul des droits indiciaires et conformité de l'acte administratif.",
      ip: "Poste 04 • Bureau Liquidation"
    });
  }

  if (["Contrôle", "Paiement", "Traité"].includes(dossier.stage)) {
    logs.push({
      id: `AUDIT-${dossier.id}-03`,
      timestamp: "2026-09-24T14:40:00Z",
      date: `${baseDate} à 14:40`,
      action: "Transmission pour Visa & Contrôle de Régularité",
      type: "transmission",
      ancienStatut: "En cours",
      nouveauStatut: "En cours",
      etape: "Contrôle",
      utilisateur: {
        nom: "R. Jean-Luc Rakoto",
        role: "Contrôleur Liquidateur",
        username: "liquidateur.srsp",
        dept: "Division de la Solde et des Pensions"
      },
      motif: "Liquidation vérifiée sans anomalie. Transmission au chef de section pour visa préalable.",
      ip: "Poste 04 • Bureau Liquidation"
    });
  }

  if (dossier.etat === "Validé") {
    logs.push({
      id: `AUDIT-${dossier.id}-04`,
      timestamp: "2026-09-24T16:20:00Z",
      date: `${baseDate} à 16:20`,
      action: "Validation Définitive & Traité",
      type: "validation",
      ancienStatut: "En cours",
      nouveauStatut: "Validé",
      etape: "Traité",
      utilisateur: {
        nom: "R. Mamenosoa Fernande",
        role: "Administrateur Général SRSP",
        username: "admin",
        dept: "Direction Régionale SRSP Ambositra"
      },
      motif: "Dossier conforme aux dispositions budgétaires et statutaires régionales. Traitement validé.",
      ip: "Poste Direction • Bureau Chef de Service"
    });
  } else if (dossier.etat === "Rejeté") {
    logs.push({
      id: `AUDIT-${dossier.id}-04`,
      timestamp: "2026-09-24T11:35:00Z",
      date: `${baseDate} à 11:35`,
      action: "Notification de Rejet Administratif",
      type: "rejet",
      ancienStatut: "En cours",
      nouveauStatut: "Rejeté",
      etape: dossier.stage,
      utilisateur: {
        nom: "R. Jean-Luc Rakoto",
        role: "Contrôleur Liquidateur",
        username: "liquidateur.srsp",
        dept: "Division Contrôle & Liquidation"
      },
      motif: dossier.motif || "Pièce manquante ou non conforme aux textes réglementaires.",
      ip: "Poste 04 • Bureau Liquidation"
    });
  }

  return logs.reverse();
};

export const RAW_INITIAL_DOSSIERS = [
  { 
    id: 1, 
    numero_dossier: "DOS-1805-324176",
    nom_beneficiaire: "ANDRIANTSIRAHONANA",
    prenom_beneficiaire: "MARIE",
    date_depot: "2026-09-24",
    statut_actuel: "Validé",
    chemin_scan: "/scans/2026/DOS-1805-324176.pdf",
    cree_par: 1,
    date_mise_a_jour: "2026-09-24T16:20:00",
    categorie_verrouillee: true,
    categorie: "13 AVANCEMENT DE CLASSE OU ECHELON",
    type_pension: null,
    solde: 850000.00,
    visa_appose: false,
    dossier_solde: true,
    date: "24/09/2026", 
    be: "084/MEN", 
    numero: "DOS-1805-324176", 
    im: "324176", 
    nom: "ANDRIANTSIRAHONANA MARIE", 
    min: "MINISTERE DE L'EDUCATION NATIONALE", 
    filiere: "Solde", 
    cat: "13 AVANCEMENT DE CLASSE OU ECHELON", 
    stage: "Traité", 
    etat: "Validé", 
    email: "marie.andri@gmail.com", 
    tel: "034 11 223 34", 
    delai: 1.8 
  },
  { 
    id: 2, 
    numero_dossier: "DOS-1806-410982",
    nom_beneficiaire: "RABEMANANJARA",
    prenom_beneficiaire: "JEAN",
    date_depot: "2026-09-25",
    statut_actuel: "En cours",
    chemin_scan: "/scans/2026/DOS-1806-410982.pdf",
    cree_par: 2,
    date_mise_a_jour: "2026-09-25T10:15:00",
    categorie_verrouillee: false,
    categorie: "01 PENSION D'ANCIENNETE (RETRAITE)",
    type_pension: "01 PENSION D'ANCIENNETE (RETRAITE)",
    solde: 0.00,
    visa_appose: false,
    dossier_solde: false,
    date: "25/09/2026", 
    be: "085/MSP", 
    numero: "DOS-1806-410982", 
    im: "410982", 
    nom: "RABEMANANJARA JEAN", 
    min: "MINISTERE DE LA SANTE PUBLIQUE", 
    filiere: "Pension", 
    cat: "01 PENSION D'ANCIENNETE (RETRAITE)", 
    stage: "Vérification", 
    etat: "En cours", 
    email: "jean.rabe@gmail.com", 
    tel: "032 55 678 90", 
    delai: 3.5 
  },
  { 
    id: 3, 
    numero_dossier: "DOS-1807-552109",
    nom_beneficiaire: "RAZAFINDRABE",
    prenom_beneficiaire: "CLAIRE",
    date_depot: "2026-09-26",
    statut_actuel: "En cours",
    chemin_scan: "/scans/2026/DOS-1807-552109.pdf",
    cree_par: 1,
    date_mise_a_jour: "2026-09-26T11:00:00",
    categorie_verrouillee: false,
    categorie: "08 CONGE DE LONGUE DUREE (CLD)",
    type_pension: null,
    solde: 0.00,
    visa_appose: false,
    dossier_solde: false,
    date: "26/09/2026", 
    be: "042/MJ", 
    numero: "DOS-1807-552109", 
    im: "552109", 
    nom: "RAZAFINDRABE CLAIRE", 
    min: "MINISTERE DE LA JUSTICE", 
    filiere: "Visa", 
    cat: "08 CONGE DE LONGUE DUREE (CLD)", 
    stage: "Contrôle", 
    etat: "En cours", 
    email: "claire.razaf@gmail.com", 
    tel: "033 12 345 67", 
    delai: 2.1 
  },
  { 
    id: 4, 
    numero_dossier: "DOS-1808-119842",
    nom_beneficiaire: "RAZANAMAHEFA",
    prenom_beneficiaire: "HERY",
    date_depot: "2026-09-27",
    statut_actuel: "En attente",
    chemin_scan: null,
    cree_par: 2,
    date_mise_a_jour: "2026-09-27T09:00:00",
    categorie_verrouillee: false,
    categorie: "01 PENSION D'ANCIENNETE (RETRAITE)",
    type_pension: "01 PENSION D'ANCIENNETE (RETRAITE)",
    solde: 0.00,
    visa_appose: false,
    dossier_solde: false,
    date: "27/09/2026", 
    be: "112/MINDEF", 
    numero: "DOS-1808-119842", 
    im: "119842", 
    nom: "RAZANAMAHEFA HERY", 
    min: "MINISTERE DE LA DEFENSE NATIONALE", 
    filiere: "Pension", 
    cat: "01 PENSION D'ANCIENNETE (RETRAITE)", 
    stage: "Accueil", 
    etat: "En attente", 
    email: "hery.raza@gmail.com", 
    tel: "034 22 890 12", 
    delai: 1.2 
  },
  { 
    id: 5, 
    numero_dossier: "DOS-1809-512890",
    nom_beneficiaire: "RALAIMAMPIANDRA",
    prenom_beneficiaire: "ERIC",
    date_depot: "2026-09-28",
    statut_actuel: "En cours",
    chemin_scan: "/scans/2026/DOS-1809-512890.pdf",
    cree_par: 1,
    date_mise_a_jour: "2026-09-28T14:00:00",
    categorie_verrouillee: false,
    categorie: "11 INTEGRATION ET 1ERE PRISE EN CHARGE",
    type_pension: null,
    solde: 920000.00,
    visa_appose: false,
    dossier_solde: true,
    date: "28/09/2026", 
    be: "091/MESUPRES", 
    numero: "DOS-1809-512890", 
    im: "512890", 
    nom: "RALAIMAMPIANDRA ERIC", 
    min: "MINISTERE DE L'ENSEIGNEMENT SUPERIEUR", 
    filiere: "Solde", 
    cat: "11 INTEGRATION ET 1ERE PRISE EN CHARGE", 
    stage: "Traité", 
    etat: "En cours", 
    email: "eric.ralai@gmail.com", 
    tel: "034 89 456 12", 
    delai: 2.7 
  },
  { 
    id: 6, 
    numero_dossier: "DOS-1810-198452",
    nom_beneficiaire: "RAKOTOMALALA",
    prenom_beneficiaire: "FLORENCE",
    date_depot: "2026-09-29",
    statut_actuel: "En attente",
    chemin_scan: null,
    cree_par: 2,
    date_mise_a_jour: "2026-09-29T08:30:00",
    categorie_verrouillee: false,
    categorie: "03 REVERSION DE PENSION CIVILE",
    type_pension: "03 REVERSION DE PENSION CIVILE",
    solde: 0.00,
    visa_appose: false,
    dossier_solde: false,
    date: "29/09/2026", 
    be: "078/MFP", 
    numero: "DOS-1810-198452", 
    im: "198452", 
    nom: "RAKOTOMALALA FLORENCE", 
    min: "MINISTERE DE L'ECONOMIE ET DES FINANCES", 
    filiere: "Pension", 
    cat: "03 REVERSION DE PENSION CIVILE", 
    stage: "Accueil", 
    etat: "En attente", 
    email: "florence.rako@gmail.com", 
    tel: "034 77 889 90", 
    delai: 0.8 
  },
  { 
    id: 7, 
    numero_dossier: "DOS-1811-441203",
    nom_beneficiaire: "RANDRIAMANANORO",
    prenom_beneficiaire: "FELANA",
    date_depot: "2026-09-30",
    statut_actuel: "En cours",
    chemin_scan: null,
    cree_par: 3,
    date_mise_a_jour: "2026-09-30T15:20:00",
    categorie_verrouillee: false,
    categorie: "09 DETACHEMENT OU DISPONIBILITE",
    type_pension: null,
    solde: 0.00,
    visa_appose: false,
    dossier_solde: false,
    date: "30/09/2026", 
    be: "104/MID", 
    numero: "DOS-1811-441203", 
    im: "441203", 
    nom: "RANDRIAMANANORO FELANA", 
    min: "MINISTERE DE L'INTERIEUR ET DE LA DECENTRALISATION", 
    filiere: "Visa", 
    cat: "09 DETACHEMENT OU DISPONIBILITE", 
    stage: "Vérification", 
    etat: "En cours", 
    email: "felana.randria@gmail.com", 
    tel: "032 66 123 45", 
    delai: 1.9 
  },
  { 
    id: 8, 
    numero_dossier: "DOS-1812-385012",
    nom_beneficiaire: "RAZANAKOLONA",
    prenom_beneficiaire: "AINA",
    date_depot: "2026-10-01",
    statut_actuel: "Rejeté",
    chemin_scan: null,
    cree_par: 1,
    date_mise_a_jour: "2026-10-01T11:45:00",
    categorie_verrouillee: false,
    categorie: "12 INDEMNITE DE DIRECTION ET SUJETION",
    type_pension: null,
    solde: 450000.00,
    visa_appose: false,
    dossier_solde: true,
    date: "01/10/2026", 
    be: "088/MEN", 
    numero: "DOS-1812-385012", 
    im: "385012", 
    nom: "RAZANAKOLONA AINA", 
    min: "MINISTERE DE L'EDUCATION NATIONALE", 
    filiere: "Solde", 
    cat: "12 INDEMNITE DE DIRECTION ET SUJETION", 
    stage: "Vérification", 
    etat: "Rejeté", 
    motif: "Pièce manquante : Décision d'affectation certifiée conforme", 
    email: "aina.raza@gmail.com", 
    tel: "034 98 765 43", 
    delai: 3.0 
  },
  { 
    id: 9, 
    numero_dossier: "DOS-1813-294711",
    nom_beneficiaire: "RAHARISON",
    prenom_beneficiaire: "PATRICK",
    date_depot: "2026-10-02",
    statut_actuel: "Validé",
    chemin_scan: "/scans/2026/DOS-1813-294711.pdf",
    cree_par: 2,
    date_mise_a_jour: "2026-10-02T16:00:00",
    categorie_verrouillee: true,
    categorie: "01 PENSION D'ANCIENNETE (RETRAITE)",
    type_pension: "01 PENSION D'ANCIENNETE (RETRAITE)",
    solde: 0.00,
    visa_appose: false,
    dossier_solde: false,
    date: "02/10/2026", 
    be: "099/MSP", 
    numero: "DOS-1813-294711", 
    im: "294711", 
    nom: "RAHARISON PATRICK", 
    min: "MINISTERE DE LA SANTE PUBLIQUE", 
    filiere: "Pension", 
    cat: "01 PENSION D'ANCIENNETE (RETRAITE)", 
    stage: "Traité", 
    etat: "Validé", 
    email: "patrick.raha@gmail.com", 
    tel: "033 44 556 67", 
    delai: 2.3 
  },
  { 
    id: 10, 
    numero_dossier: "DOS-1814-721098",
    nom_beneficiaire: "RASOAMALALA",
    prenom_beneficiaire: "NIVO",
    date_depot: "2026-10-03",
    statut_actuel: "En attente",
    chemin_scan: null,
    cree_par: 1,
    date_mise_a_jour: "2026-10-03T09:00:00",
    categorie_verrouillee: false,
    categorie: "13 AVANCEMENT DE CLASSE OU ECHELON",
    type_pension: null,
    solde: 610000.00,
    visa_appose: false,
    dossier_solde: true,
    date: "03/10/2026", 
    be: "230/MEN", 
    numero: "DOS-1814-721098", 
    im: "721098", 
    nom: "RASOAMALALA NIVO", 
    min: "MINISTERE DE L'EDUCATION NATIONALE", 
    filiere: "Solde", 
    cat: "13 AVANCEMENT DE CLASSE OU ECHELON", 
    stage: "Accueil", 
    etat: "En attente", 
    email: "nivo.rasoa@gmail.com", 
    tel: "034 12 345 67", 
    delai: 0.4 
  },
  { 
    id: 11, 
    numero_dossier: "DOS-1815-643210",
    nom_beneficiaire: "RABEHANTA",
    prenom_beneficiaire: "SOLOMON",
    date_depot: "2026-10-04",
    statut_actuel: "En attente",
    chemin_scan: null,
    cree_par: 3,
    date_mise_a_jour: "2026-10-04T10:30:00",
    categorie_verrouillee: false,
    categorie: "10 VISA D'ENGAGEMENT COMPTABLE",
    type_pension: null,
    solde: 0.00,
    visa_appose: true,
    dossier_solde: false,
    date: "04/10/2026", 
    be: "055/MEF", 
    numero: "DOS-1815-643210", 
    im: "643210", 
    nom: "RABEHANTA SOLOMON", 
    min: "MINISTERE DE L'ECONOMIE ET DES FINANCES", 
    filiere: "Visa", 
    cat: "10 VISA D'ENGAGEMENT COMPTABLE", 
    stage: "Accueil", 
    etat: "En attente", 
    email: "solomon.rabe@gmail.com", 
    tel: "033 99 887 76", 
    delai: 0.6 
  }
];

export const INITIAL_DOSSIERS = RAW_INITIAL_DOSSIERS.map(d => ({
  ...d,
  historique: buildInitialAuditTrail(d)
}));

export const calculateDossierStats = (dossiers = []) => {
  const total = dossiers.length;
  const enAttente = dossiers.filter(d => d.etat === 'En attente' || (d.etat === 'En cours' && d.stage === 'Accueil')).length;
  const enCours = dossiers.filter(d => (d.etat || 'En cours') === 'En cours' && d.stage !== 'Accueil').length;
  const valides = dossiers.filter(d => d.etat === 'Validé').length;
  const rejetes = dossiers.filter(d => d.etat === 'Rejeté').length;

  const solde = dossiers.filter(d => d.filiere === 'Solde').length;
  const pension = dossiers.filter(d => d.filiere === 'Pension').length;
  const visa = dossiers.filter(d => d.filiere === 'Visa').length;

  return {
    total,
    enAttente,
    enCours,
    valides,
    rejetes,
    solde,
    pension,
    visa,
    pctEnAttente: total ? Math.round((enAttente / total) * 100) : 0,
    pctEnCours: total ? Math.round((enCours / total) * 100) : 0,
    pctValides: total ? Math.round((valides / total) * 100) : 0,
    pctRejetes: total ? Math.round((rejetes / total) * 100) : 0
  };
};

export const filterDossiersList = (dossiers = [], { searchTerm = '', statusFilter = 'ALL', filiereFilter = 'ALL', stageFilter = 'ALL' } = {}) => {
  return dossiers.filter(d => {
    if (filiereFilter !== 'ALL' && d.filiere.toLowerCase() !== filiereFilter.toLowerCase()) {
      return false;
    }

    if (stageFilter !== 'ALL' && d.stage !== stageFilter) {
      return false;
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'En attente') {
        const isAttente = d.etat === 'En attente' || (d.etat === 'En cours' && d.stage === 'Accueil');
        if (!isAttente) return false;
      } else if (statusFilter === 'En cours') {
        const isEnCours = d.etat === 'En cours' && d.stage !== 'Accueil';
        if (!isEnCours) return false;
      } else if (statusFilter === 'Validé') {
        if (d.etat !== 'Validé') return false;
      } else if (statusFilter === 'Rejeté') {
        if (d.etat !== 'Rejeté') return false;
      }
    }

    if (searchTerm && searchTerm.trim()) {
      const tokens = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
      const searchableFields = [
        d.nom || '',
        d.im || '',
        d.numero || '',
        d.min || '',
        d.cat || '',
        d.filiere || '',
        d.be || '',
        d.email || '',
        d.tel || '',
        d.etat || '',
        d.stage || ''
      ].map(s => String(s).toLowerCase());

      const match = tokens.every(tok => 
        searchableFields.some(field => field.includes(tok))
      );
      if (!match) return false;
    }

    return true;
  });
};