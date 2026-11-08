// =====================================================================
// ARCHITECTURE MVC — MODÈLE : ARCHIVE (archiveModel.js)
// Responsabilité : Structure, inventaire des archives physiques & cotes
// =====================================================================

export const INITIAL_ARCHIVES = [
  {
    id: "ARCH-2025-001",
    numero: "DOS-1640-281944",
    im: "281944",
    nom: "RAKOTONIRINA PHILIPPE",
    min: "MINISTERE DE L'EDUCATION NATIONALE",
    filiere: "Pension",
    cat: "01 PENSION D'ANCIENNETE (RETRAITE)",
    dateDepot: "14/11/2024",
    dateArchivage: "12/01/2025",
    anneeArchivage: "2025",
    statutCloture: "Validé & Payé",
    coteBoite: "ARCH-2025/B-08",
    emplacement: "Salle Archives A • Rayonnage 2 • Tablette C",
    motif: "Dossier entièrement liquidé et mandaté au Trésor. Versement pour conservation légale décennale.",
    agentArchiviste: "R. Jean-Paul (Archiviste SRSP Ambositra)",
    email: "philippe.rako@gmail.com",
    tel: "034 55 123 89"
  },
  {
    id: "ARCH-2025-002",
    numero: "DOS-1688-319520",
    im: "319520",
    nom: "RASOANARIVO JEANINE",
    min: "MINISTERE DE LA SANTE PUBLIQUE",
    filiere: "Solde",
    cat: "13 AVANCEMENT DE CLASSE OU ECHELON",
    dateDepot: "03/12/2024",
    dateArchivage: "28/02/2025",
    anneeArchivage: "2025",
    statutCloture: "Validé & Payé",
    coteBoite: "ARCH-2025/B-14",
    emplacement: "Salle Archives A • Rayonnage 4 • Tablette B",
    motif: "Prise en charge financière effective sur la solde du mois de février 2025. Clôture administrative.",
    agentArchiviste: "R. Jean-Paul (Archiviste SRSP Ambositra)",
    email: "jeanine.rasoa@gmail.com",
    tel: "033 77 456 12"
  },
  {
    id: "ARCH-2025-003",
    numero: "DOS-1702-402911",
    im: "402911",
    nom: "RAKOTOVAO HARIMANANA",
    min: "MINISTERE DE L'INTERIEUR",
    filiere: "Visas",
    cat: "VISA PREALABLE TITRE DE PAIEMENT",
    dateDepot: "10/01/2025",
    dateArchivage: "15/03/2025",
    anneeArchivage: "2025",
    statutCloture: "Validé & Payé",
    coteBoite: "ARCH-2025/B-21",
    emplacement: "Salle Archives B • Rayonnage 1 • Tablette D",
    motif: "Visa préalable accordé et bordereau de transmission légal archivé.",
    agentArchiviste: "R. Jean-Paul (Archiviste SRSP Ambositra)",
    email: "harimanana.r@gmail.com",
    tel: "032 44 987 65"
  }
];

// Helper ho an'ny fizarana (Division de la solde, visas, pensions)
export const getArchiveDivision = (archive) => {
  const f = (archive?.filiere || archive?.division || archive?.cat || '').toLowerCase();
  if (f.includes('solde')) return 'Solde';
  if (f.includes('visa')) return 'Visas';
  if (f.includes('pension')) return 'Pensions';
  return 'Autre';
};

export const generateArchiveCote = (archivesCount = 0) => {
  const annee = new Date().getFullYear();
  const num = String(archivesCount + 1).padStart(2, '0');
  return `ARCH-${annee}/B-${num}`;
};

export const createArchiveRecord = (dossier, { coteBoite, emplacement, motif, agentArchiviste, utilisateurId = 1 }) => {
  const now = new Date();
  const annee = String(now.getFullYear());
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${annee}`;
  const assignedCote = coteBoite || generateArchiveCote();
  
  return {
    // 1. Colonnes exactes de la table PostgreSQL archives
    id: `ARCH-${annee}-${String(Date.now()).slice(-4)}`,
    dossier_id: dossier.id,
    cote_rangement: assignedCote,
    rayon: "A",
    boite: assignedCote.split('/')[1] || "B-01",
    chemise: "1",
    bordereau_versement: `BV-${annee}-${String(Date.now()).slice(-4)}`,
    date_versement: now.toISOString(),
    archive_par_utilisateur_id: utilisateurId,
    observations: motif || "Clôture administrative et versement légal aux archives régionales.",
    statut_conservation: dossier.etat === 'Validé' ? 'Archivé légal 10 ans' : 'Rejeté / Sans Suite',

    // 2. Propriétés et alias Frontend
    numero: dossier.numero,
    im: dossier.im,
    nom: dossier.nom,
    min: dossier.min,
    filiere: dossier.filiere,
    cat: dossier.cat,
    dateDepot: dossier.date,
    dateArchivage: dateFormatted,
    anneeArchivage: annee,
    statutCloture: dossier.etat === 'Validé' ? 'Validé & Payé' : 'Rejeté / Sans Suite',
    coteBoite: assignedCote,
    emplacement: emplacement || 'Salle Archives A • Rayonnage 1 • Tablette B',
    motif: motif || "Clôture administrative et versement légal aux archives régionales.",
    agentArchiviste: agentArchiviste || "Responsable Archives SRSP Ambositra",
    email: dossier.email || "",
    tel: dossier.tel || "",
    historiqueRef: dossier.historique || []
  };
};