// =====================================================================
// ARCHITECTURE MVC — MODÈLE : UTILISATEURS, RÔLES & DROITS D'ACCÈS RBAC
// Service Régional des Soldes et Pensions (SRSP) Ambositra — Amoron'i Mania
// Gestion de la matrice d'habilitation par poste administratif
// =====================================================================

export const DEMO_USERS = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Administrateur",
    role: "Administrateur",
    departement: "Direction Générale du Budget & Finances Amoron'i Mania",
    dept: "Direction Générale du Budget & Finances Amoron'i Mania",
    email: "admin.srsp@finances.gov.mg",
    telephone: "+261 34 00 111 00",
    actif: true,
    created_at: "2026-01-01T08:00:00"
  },
  {
    id: 2,
    username: "chef.coordo",
    password: "admin123",
    name: "Chef Coordo",
    role: "Chef Coordo",
    departement: "Coordination Générale & Contrôle SRSP",
    dept: "Coordination Générale & Contrôle SRSP",
    email: "chef.coordo@srsp-ambositra.mg",
    telephone: "+261 34 00 111 01",
    actif: true,
    created_at: "2026-01-02T08:00:00"
  },
  {
    id: 3,
    username: "accueil.guichet",
    password: "user123",
    name: "Agent d'Accueil & Guichet",
    role: "Agent d'Accueil & Guichet",
    departement: "Guichet d'Ordre & Réception des Actes",
    dept: "Guichet d'Ordre & Réception des Actes",
    email: "accueil.guichet@srsp-ambositra.mg",
    telephone: "+261 34 00 111 02",
    actif: true,
    created_at: "2026-01-03T08:00:00"
  },
  {
    id: 4,
    username: "chef.visa",
    password: "user123",
    name: "Chef de Service Visa",
    role: "Chef de Service Visa",
    departement: "Service du Visa & Contrôle de Légalité",
    dept: "Service du Visa & Contrôle de Légalité",
    email: "chef.visa@srsp-ambositra.mg",
    telephone: "+261 34 00 111 03",
    actif: true,
    created_at: "2026-01-04T08:00:00"
  },
  {
    id: 5,
    username: "chef.solde",
    password: "user123",
    name: "Chef de Service Solde",
    role: "Chef de Service Solde",
    departement: "Service de la Solde & Rémunérations",
    dept: "Service de la Solde & Rémunérations",
    email: "chef.solde@srsp-ambositra.mg",
    telephone: "+261 34 00 111 04",
    actif: true,
    created_at: "2026-01-05T08:00:00"
  },
  {
    id: 6,
    username: "chef.pension",
    password: "user123",
    name: "Chef de Service Pension",
    role: "Chef de Service Pension",
    departement: "Service des Pensions & Droits Civils",
    dept: "Service des Pensions & Droits Civils",
    email: "chef.pension@srsp-ambositra.mg",
    telephone: "+261 34 00 111 05",
    actif: true,
    created_at: "2026-01-06T08:00:00"
  },
  {
    id: 7,
    username: "responsable.archives",
    password: "user123",
    name: "Responsable des Archives",
    role: "Responsable des Archives",
    departement: "Section Archives & Numérisation SRSP Ambositra",
    dept: "Section Archives & Numérisation SRSP Ambositra",
    email: "archives.srsp@srsp-ambositra.mg",
    telephone: "+261 34 00 111 06",
    actif: true,
    created_at: "2026-01-07T08:00:00"
  }
];

export const PERMISSIONS_DEFINITIONS = [
  {
    id: "view_dossiers",
    label: "Visualiser les dossiers",
    category: "Consultation",
    description: "Consulter la liste générale des dossiers et accéder à la fiche détaillée."
  },
  {
    id: "create_dossier",
    label: "Enregistrer / Créer un dossier",
    category: "Modification",
    description: "Saisir un nouvel acte au guichet avec bordereau d'envoi et imprimer le récépissé."
  },
  {
    id: "edit_dossier",
    label: "Modifier les données d'un dossier",
    category: "Modification",
    description: "Mettre à jour les informations de l'agent, le reclassement de filière ou les pièces."
  },
  {
    id: "advance_step",
    label: "Transmettre à l'étape suivante",
    category: "Workflow",
    description: "Faire avancer le dossier dans le circuit (Accueil ➔ Vérification ➔ Contrôle ➔ Traité)."
  },
  {
    id: "validate_dossier",
    label: "Valider définitivement",
    category: "Validation",
    description: "Apposer le visa de conformité final et clôturer le dossier."
  },
  {
    id: "reject_dossier",
    label: "Rejeter un dossier avec motif",
    category: "Validation",
    description: "Notifier un rejet formel pour motif réglementaire ou pièces manquantes."
  },
  {
    id: "archive_dossier",
    label: "Verser aux archives régionales",
    category: "Archivage",
    description: "Attribuer la cote (Rayon / Boîte / Chemise) et éditer le bordereau de versement."
  },
  {
    id: "add_audit_note",
    label: "Ajouter des notes d'audit",
    category: "Workflow",
    description: "Consigner des annotations réglementaires dans l'historique d'audit chronologique."
  },
  {
    id: "manage_permissions",
    label: "Administrer les droits d'accès RBAC",
    category: "Administration",
    description: "Modifier la matrice des permissions et habilitations des postes SRSP."
  }
];

