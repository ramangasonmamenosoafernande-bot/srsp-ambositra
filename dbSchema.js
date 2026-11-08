// =====================================================================
// BASE DE DONNÉES GESTION_PENSION — SCHÉMA & MAPPERS POSTGRESQL (dbSchema.js)
// Correspondance 1:1 avec les 8 tables actives de la base de données :
// 1. utilisateurs
// 2. dossiers
// 3. bordereaux_envoi
// 4. pieces_justificatives
// 5. historique_etapes
// 6. commentaires
// 7. archives
// 8. notifications_alertes
// (Simulateur / simulations_calcul supprimé)
// =====================================================================

export const SQL_CREATE_UTILISATEURS = `
CREATE TABLE IF NOT EXISTS utilisateurs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    departement VARCHAR(100),
    email VARCHAR(100),
    telephone VARCHAR(20),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

export const SQL_CREATE_BORDEREAUX_ENVOI = `
CREATE TABLE IF NOT EXISTS bordereaux_envoi (
    id SERIAL PRIMARY KEY,
    numero_be VARCHAR(50) UNIQUE NOT NULL,
    ministere_origine VARCHAR(150) NOT NULL,
    date_reception DATE DEFAULT CURRENT_DATE,
    receptionne_par_utilisateur_id INTEGER REFERENCES utilisateurs(id),
    nombre_dossiers INTEGER DEFAULT 1,
    observations TEXT
);`;

export const SQL_CREATE_DOSSIERS = `
CREATE TABLE IF NOT EXISTS dossiers (
    id SERIAL PRIMARY KEY,
    numero_dossier VARCHAR(50) UNIQUE NOT NULL,
    nom_beneficiaire VARCHAR(150) NOT NULL,
    prenom_beneficiaire VARCHAR(150),
    date_depot DATE DEFAULT CURRENT_DATE,
    statut_actuel VARCHAR(50) DEFAULT 'En attente',
    chemin_scan VARCHAR(255),
    cree_par INTEGER REFERENCES utilisateurs(id),
    date_mise_a_jour TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    categorie_verrouillee BOOLEAN DEFAULT FALSE,
    categorie VARCHAR(100),
    type_pension VARCHAR(100),
    solde NUMERIC(15,2) DEFAULT 0.00,
    visa_appose BOOLEAN DEFAULT FALSE,
    dossier_solde BOOLEAN DEFAULT FALSE
);`;

export const SQL_CREATE_PIECES_JUSTIFICATIVES = `
CREATE TABLE IF NOT EXISTS pieces_justificatives (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    nom_piece VARCHAR(200) NOT NULL,
    est_obligatoire BOOLEAN DEFAULT TRUE,
    est_fournie BOOLEAN DEFAULT FALSE,
    est_conforme BOOLEAN DEFAULT FALSE,
    date_reception TIMESTAMP WITH TIME ZONE,
    verifie_par_utilisateur_id INTEGER REFERENCES utilisateurs(id),
    motif_non_conformite TEXT
);`;

export const SQL_CREATE_HISTORIQUE_ETAPES = `
CREATE TABLE IF NOT EXISTS historique_etapes (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    ancien_statut VARCHAR(50),
    nouveau_statut VARCHAR(50),
    date_changement TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

export const SQL_CREATE_COMMENTAIRES = `
CREATE TABLE IF NOT EXISTS commentaires (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    date_creation TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

export const SQL_CREATE_ARCHIVES = `
CREATE TABLE IF NOT EXISTS archives (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES dossiers(id) ON DELETE SET NULL,
    cote_rangement VARCHAR(50) UNIQUE NOT NULL,
    rayon VARCHAR(20),
    boite VARCHAR(20),
    chemise VARCHAR(20),
    bordereau_versement VARCHAR(50),
    date_versement TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archive_par_utilisateur_id INTEGER REFERENCES utilisateurs(id),
    observations TEXT,
    statut_conservation VARCHAR(30) DEFAULT 'Archivé légal 10 ans'
);`;

export const SQL_CREATE_NOTIFICATIONS_ALERTES = `
CREATE TABLE IF NOT EXISTS notifications_alertes (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
    canal VARCHAR(20) DEFAULT 'email',
    destinataire VARCHAR(150) NOT NULL,
    objet VARCHAR(200),
    message TEXT NOT NULL,
    type_alerte VARCHAR(50) DEFAULT 'information',
    est_envoye BOOLEAN DEFAULT TRUE,
    est_lu BOOLEAN DEFAULT FALSE,
    date_envoi TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

export function dossierFromDb(row) {
  if (!row) return null;
  const isSolde = Boolean(row.dossier_solde || (row.categorie && row.categorie.toLowerCase().includes('solde')));
  const isVisa = Boolean(row.visa_appose || (row.categorie && row.categorie.toLowerCase().includes('visa')));
  const isPension = Boolean(row.type_pension && row.type_pension.trim() !== '');

  const filiere = isPension ? 'Pension' : (isVisa ? 'Visa' : (isSolde ? 'Solde' : 'Solde'));
  const nomComplet = `${row.nom_beneficiaire || ''} ${row.prenom_beneficiaire || ''}`.trim();
  const imMatch = String(row.numero_dossier || '').match(/\d{5,6}/);
  const im = imMatch ? imMatch[0] : (row.matricule_im || '123456');

  return {
    id: row.id,
    numero_dossier: row.numero_dossier,
    nom_beneficiaire: row.nom_beneficiaire,
    prenom_beneficiaire: row.prenom_beneficiaire,
    date_depot: row.date_depot,
    statut_actuel: row.statut_actuel || 'En attente',
    chemin_scan: row.chemin_scan || null,
    cree_par: row.cree_par || 1,
    date_mise_a_jour: row.date_mise_a_jour,
    categorie_verrouillee: Boolean(row.categorie_verrouillee),
    categorie: row.categorie || "Actes Administratifs",
    type_pension: row.type_pension || null,
    solde: Number(row.solde || 0),
    visa_appose: Boolean(row.visa_appose),
    dossier_solde: Boolean(row.dossier_solde),

    numero: row.numero_dossier,
    nom: nomComplet || row.nom_beneficiaire || "Bénéficiaire",
    im: im,
    date: row.date_depot ? new Date(row.date_depot).toLocaleDateString('fr-FR') : "24/09/2026",
    be: row.numero_be || "BE-01",
    min: row.ministere || "MINISTERE DE L'ECONOMIE ET DES FINANCES",
    filiere: filiere,
    cat: row.categorie || row.type_pension || "13 AVANCEMENT DE CLASSE OU ECHELON",
    stage: row.stage || (row.statut_actuel === 'Validé' ? 'Traité' : (row.statut_actuel === 'En cours' ? 'Vérification' : 'Accueil')),
    etat: row.statut_actuel || 'En cours',
    delai: row.delai || 2.1
  };
}

export function archiveFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    dossier_id: row.dossier_id,
    cote_rangement: row.cote_rangement,
    rayon: row.rayon,
    boite: row.boite,
    chemise: row.chemise,
    bordereau_versement: row.bordereau_versement,
    date_versement: row.date_versement,
    archive_par_utilisateur_id: row.archive_par_utilisateur_id,
    observations: row.observations,
    statut_conservation: row.statut_conservation,

    coteBoite: row.cote_rangement,
    emplacement: `Salle Archives • Rayon ${row.rayon || 'A'} • Boîte ${row.boite || '01'}`,
    dateArchivage: row.date_versement ? new Date(row.date_versement).toLocaleDateString('fr-FR') : "2025",
    statutCloture: row.statut_conservation || "Validé & Payé",
    motif: row.observations || "Versement légal décennal"
  };
}