export const DEFAULT_ROLE_PERMISSIONS = {
  "Administrateur": [
    "view_dossiers", "create_dossier", "edit_dossier", "advance_step", 
    "validate_dossier", "reject_dossier", "archive_dossier", 
    "add_audit_note", "manage_permissions"
  ],
  "Chef Coordo": [
    "view_dossiers", "create_dossier", "edit_dossier", "advance_step", 
    "validate_dossier", "reject_dossier", "archive_dossier", 
    "add_audit_note", "manage_permissions"
  ],
  "Agent d'Accueil & Guichet": [
    "view_dossiers", "create_dossier", "edit_dossier", "advance_step", 
    "add_audit_note"
  ],
  "Chef de Service Visa": [
    "view_dossiers", "advance_step", "validate_dossier", "reject_dossier", 
    "add_audit_note"
  ],
  "Chef de Service Solde": [
    "view_dossiers", "edit_dossier", "advance_step", "validate_dossier", 
    "reject_dossier", "add_audit_note"
  ],
  "Chef de Service Pension": [
    "view_dossiers", "edit_dossier", "advance_step", "validate_dossier", 
    "reject_dossier", "add_audit_note"
  ],
  "Responsable des Archives": [
    "view_dossiers", "archive_dossier", "add_audit_note"
  ],
  "Agent Accueil": [
    "view_dossiers", "create_dossier", "edit_dossier", "advance_step", 
    "add_audit_note"
  ]
};

const STORAGE_KEY_RBAC = "srsp_rbac_permissions_v2";

export const getStoredRolePermissions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RBAC);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_ROLE_PERMISSIONS, ...parsed };
      }
    }
  } catch (e) {
    console.warn("Erreur lecture permissions RBAC:", e);
  }
  return DEFAULT_ROLE_PERMISSIONS;
};

export const saveStoredRolePermissions = (matrix) => {
  try {
    localStorage.setItem(STORAGE_KEY_RBAC, JSON.stringify(matrix));
    return true;
  } catch (e) {
    console.error("Erreur sauvegarde permissions RBAC:", e);
    return false;
  }
};

export const resetStoredRolePermissions = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_RBAC);
    return DEFAULT_ROLE_PERMISSIONS;
  } catch (e) {
    return DEFAULT_ROLE_PERMISSIONS;
  }
};

export const checkUserPermission = (user, requiredPermission, customMatrix = null) => {
  if (!user) return false;
  if (user.role === 'Administrateur') return true;

  const matrix = customMatrix || getStoredRolePermissions();
  const rolePerms = matrix[user.role];
  if (!rolePerms || !Array.isArray(rolePerms)) return false;

  return rolePerms.includes(requiredPermission);
};

// =====================================================================
// CLOISONNEMENT STRICT PAR DIVISION & RÔLE (SRSP ISOLEMENT DES SERVICES)
// =====================================================================

export const getUserDivision = (userOrRole) => {
  const role = typeof userOrRole === 'object' ? userOrRole?.role : userOrRole;
  if (!role) return null;
  const r = role.toLowerCase();
  if (r.includes('solde')) return 'Solde';
  if (r.includes('visa')) return 'Visa';
  if (r.includes('pension')) return 'Pension';
  return null; // Transversal : Admin, Chef Coordo, Guichet, Archives
};

export const canUserAccessTab = (user, tabId) => {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  
  if (role.includes('admin') || role.includes('coordo') || role.includes('direction')) return true;

  if (role.includes('solde')) {
    return ['dashboard', 'analyticsD3', 'solde', 'circuit', 'alertes', 'parametres'].includes(tabId);
  }
  if (role.includes('visa')) {
    return ['dashboard', 'analyticsD3', 'visa', 'circuit', 'alertes', 'parametres'].includes(tabId);
  }
  if (role.includes('pension')) {
    return ['dashboard', 'analyticsD3', 'pension', 'circuit', 'alertes', 'parametres'].includes(tabId);
  }
  if (role.includes('archive')) {
    return ['dashboard', 'archives', 'alertes', 'parametres'].includes(tabId);
  }
  if (role.includes('accueil') || role.includes('guichet')) {
    return ['dashboard', 'nouveauDossier', 'tousDossiers', 'suivi', 'alertes', 'parametres'].includes(tabId);
  }

  return true;
};

export const canUserViewDossier = (user, dossier) => {
  if (!user || !dossier) return false;
  const role = (user.role || '').toLowerCase();
  if (role.includes('admin') || role.includes('coordo') || role.includes('accueil') || role.includes('guichet')) {
    return true;
  }
  const filiere = (dossier.filiere || dossier.division || '').toLowerCase();
  if (role.includes('solde')) return filiere.includes('solde');
  if (role.includes('visa')) return filiere.includes('visa');
  if (role.includes('pension')) return filiere.includes('pension');
  if (role.includes('archive')) return dossier.etat === 'Validé' || dossier.etat === 'Archivé';
  return true;
};